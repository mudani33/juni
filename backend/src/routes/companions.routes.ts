import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, requireCompanion, requireAdmin, requireCompanionOrAdmin } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { NotFoundError, ForbiddenError } from "../middleware/errorHandler.js";
import prisma from "../db/client.js";
import { CheckrService } from "../services/checkr.service.js";
import { StripeService } from "../services/stripe.service.js";
import { AIService } from "../services/ai.service.js";
import { CompanionStatus } from "@prisma/client";
import { env } from "../config/env.js";

const router = Router();
router.use(authenticate);

const idParam = z.object({ id: z.string().cuid() });

// ── Profile ──────────────────────────────────────────────────────────────────

/** GET /api/companions/me */
router.get(
  "/me",
  requireCompanion,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companion = await prisma.companionAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        include: {
          user: { select: { email: true, emailVerified: true } },
          seniors: {
            select: {
              id: true, firstName: true, nickname: true, age: true,
              interests: true, personality: true, conditions: true,
              visitTimes: true, sensitiveTopics: true,
            },
          },
          payouts: {
            orderBy: { createdAt: "desc" },
            take: 6,
          },
        },
      });
      res.json(companion);
    } catch (err) {
      next(err);
    }
  },
);

/** PATCH /api/companions/me */
router.patch(
  "/me",
  requireCompanion,
  validateBody(
    z.object({
      phone: z.string().optional(),
      city: z.string().optional(),
      state: z.string().length(2).optional(),
      interests: z.array(z.string()).optional(),
      availability: z.string().optional(),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companion = await prisma.companionAccount.update({
        where: { userId: req.user!.sub },
        data: req.body as { phone?: string; city?: string; state?: string; interests?: string[]; availability?: string },
        select: { id: true, firstName: true, lastName: true, phone: true, city: true, state: true },
      });
      res.json(companion);
    } catch (err) {
      next(err);
    }
  },
);

// ── Background Check ─────────────────────────────────────────────────────────

/** POST /api/companions/me/background-check/initiate — create Checkr candidate + invitation */
router.post(
  "/me/background-check/initiate",
  requireCompanion,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companion = await prisma.companionAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        include: { user: { select: { email: true } } },
      });

      if (companion.checkrCandidateId) {
        // Already initiated — return existing invitation status
        if (companion.checkrInvitationId) {
          const invitation = await CheckrService.getInvitation(companion.checkrInvitationId);
          res.json({ alreadyInitiated: true, invitation });
          return;
        }
      }

      // Create candidate
      const candidate = await CheckrService.createCandidate({
        firstName: companion.firstName,
        lastName: companion.lastName,
        email: companion.user.email,
        phone: companion.phone ?? undefined,
        dob: companion.dob ? companion.dob.toISOString().split("T")[0] : undefined,
        zipcode: companion.zipcode ?? undefined,
        companionId: companion.id,
      });

      // Create invitation
      const invitation = await CheckrService.createInvitation({
        candidateId: candidate.id,
        companionId: companion.id,
      });

      res.json({
        candidateId: candidate.id,
        invitationUrl: invitation.invitation_url,
        message: "Background check invitation sent. Complete it within 7 days.",
      });
    } catch (err) {
      next(err);
    }
  },
);

/** GET /api/companions/me/background-check/status */
router.get(
  "/me/background-check/status",
  requireCompanion,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companion = await prisma.companionAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        select: {
          checkrStatus: true,
          bgCheckResults: true,
          checkrReportId: true,
          checkrCandidateId: true,
          checkrInvitationId: true,
        },
      });

      // If report exists, fetch fresh ETA from Checkr
      let eta: unknown = null;
      if (companion.checkrReportId && companion.checkrStatus === "IN_PROGRESS") {
        try {
          eta = await CheckrService.getReportETA(companion.checkrReportId);
        } catch {
          // ETA unavailable — not critical
        }
      }

      res.json({ ...companion, eta });
    } catch (err) {
      next(err);
    }
  },
);

// ── Training ─────────────────────────────────────────────────────────────────

