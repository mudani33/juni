import Stripe from "stripe";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import prisma from "../db/client.js";
import { PlanName, PayoutStatus } from "@prisma/client";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

// Map plan name → Stripe price ID
const PLAN_PRICE_MAP: Record<PlanName, string> = {
  [PlanName.ESSENTIALS]: env.STRIPE_PRICE_ESSENTIALS,
  [PlanName.PREMIUM]: env.STRIPE_PRICE_PREMIUM,
  [PlanName.LEGACY]: env.STRIPE_PRICE_LEGACY,
};

export const StripeService = {
  // ── Family Subscriptions ─────────────────────────────────────────────────

  /** Create or retrieve a Stripe customer for a family */
  async getOrCreateCustomer(params: {
    email: string;
    name: string;
    familyId: string;
  }): Promise<string> {
    const family = await prisma.familyAccount.findUnique({
      where: { id: params.familyId },
      select: { stripeCustomerId: true },
    });

    if (family?.stripeCustomerId) {
      return family.stripeCustomerId;
    }

    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: { familyId: params.familyId },
    });

    await prisma.familyAccount.update({
      where: { id: params.familyId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  },

  /** Create a Stripe Checkout Session for subscription signup */
  async createCheckoutSession(params: {
    customerId: string;
    plan: PlanName;
    successUrl: string;
    cancelUrl: string;
    familyId: string;
  }): Promise<Stripe.Checkout.Session> {
    return stripe.checkout.sessions.create({
      customer: params.customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PLAN_PRICE_MAP[params.plan],
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: { familyId: params.familyId, plan: params.plan },
      },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      allow_promotion_codes: true,
    });
  },

  /** Create a Stripe Customer Portal session (manage / cancel subscription) */
  async createPortalSession(params: {
    customerId: string;
    returnUrl: string;
  }): Promise<Stripe.BillingPortal.Session> {
    return stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });
  },

  // ── Companion Payouts (Stripe Connect) ──────────────────────────────────

  /**
   * Create a Stripe Express account for a companion.
   * Stripe Connect Express accounts handle KYC, 1099s, and direct payouts.
   */
  async createConnectAccount(params: {
    email: string;
    firstName: string;
    lastName: string;
    companionId: string;
  }): Promise<string> {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: params.email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: false }, // Companions receive, not charge
      },
      business_type: "individual",
      individual: {
        first_name: params.firstName,
        last_name: params.lastName,
        email: params.email,
      },
      metadata: { companionId: params.companionId },
      settings: {
        payouts: {
          schedule: { interval: "manual" }, // Juni controls when payouts run
        },
      },
      tos_acceptance: { service_agreement: "recipient" },
    });

    await prisma.companionAccount.update({
      where: { id: params.companionId },
      data: {
        stripeAccountId: account.id,
        stripeAccountStatus: "pending",
      },
    });

    return account.id;
  },

  /** Generate onboarding link for companion to complete Stripe KYC */
  async createConnectAccountLink(params: {
    accountId: string;
    refreshUrl: string;
    returnUrl: string;
  }): Promise<string> {
    const link = await stripe.accountLinks.create({
      account: params.accountId,
      refresh_url: params.refreshUrl,
      return_url: params.returnUrl,
      type: "account_onboarding",
    });
    return link.url;
  },

  /**
   * Process bi-weekly payout for a companion.
   * Calculates gross earnings, deducts 10% platform fee, transfers net.
   */
  async processCompanionPayout(params: {
    companionId: string;
    stripeAccountId: string;
    periodStart: Date;
    periodEnd: Date;
  }): Promise<void> {
    // Find all completed, unpaid visits in the period
    const visits = await prisma.visit.findMany({
      where: {
        companionId: params.companionId,
        status: "COMPLETED",
        payoutId: null,
        scheduledAt: {
          gte: params.periodStart,
          lte: params.periodEnd,
        },
      },
    });

    if (visits.length === 0) {
      logger.info("No payable visits for companion in period", {
        companionId: params.companionId,
      });
      return;
    }

    // $26/hr base rate (cents)
    const RATE_CENTS_PER_HOUR = 2600;
    const PLATFORM_FEE_PCT = 0.1;

    const totalHours = visits.reduce((sum, v) => sum + (v.actualMinutes ?? v.durationMin) / 60, 0);
    const grossCents = Math.round(totalHours * RATE_CENTS_PER_HOUR);
    const feeCents = Math.round(grossCents * PLATFORM_FEE_PCT);
    const netCents = grossCents - feeCents;

    const period = `${params.periodStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${params.periodEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        companionId: params.companionId,
        period,
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
        grossAmountCents: grossCents,
        platformFeeCents: feeCents,
        netAmountCents: netCents,
        status: PayoutStatus.PROCESSING,
      },
    });

    // Link visits to payout
    await prisma.visit.updateMany({
      where: { id: { in: visits.map((v) => v.id) } },
      data: { payoutId: payout.id, billedHours: totalHours },
    });

    try {
      // Transfer to companion's Stripe Express account
      const transfer = await stripe.transfers.create({
        amount: netCents,
        currency: "usd",
        destination: params.stripeAccountId,
        description: `Juni payout — ${period}`,
        metadata: { payoutId: payout.id, companionId: params.companionId },
      });

      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          stripeTransferId: transfer.id,
          status: PayoutStatus.PAID,
          paidAt: new Date(),
        },
      });

      logger.info("Companion payout processed", {
        companionId: params.companionId,
        netCents,
        transferId: transfer.id,
      });
    } catch (err) {
      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: PayoutStatus.FAILED,
          failureReason: String(err),
        },
      });
      logger.error("Companion payout failed", { companionId: params.companionId, error: err });
      throw err;
    }
  },

  // ── Webhook Handling ────────────────────────────────────────────────────

  /** Verify Stripe webhook signature and return the event */
  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    return stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  },

  /** Handle subscription created/updated events */
  async handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
    const familyId = subscription.metadata["familyId"];
    const planName = subscription.metadata["plan"] as PlanName | undefined;

    if (!familyId || !planName) {
      logger.warn("Stripe subscription missing metadata", { subId: subscription.id });
      return;
    }

    await prisma.subscription.upsert({
      where: { stripeSubId: subscription.id },
      create: {
        familyId,
        stripeCustomerId: subscription.customer as string,
        stripeSubId: subscription.id,
        plan: planName,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      update: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  },

  /** Handle invoice payment success */
  async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    logger.info("Stripe invoice paid", {
      invoiceId: invoice.id,
      customerId: invoice.customer,
      amount: invoice.amount_paid,
    });
  },

  /** Handle invoice payment failure */
  async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    logger.warn("Stripe invoice payment failed", {
      invoiceId: invoice.id,
      customerId: invoice.customer,
    });
    // TODO: notify family via email, update subscription status
  },
};
