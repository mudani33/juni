import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validateParams } from "../middleware/validate.js";
import prisma from "../db/client.js";

const router = Router();
router.use(authenticate, requireAdmin);

// ── Stats overview ────────────────────────────────────────────────────────────

/** GET /api/admin/stats */
router.get("/stats", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      totalFamilies,
      totalCompanions,
      activeCompanions,
      pendingCompanions,
      totalVisits,
      visitsThisWeek,
      completedVisits,
      unreadMessages,
      activeSubscriptions,
    ] = await Promise.all([
      prisma.familyAccount.count(),
      prisma.companionAccount.count(),
      prisma.companionAccount.count({ where: { status: "ACTIVE" } }),
      prisma.companionAccount.count({ where: { status: "APPLIED" } }),
      prisma.visit.count(),
      prisma.visit.count({ where: { scheduledAt: { gte: weekAgo } } }),
      prisma.visit.count({ where: { status: "COMPLETED" } }),
      prisma.message.count({ where: { readAt: null } }),
      prisma.subscription.count({ where: { status: { in: ["active", "trialing"] } } }),
    ]);

    res.json({
      totalFamilies,
      totalCompanions,
      activeCompanions,
      pendingCompanions,
      totalVisits,
      visitsThisWeek,
      completedVisits,
      unreadMessages,
      activeSubscriptions,
    });
  } catch (err) {
    next(err);
  }
});

// ── Families ──────────────────────────────────────────────────────────────────

/** GET /api/admin/families */
router.get("/families", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const families = await prisma.familyAccount.findMany({
      include: {
        user: { select: { email: true, emailVerified: true, createdAt: true } },
        seniors: { select: { id: true, firstName: true, age: true } },
        subscriptions: {
          where: { status: { in: ["active", "trialing", "past_due"] } },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { plan: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(families);
  } catch (err) {
    next(err);
  }
});

// ── Companions ────────────────────────────────────────────────────────────────

/** GET /api/admin/companions */
router.get("/companions", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query as { status?: string };
    const companions = await prisma.companionAccount.findMany({
      where: status ? { status: status as never } : undefined,
      include: {
        user: { select: { email: true, emailVerified: true, createdAt: true } },
        _count: { select: { seniors: true, payouts: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(companions);
  } catch (err) {
    next(err);
  }
});

/** PATCH /api/admin/companions/:id/status */
router.patch(
  "/companions/:id/status",
  validateParams(z.object({ id: z.string().cuid() })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body as { status: string };
      const companion = await prisma.companionAccount.update({
        where: { id: req.params["id"] as string },
        data: { status: status as never },
        select: { id: true, firstName: true, lastName: true, status: true },
      });
      res.json(companion);
    } catch (err) {
      next(err);
    }
  },
);

// ── Visits ────────────────────────────────────────────────────────────────────

/** GET /api/admin/visits */
router.get("/visits", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, limit } = req.query as { status?: string; limit?: string };
    const visits = await prisma.visit.findMany({
      where: status ? { status: status as never } : undefined,
      include: {
        senior: {
          select: {
            firstName: true,
            nickname: true,
            family: { select: { firstName: true, lastName: true } },
          },
        },
        companion: { select: { firstName: true, lastName: true } },
      },
      orderBy: { scheduledAt: "desc" },
      take: limit ? Math.min(parseInt(limit, 10), 200) : 100,
    });
    res.json(visits);
  } catch (err) {
    next(err);
  }
});

// ── Messages inbox ────────────────────────────────────────────────────────────

/** GET /api/admin/inbox */
router.get("/inbox", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        from: { select: { email: true, role: true } },
        family: { select: { firstName: true, lastName: true } },
      },
    });
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

/** POST /api/admin/inbox/:id/reply */
router.post(
  "/inbox/:id/reply",
  validateParams(z.object({ id: z.string().cuid() })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reply } = req.body as { reply: string };
      const message = await prisma.message.update({
        where: { id: req.params["id"] as string },
        data: {
          reply,
          repliedAt: new Date(),
          repliedBy: req.user!.sub,
          readAt: new Date(),
        },
      });
      res.json(message);
    } catch (err) {
      next(err);
    }
  },
);

// ── Payouts ───────────────────────────────────────────────────────────────────

/** GET /api/admin/payouts */
router.get("/payouts", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const payouts = await prisma.payout.findMany({
      include: {
        companion: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(payouts);
  } catch (err) {
    next(err);
  }
});

export default router;
