import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, requireFamily, requireAdmin } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { NotFoundError } from "../middleware/errorHandler.js";
import prisma from "../db/client.js";

const router = Router();
router.use(authenticate);

// ── Family sends a message ────────────────────────────────────────────────────

/** POST /api/messages — family sends a message to Juni team or companion */
router.post(
  "/",
  requireFamily,
  validateBody(
    z.object({
      toType: z.enum(["juni_team", "companion"]),
      type: z.enum(["feedback", "concern", "schedule", "request"]),
      subject: z.string().max(200).optional(),
      body: z.string().min(1).max(5000),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const family = await prisma.familyAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        select: { id: true },
      });

      const body = req.body as {
        toType: string;
        type: string;
        subject?: string;
        body: string;
      };

      const message = await prisma.message.create({
        data: {
          fromUserId: req.user!.sub,
          familyId: family.id,
          toType: body.toType,
          type: body.type,
          subject: body.subject,
          body: body.body,
        },
      });

      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  },
);

/** GET /api/messages — get message history for the family */
router.get(
  "/",
  requireFamily,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const family = await prisma.familyAccount.findUniqueOrThrow({
        where: { userId: req.user!.sub },
        select: { id: true },
      });

      const messages = await prisma.message.findMany({
        where: { familyId: family.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      res.json(messages);
    } catch (err) {
      next(err);
    }
  },
);

// ── Admin — view and reply to messages ────────────────────────────────────────

/** GET /api/messages/admin/inbox — admin message inbox */
router.get(
  "/admin/inbox",
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messages = await prisma.message.findMany({
        where: { readAt: null },
        orderBy: { createdAt: "asc" },
        include: {
          from: { select: { email: true, role: true } },
          family: { select: { firstName: true, lastName: true } },
        },
      });
      res.json(messages);
    } catch (err) {
      next(err);
    }
  },
);

/** POST /api/messages/:id/reply — admin replies to a message */
router.post(
  "/:id/reply",
  requireAdmin,
  validateParams(z.object({ id: z.string().cuid() })),
  validateBody(z.object({ reply: z.string().min(1).max(5000) })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const message = await prisma.message.findUnique({ where: { id: req.params["id"] as string } });
      if (!message) throw new NotFoundError("Message");

      const { reply } = req.body as { reply: string };
      const updated = await prisma.message.update({
        where: { id: message.id },
        data: {
          reply,
          repliedAt: new Date(),
          repliedBy: req.user!.sub,
          readAt: new Date(),
        },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
