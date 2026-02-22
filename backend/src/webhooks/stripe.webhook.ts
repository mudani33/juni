import { Router, Request, Response, NextFunction } from "express";
import { StripeService } from "../services/stripe.service.js";
import { logger } from "../lib/logger.js";
import Stripe from "stripe";
import prisma from "../db/client.js";

/**
 * Stripe Webhook Handler — /webhooks/stripe
 *
 * IMPORTANT: This route must receive the raw body (not JSON-parsed).
 * Mount BEFORE express.json() or use express.raw() on this path.
 * Stripe verifies the webhook signature using the raw body.
 */
const router = Router();

router.post(
  "/",
  async (req: Request, res: Response, _next: NextFunction) => {
    const signature = req.headers["stripe-signature"];

    if (!signature || typeof signature !== "string") {
      logger.warn("Stripe webhook: missing signature");
      res.status(400).json({ error: "Missing stripe-signature header" });
      return;
    }

    let event: Stripe.Event;
    try {
      // req.body is a raw Buffer here (express.raw middleware applied at mount)
      event = StripeService.constructWebhookEvent(req.body as Buffer, signature);
    } catch (err) {
      logger.warn("Stripe webhook signature verification failed", { error: err });
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    logger.info("Stripe webhook received", { type: event.type, id: event.id });

    try {
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          await StripeService.handleSubscriptionChange(event.data.object as Stripe.Subscription);
          break;

        case "invoice.payment_succeeded":
          await StripeService.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;

        case "invoice.payment_failed":
          await StripeService.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case "account.updated": {
          // Companion Stripe Connect account status updated
          const account = event.data.object as Stripe.Account;
          const isActive =
            account.charges_enabled &&
            account.payouts_enabled &&
            account.details_submitted;

          if (account.metadata?.["companionId"]) {
            await prisma.companionAccount.updateMany({
              where: { stripeAccountId: account.id },
              data: { stripeAccountStatus: isActive ? "active" : "restricted" },
            });
          }
          break;
        }

        case "transfer.created":
          logger.info("Stripe transfer created", {
            transferId: (event.data.object as Stripe.Transfer).id,
          });
          break;

        default: {
          // Handle transfer.failed and other events not in Stripe's type union
          const eventType = (event as { type: string }).type;
          if (eventType === "transfer.failed") {
            logger.error("Stripe transfer failed", {
              transferId: (event.data.object as Stripe.Transfer).id,
            });
          } else {
            logger.debug("Unhandled Stripe event", { type: eventType });
          }
        }
      }

      // Stripe expects 2xx within a few seconds
      res.json({ received: true });
    } catch (err) {
      logger.error("Error processing Stripe webhook", { type: event.type, error: err });
      // Return 500 so Stripe retries
      res.status(500).json({ error: "Webhook processing failed" });
    }
  },
);

export default router;
