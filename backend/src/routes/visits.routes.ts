import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, requireCompanion, requireFamily, requireFamilyOrAdmin } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../middleware/errorHandler.js";
import prisma from "../db/client.js";
import { AIService } from "../services/ai.service.js";
import { TwilioService } from "../services/twilio.service.js";
import { EmailService } from "../services/email.service.js";
import { VisitStatus } from "@prisma/client";

const router = Router();
router.use(authenticate);

const idParam = z.object({ id: z.string().cuid() });

// ── Check-in ─────────────────────────────────────────────────────────────────

/** POST /api/visits/:id/check-in — companion marks arrival (GPS optional) */
router.post(
  "/:id/check-in",
  requireCompanion,
  validateParams(idParam),
  validateBody(
    z.object({
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companion = await prisma.companionAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        select: { id: true, firstName: true, lastName: true, phone: true },
      });
      const visit = await prisma.visit.findFirst({
        where: { id: req.params["id"] as string, companionId: companion.id },
        include: {
          senior: {
            include: {
              family: {
                include: { user: { select: { email: true } } },
              },
            },
          },
        },
      });
      if (!visit) throw new NotFoundError("Visit");
      if (visit.status !== VisitStatus.SCHEDULED && visit.status !== VisitStatus.CONFIRMED) {
        throw new BadRequestError("Visit cannot be checked into in its current state");
      }

      const body = req.body as { latitude?: number; longitude?: number };
      await prisma.visit.update({
        where: { id: visit.id },
        data: {
          status: VisitStatus.IN_PROGRESS,
          checkInAt: new Date(),
          checkInLat: body.latitude,
          checkInLng: body.longitude,
        },
      });

      // Notify family
      const seniorName = visit.senior.nickname ?? visit.senior.firstName;
      const companionName = `${companion.firstName} ${companion.lastName}`;
      if (visit.senior.family.phone) {
        await TwilioService.sendCheckInNotification({
          familyPhone: visit.senior.family.phone,
          companionName,
          seniorName,
        });
      }

      res.json({ message: "Checked in successfully", checkInAt: new Date() });
    } catch (err) {
      next(err);
    }
  },
);

// ── Check-out ────────────────────────────────────────────────────────────────

/** POST /api/visits/:id/check-out — companion marks visit end + submits notes */
router.post(
  "/:id/check-out",
  requireCompanion,
  validateParams(idParam),
  validateBody(
    z.object({
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      mood: z.enum(["Joyful", "Warm", "Nostalgic", "Reflective", "Calm", "Energetic", "Tired", "Anxious"]),
      activities: z.array(z.string()).min(1).max(20),
      notes: z.string().min(10).max(5000),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companion = await prisma.companionAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        select: { id: true, firstName: true, lastName: true, phone: true },
      });

      const visit = await prisma.visit.findFirst({
        where: { id: req.params["id"] as string, companionId: companion.id },
        include: {
          senior: {
            include: {
              family: {
                include: { user: { select: { email: true } } },
              },
            },
          },
        },
      });
      if (!visit) throw new NotFoundError("Visit");
      if (visit.status !== VisitStatus.IN_PROGRESS) {
        throw new BadRequestError("Visit must be in progress to check out");
      }
      if (!visit.checkInAt) throw new BadRequestError("Visit has not been checked in");

      const body = req.body as { latitude?: number; longitude?: number; mood: string; activities: string[]; notes: string };
      const now = new Date();
      const actualMinutes = Math.round((now.getTime() - visit.checkInAt.getTime()) / 60000);

      // Update visit with notes
      await prisma.visit.update({
        where: { id: visit.id },
        data: {
          status: VisitStatus.COMPLETED,
          checkOutAt: now,
          checkOutLat: body.latitude,
          checkOutLng: body.longitude,
          mood: body.mood,
          activities: body.activities,
          notes: body.notes,
          actualMinutes,
        },
      });

      const seniorName = visit.senior.nickname ?? visit.senior.firstName;
      const companionName = `${companion.firstName} ${companion.lastName}`;

      // Notify family of checkout
      if (visit.senior.family.phone) {
        await TwilioService.sendCheckOutNotification({
          familyPhone: visit.senior.family.phone,
          companionName,
          seniorName,
          durationMinutes: actualMinutes,
        });
      }

      // Generate Daily Bloom async (don't block the response)
      generateBloomAsync(visit.id, {
        seniorName: visit.senior.firstName,
        seniorNickname: visit.senior.nickname,
        companionName,
        visitDate: now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        visitType: visit.visitType,
        activities: body.activities,
        rawNotes: body.notes,
        seniorInterests: visit.senior.interests,
        seniorConditions: visit.senior.conditions,
        familyEmail: visit.senior.family.user.email,
        familyFirstName: visit.senior.family.firstName,
        portalUrl: `${process.env["FRONTEND_URL"]}/family`,
      }).catch(() => {});

      res.json({ message: "Visit completed", actualMinutes });
    } catch (err) {
      next(err);
    }
  },
);

