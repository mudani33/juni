import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, requireFamily } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { NotFoundError, ForbiddenError } from "../middleware/errorHandler.js";
import prisma from "../db/client.js";

const router = Router();
router.use(authenticate, requireFamily);

const idParam = z.object({ id: z.string().cuid() });

// ── Profile ──────────────────────────────────────────────────────────────────

/** GET /api/families/me — get current family profile */
router.get("/me", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const family = await prisma.familyAccount.findUniqueOrThrow({
      where: { userId: req.user!.sub },
      include: {
        seniors: {
          include: {
            companion: {
              include: { user: { select: { email: true } } },
            },
            matches: {
              where: { status: { in: ["PROPOSED", "ACTIVE"] } },
              include: {
                companion: {
                  include: { user: { select: { email: true } } },
                },
              },
              orderBy: { kindredScore: "desc" },
            },
          },
        },
        subscriptions: {
          where: { status: { in: ["active", "trialing"] } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    res.json(family);
  } catch (err) {
    next(err);
  }
});

/** PATCH /api/families/me — update family profile */
router.patch(
  "/me",
  validateBody(
    z.object({
      firstName: z.string().min(1).max(100).trim().optional(),
      lastName: z.string().min(1).max(100).trim().optional(),
      phone: z.string().optional(),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const family = await prisma.familyAccount.update({
        where: { userId: req.user!.sub },
        data: req.body as { firstName?: string; lastName?: string; phone?: string },
        select: { id: true, firstName: true, lastName: true, phone: true },
      });
      res.json(family);
    } catch (err) {
      next(err);
    }
  },
);

// ── Seniors ──────────────────────────────────────────────────────────────────

/** GET /api/families/seniors — list seniors for this family */
router.get("/seniors", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const family = await prisma.familyAccount.findUniqueOrThrow({
      where: { userId: req.user!.sub },
      select: { id: true },
    });

    const seniors = await prisma.senior.findMany({
      where: { familyId: family.id },
      include: {
        companion: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            interests: true,
            status: true,
          },
        },
      },
    });
    res.json(seniors);
  } catch (err) {
    next(err);
  }
});

/** GET /api/families/seniors/:id */
router.get(
  "/seniors/:id",
  validateParams(idParam),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const family = await prisma.familyAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        select: { id: true },
      });
      const senior = await prisma.senior.findFirst({
        where: { id: req.params["id"] as string, familyId: family.id },
        include: {
          companion: true,
          visits: {
            orderBy: { scheduledAt: "desc" },
            take: 10,
            select: {
              id: true, scheduledAt: true, visitType: true, status: true,
              mood: true, activities: true, bloom: true,
              companion: { select: { firstName: true, lastName: true } },
            },
          },
          matches: {
            where: { status: { in: ["PROPOSED", "ACTIVE"] } },
            include: {
              companion: {
                select: {
                  id: true, firstName: true, lastName: true,
                  interests: true, availability: true, city: true, state: true,
                },
              },
            },
            orderBy: { kindredScore: "desc" },
          },
        },
      });

      if (!senior) throw new NotFoundError("Senior");
      res.json(senior);
    } catch (err) {
      next(err);
    }
  },
);

const updateSeniorSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  nickname: z.string().max(100).trim().optional(),
  age: z.number().int().min(18).max(130).optional(),
  relationship: z.string().optional(),
  livingSituation: z.string().optional(),
  location: z.string().optional(),
  languages: z.array(z.string()).optional(),
  personality: z.record(z.number()).optional(),
  interests: z.array(z.string()).optional(),
  socialStyle: z.array(z.string()).optional(),
  eraPreference: z.number().int().min(0).max(5).optional(),
  conditions: z.array(z.string()).optional(),
  visitTimes: z.string().optional(),
  visitFrequency: z.string().optional(),
  visitLength: z.string().optional(),
  lifeChanges: z.array(z.string()).optional(),
  bringsJoy: z.string().max(2000).optional(),
  struggles: z.string().max(2000).optional(),
  sensitiveTopics: z.string().max(2000).optional(),
  goals: z.array(z.string()).optional(),
  wish: z.string().max(2000).optional(),
  legacyStory: z.string().max(5000).optional(),
  companionQualities: z.array(z.string()).optional(),
  genderPref: z.string().optional(),
  agePref: z.string().optional(),
  anythingElse: z.string().max(1000).optional(),
});

