import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, requireFamily, requireAdmin } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { NotFoundError, BadRequestError } from "../middleware/errorHandler.js";
import prisma from "../db/client.js";
import { StripeService, stripe } from "../services/stripe.service.js";
import Stripe from "stripe";
import { PlanName } from "@prisma/client";
import { env } from "../config/env.js";

const router = Router();
router.use(authenticate);

// ── Family Billing ────────────────────────────────────────────────────────────

/** POST /api/billing/checkout — create Stripe Checkout session */
router.post(
  "/checkout",
  requireFamily,
  validateBody(
    z.object({
      plan: z.nativeEnum(PlanName),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const family = await prisma.familyAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        include: { user: { select: { email: true } } },
      });

      const customerId = await StripeService.getOrCreateCustomer({
        email: family.user.email,
        name: `${family.firstName} ${family.lastName}`,
        familyId: family.id,
      });

      const session = await StripeService.createCheckoutSession({
        customerId,
        plan: (req.body as { plan: PlanName }).plan,
        successUrl: `${env.FRONTEND_URL}/family?subscription=success`,
        cancelUrl: `${env.FRONTEND_URL}/family/billing?subscription=cancelled`,
        familyId: family.id,
      });

      res.json({ checkoutUrl: session.url });
    } catch (err) {
      next(err);
    }
  },
);

/** POST /api/billing/portal — Stripe Customer Portal (manage/cancel subscription) */
router.post(
  "/portal",
  requireFamily,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const family = await prisma.familyAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        select: { stripeCustomerId: true },
      });

      if (!family.stripeCustomerId) {
        throw new BadRequestError("No billing account found. Please subscribe first.");
      }

      const session = await StripeService.createPortalSession({
        customerId: family.stripeCustomerId,
        returnUrl: `${env.FRONTEND_URL}/family/billing`,
      });

      res.json({ portalUrl: session.url });
    } catch (err) {
      next(err);
    }
  },
);

/** GET /api/billing/subscription — current subscription status */
router.get(
  "/subscription",
  requireFamily,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const family = await prisma.familyAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        select: { id: true },
      });

      const subscription = await prisma.subscription.findFirst({
        where: { familyId: family.id, status: { in: ["active", "trialing", "past_due"] } },
        orderBy: { createdAt: "desc" },
      });

      res.json(subscription ?? null);
    } catch (err) {
      next(err);
    }
  },
);

/** GET /api/billing/invoices — list invoices from Stripe */
router.get(
  "/invoices",
  requireFamily,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const family = await prisma.familyAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        select: { stripeCustomerId: true },
      });

      if (!family.stripeCustomerId) {
        res.json([]);
        return;
      }

      const invoices = await stripe.invoices.list({
        customer: family.stripeCustomerId,
        limit: 24,
      });

      const formatted = invoices.data.map((inv: Stripe.Invoice) => ({
        id: inv.id,
        date: new Date(inv.created * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        amount: `$${(inv.amount_paid / 100).toFixed(2)}`,
        status: inv.status,
        pdfUrl: inv.invoice_pdf,
      }));

      res.json(formatted);
    } catch (err) {
      next(err);
    }
  },
);

// ── Admin — trigger companion payouts ─────────────────────────────────────────

/** POST /api/billing/payouts/run — run payouts for all active companions (admin) */
router.post(
  "/payouts/run",
  requireAdmin,
  validateBody(
    z.object({
      periodStart: z.string().datetime(),
      periodEnd: z.string().datetime(),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { periodStart, periodEnd } = req.body as { periodStart: string; periodEnd: string };

      const companions = await prisma.companionAccount.findMany({
        where: {
          status: "ACTIVE",
          stripeAccountId: { not: null },
          stripeAccountStatus: "active",
        },
        select: { id: true, stripeAccountId: true, firstName: true, lastName: true },
      });

      const results = await Promise.allSettled(
        companions.map((c) =>
          StripeService.processCompanionPayout({
            companionId: c.id,
            stripeAccountId: c.stripeAccountId!,
            periodStart: new Date(periodStart),
            periodEnd: new Date(periodEnd),
          }),
        ),
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      res.json({ processed: companions.length, succeeded, failed });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
