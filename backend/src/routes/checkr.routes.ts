import { Router, Request, Response, NextFunction } from "express";
import { authenticate, requireCompanionOrAdmin } from "../middleware/auth.js";
import { NotFoundError } from "../middleware/errorHandler.js";
import prisma from "../db/client.js";
import { CheckrService } from "../services/checkr.service.js";

/**
 * Checkr Proxy Routes — /api/checkr/*
 *
 * All Checkr API calls are proxied through here. The Checkr API key
 * is NEVER sent to the frontend. All requests are authenticated.
 */
const router = Router();
router.use(authenticate, requireCompanionOrAdmin);

/** GET /api/checkr/candidates/:id */
router.get(
  "/candidates/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidate = await CheckrService["checkrFetch" as keyof typeof CheckrService];
      // We use the service method exposed indirectly — companion can only fetch their own
      const companion = await prisma.companionAccount.findFirst({
        where: { userId: req.user!.sub, checkrCandidateId: req.params["id"] as string },
      });
      if (!companion) throw new NotFoundError("Candidate");

      const data = await (CheckrService as unknown as { getCandidate: (id: string) => Promise<unknown> }).getCandidate?.(
        req.params["id"] as string,
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
);

/** GET /api/checkr/reports/:id */
router.get(
  "/reports/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companion = await prisma.companionAccount.findFirst({
        where: { userId: req.user!.sub, checkrReportId: req.params["id"] as string },
      });
      if (!companion) throw new NotFoundError("Report");

      const report = await CheckrService.getReport(req.params["id"] as string);
      res.json(report);
    } catch (err) {
      next(err);
    }
  },
);

/** GET /api/checkr/reports/:id/eta */
router.get(
  "/reports/:id/eta",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companion = await prisma.companionAccount.findFirst({
        where: { userId: req.user!.sub, checkrReportId: req.params["id"] as string },
      });
      if (!companion) throw new NotFoundError("Report");

      const eta = await CheckrService.getReportETA(req.params["id"] as string);
      res.json(eta);
    } catch (err) {
      next(err);
    }
  },
);

/** GET /api/checkr/invitations/:id */
router.get(
  "/invitations/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companion = await prisma.companionAccount.findFirst({
        where: { userId: req.user!.sub, checkrInvitationId: req.params["id"] as string },
      });
      if (!companion) throw new NotFoundError("Invitation");

      const invitation = await CheckrService.getInvitation(req.params["id"] as string);
      res.json(invitation);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