/** PATCH /api/families/seniors/:id — update senior profile (also saves vibe check data) */
router.patch(
  "/seniors/:id",
  validateParams(idParam),
  validateBody(updateSeniorSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const family = await prisma.familyAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        select: { id: true },
      });
      const senior = await prisma.senior.findFirst({
        where: { id: req.params["id"] as string, familyId: family.id },
      });
      if (!senior) throw new NotFoundError("Senior");

      const updated = await prisma.senior.update({
        where: { id: req.params["id"] as string },
        data: req.body as z.infer<typeof updateSeniorSchema>,
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// ── Matches ──────────────────────────────────────────────────────────────────

/** POST /api/families/seniors/:id/request-matches — trigger matching algorithm */
router.post(
  "/seniors/:id/request-matches",
  validateParams(idParam),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const family = await prisma.familyAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        select: { id: true },
      });
      const senior = await prisma.senior.findFirst({
        where: { id: req.params["id"] as string, familyId: family.id },
      });
      if (!senior) throw new NotFoundError("Senior");

      const { MatchingService } = await import("../services/matching.service.js");
      const matches = await MatchingService.findMatchesForSenior(senior.id);
      await MatchingService.proposeMatches(senior.id, matches);

      res.json({ proposed: matches.length, matches });
    } catch (err) {
      next(err);
    }
  },
);

/** POST /api/families/matches/:matchId/accept */
router.post(
  "/matches/:matchId/accept",
  validateParams(z.object({ matchId: z.string().cuid() })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { MatchingService } = await import("../services/matching.service.js");
      await MatchingService.acceptMatch(req.params["matchId"] as string, req.user!.sub);
      res.json({ message: "Match accepted" });
    } catch (err) {
      next(err);
    }
  },
);

/** POST /api/families/matches/:matchId/reject */
router.post(
  "/matches/:matchId/reject",
  validateParams(z.object({ matchId: z.string().cuid() })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { MatchingService } = await import("../services/matching.service.js");
      await MatchingService.rejectMatch(req.params["matchId"] as string, req.user!.sub);
      res.json({ message: "Match rejected" });
    } catch (err) {
      next(err);
    }
  },
);

// ── Visits ───────────────────────────────────────────────────────────────────

/** GET /api/families/seniors/:id/visits */
router.get(
  "/seniors/:id/visits",
  validateParams(idParam),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const family = await prisma.familyAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        select: { id: true },
      });
      const senior = await prisma.senior.findFirst({
        where: { id: req.params["id"] as string, familyId: family.id },
      });
      if (!senior) throw new NotFoundError("Senior");

      const visits = await prisma.visit.findMany({
        where: { seniorId: senior.id },
        orderBy: { scheduledAt: "desc" },
        include: {
          companion: { select: { firstName: true, lastName: true } },
        },
      });
      res.json(visits);
    } catch (err) {
      next(err);
    }
  },
);

/** POST /api/families/seniors/:id/visits — request a visit */
router.post(
  "/seniors/:id/visits",
  validateParams(idParam),
  validateBody(
    z.object({
      scheduledAt: z.string().datetime(),
      durationMin: z.number().int().min(60).max(480),
      visitType: z.enum(["Regular visit", "Legacy recording", "Outdoor activity", "Medical accompaniment"]),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const family = await prisma.familyAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        select: { id: true },
      });
      const senior = await prisma.senior.findFirst({
        where: { id: req.params["id"] as string, familyId: family.id },
      });
      if (!senior) throw new NotFoundError("Senior");
      if (!senior.companionId) throw new ForbiddenError("No active companion assigned to this senior");

      const body = req.body as { scheduledAt: string; durationMin: number; visitType: string };
      const visit = await prisma.visit.create({
        data: {
          seniorId: senior.id,
          companionId: senior.companionId,
          scheduledAt: new Date(body.scheduledAt),
          durationMin: body.durationMin,
          visitType: body.visitType,
          status: "SCHEDULED",
        },
      });
      res.status(201).json(visit);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