/** PATCH /api/companions/me/training — update module completion percentages */
router.patch(
  "/me/training",
  requireCompanion,
  validateBody(
    z.object({
      module: z.string().min(1).max(100),
      pct: z.number().int().min(0).max(100),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { module, pct } = req.body as { module: string; pct: number };
      const companion = await prisma.companionAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        select: { id: true, trainingProgress: true },
      });

      const current = (companion.trainingProgress as Record<string, number> | null) ?? {};
      current[module] = pct;

      const updated = await prisma.companionAccount.update({
        where: { id: companion.id },
        data: { trainingProgress: current },
        select: { trainingProgress: true },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// ── Seniors & Visit Prep ──────────────────────────────────────────────────────

/** GET /api/companions/me/seniors/:seniorId/visit-prep */
router.get(
  "/me/seniors/:seniorId/visit-prep",
  requireCompanion,
  validateParams(z.object({ seniorId: z.string().cuid() })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companion = await prisma.companionAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        select: { id: true },
      });

      const senior = await prisma.senior.findFirst({
        where: { id: req.params["seniorId"] as string, companionId: companion.id },
      });
      if (!senior) throw new NotFoundError("Senior");

      // Get last visit mood
      const lastVisit = await prisma.visit.findFirst({
        where: { seniorId: senior.id, status: "COMPLETED" },
        orderBy: { scheduledAt: "desc" },
        select: { mood: true, activities: true, bloom: true },
      });

      const prep = await AIService.generateVisitPrep({
        seniorName: senior.firstName,
        seniorNickname: senior.nickname,
        seniorAge: senior.age,
        interests: senior.interests,
        lifeChanges: senior.lifeChanges,
        sensitiveTopics: senior.sensitiveTopics,
        lastVisitMood: lastVisit?.mood ?? null,
        recentTopics:
          lastVisit?.bloom && typeof lastVisit.bloom === "object" && "topics" in lastVisit.bloom
            ? (lastVisit.bloom as { topics: string[] }).topics
            : [],
      });

      res.json(prep);
    } catch (err) {
      next(err);
    }
  },
);

// ── Visits ───────────────────────────────────────────────────────────────────

/** GET /api/companions/me/visits */
router.get(
  "/me/visits",
  requireCompanion,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companion = await prisma.companionAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        select: { id: true },
      });

      const visits = await prisma.visit.findMany({
        where: { companionId: companion.id },
        orderBy: { scheduledAt: "asc" },
        include: {
          senior: { select: { id: true, firstName: true, nickname: true, age: true } },
        },
      });
      res.json(visits);
    } catch (err) {
      next(err);
    }
  },
);

// ── Earnings ─────────────────────────────────────────────────────────────────

/** GET /api/companions/me/payouts */
router.get(
  "/me/payouts",
  requireCompanion,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companion = await prisma.companionAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        select: { id: true },
      });

      const payouts = await prisma.payout.findMany({
        where: { companionId: companion.id },
        orderBy: { periodStart: "desc" },
        include: { visits: { select: { id: true, scheduledAt: true, actualMinutes: true } } },
      });
      res.json(payouts);
    } catch (err) {
      next(err);
    }
  },
);

/** POST /api/companions/me/stripe-connect/onboard — start Stripe Express onboarding */
router.post(
  "/me/stripe-connect/onboard",
  requireCompanion,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companion = await prisma.companionAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        include: { user: { select: { email: true } } },
      });

      let accountId = companion.stripeAccountId;
      if (!accountId) {
        accountId = await StripeService.createConnectAccount({
          email: companion.user.email,
          firstName: companion.firstName,
          lastName: companion.lastName,
          companionId: companion.id,
        });
      }

      const onboardingUrl = await StripeService.createConnectAccountLink({
        accountId,
        refreshUrl: `${env.FRONTEND_URL}/companion?stripe=refresh`,
        returnUrl: `${env.FRONTEND_URL}/companion?stripe=complete`,
      });

      res.json({ onboardingUrl });
    } catch (err) {
      next(err);
    }
  },
);

// ── Admin-only ────────────────────────────────────────────────────────────────

/** GET /api/companions — list all companions (admin only) */
router.get(
  "/",
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.query as { status?: string };
      const companions = await prisma.companionAccount.findMany({
        where: status ? { status: status as CompanionStatus } : undefined,
        include: { user: { select: { email: true, emailVerified: true } } },
        orderBy: { createdAt: "desc" },
      });
      res.json(companions);
    } catch (err) {
      next(err);
    }
  },
);

/** PATCH /api/companions/:id/status — update companion status (admin only) */
router.patch(
  "/:id/status",
  requireAdmin,
  validateParams(idParam),
  validateBody(z.object({ status: z.nativeEnum(CompanionStatus) })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body as { status: CompanionStatus };
      const companion = await prisma.companionAccount.update({
        where: { id: req.params["id"] as string },
        data: { status },
        select: { id: true, firstName: true, lastName: true, status: true },
      });
      res.json(companion);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