// ── Cancel ────────────────────────────────────────────────────────────────────

/** POST /api/visits/:id/cancel */
router.post(
  "/:id/cancel",
  validateParams(idParam),
  validateBody(z.object({ reason: z.string().max(500).optional() })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const visit = await prisma.visit.findUnique({ where: { id: req.params["id"] as string } });
      if (!visit) throw new NotFoundError("Visit");

      if (visit.status === VisitStatus.COMPLETED || visit.status === VisitStatus.CANCELLED) {
        throw new BadRequestError("Visit cannot be cancelled in its current state");
      }

      const { reason } = req.body as { reason?: string };
      await prisma.visit.update({
        where: { id: visit.id },
        data: {
          status: VisitStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelledBy: req.user!.sub,
          cancellationReason: reason,
        },
      });

      res.json({ message: "Visit cancelled" });
    } catch (err) {
      next(err);
    }
  },
);

// ── Read a single visit (family or companion) ─────────────────────────────────

/** GET /api/visits/:id */
router.get(
  "/:id",
  validateParams(idParam),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const visit = await prisma.visit.findUnique({
        where: { id: req.params["id"] as string },
        include: {
          senior: { select: { id: true, firstName: true, nickname: true, familyId: true } },
          companion: { select: { id: true, firstName: true, lastName: true, userId: true } },
        },
      });
      if (!visit) throw new NotFoundError("Visit");

      // Verify requester is the companion or the family who owns the senior
      const userId = req.user!.sub;
      const isCompanion = visit.companion.userId === userId;
      const isFamily = await prisma.senior.findFirst({
        where: { id: visit.seniorId, family: { userId } },
      });
      if (!isCompanion && !isFamily) throw new ForbiddenError();

      res.json(visit);
    } catch (err) {
      next(err);
    }
  },
);

// ── AI Trend Analysis (family) ────────────────────────────────────────────────

/** GET /api/visits/seniors/:seniorId/trends */
router.get(
  "/seniors/:seniorId/trends",
  requireFamilyOrAdmin,
  validateParams(z.object({ seniorId: z.string().cuid() })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const senior = await prisma.senior.findFirst({
        where: { id: req.params["seniorId"] as string, family: { userId: req.user!.sub } },
      });
      if (!senior) throw new NotFoundError("Senior");

      const visits = await prisma.visit.findMany({
        where: { seniorId: senior.id, status: "COMPLETED" },
        orderBy: { scheduledAt: "desc" },
        take: 30,
        select: { scheduledAt: true, bloom: true },
      });

      const blooms = visits
        .filter((v) => v.bloom)
        .map((v) => {
          const b = v.bloom as { sentiment: number; mood: string; topics: string[] };
          return {
            date: v.scheduledAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            sentiment: b.sentiment,
            mood: b.mood,
            topics: b.topics,
          };
        });

      const trends = await AIService.generateTrendInsights({
        seniorName: senior.nickname ?? senior.firstName,
        blooms,
      });

      res.json(trends);
    } catch (err) {
      next(err);
    }
  },
);

export default router;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function generateBloomAsync(
  visitId: string,
  params: {
    seniorName: string;
    seniorNickname?: string | null;
    companionName: string;
    visitDate: string;
    visitType: string;
    activities: string[];
    rawNotes: string;
    seniorInterests: string[];
    seniorConditions: string[];
    familyEmail: string;
    familyFirstName: string;
    portalUrl: string;
  },
): Promise<void> {
  const bloom = await AIService.generateDailyBloom(params);

  await prisma.visit.update({
    where: { id: visitId },
    data: { bloom: bloom as object, bloomGeneratedAt: new Date() },
  });

  // Email bloom digest to family
  await EmailService.sendBloomDigest({
    to: params.familyEmail,
    familyFirstName: params.familyFirstName,
    seniorName: params.seniorName,
    companionName: params.companionName,
    mood: bloom.mood,
    summary: bloom.summary,
    highlights: bloom.highlights,
    portalUrl: params.portalUrl,
  });
}
