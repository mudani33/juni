import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { uploadLimiter } from "../middleware/rateLimiter.js";
import { ForbiddenError } from "../middleware/errorHandler.js";
import { StorageService, UploadCategory } from "../services/storage.service.js";
import prisma from "../db/client.js";

const router = Router();
router.use(authenticate);

const uploadCategories = ["document", "legacy_audio", "legacy_photo", "legacy_story", "avatar"] as const;

/** POST /api/storage/presign — request a presigned upload URL */
router.post(
  "/presign",
  uploadLimiter,
  validateBody(
    z.object({
      category: z.enum(uploadCategories),
      mimeType: z.string().min(3).max(100),
      fileSizeBytes: z.number().int().positive().max(200 * 1024 * 1024), // 200 MB hard cap
      // For legacy items: the senior ID this belongs to
      seniorId: z.string().cuid().optional(),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as {
        category: UploadCategory;
        mimeType: string;
        fileSizeBytes: number;
        seniorId?: string;
      };

      // Determine ownerId and ownerType based on requester's role
      let ownerId: string;
      let ownerType: string;

      if (req.user!.role === "FAMILY" && body.seniorId) {
        // Verify the family owns this senior
        const family = await prisma.familyAccount.findUniqueOrThrow({
          where: { userId: req.user!.sub },
          select: { id: true },
        });
        const senior = await prisma.senior.findFirst({
          where: { id: body.seniorId, familyId: family.id },
        });
        if (!senior) throw new ForbiddenError("Senior not found in your account");
        ownerId = body.seniorId;
        ownerType = "senior";
      } else if (req.user!.role === "COMPANION") {
        const companion = await prisma.companionAccount.findUniqueOrThrow({
          where: { userId: req.user!.sub },
          select: { id: true },
        });
        ownerId = companion.id;
        ownerType = "companion";
      } else {
        ownerId = req.user!.sub;
        ownerType = "user";
      }

      const result = await StorageService.generatePresignedUploadUrl({
        category: body.category,
        mimeType: body.mimeType,
        fileSizeBytes: body.fileSizeBytes,
        ownerId,
        ownerType,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

/** POST /api/storage/download — get a presigned download URL for a private object */
router.post(
  "/download",
  validateBody(z.object({ objectKey: z.string().min(1).max(500) })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { objectKey } = req.body as { objectKey: string };

      // Security: verify the requester owns the resource by checking the key prefix
      const userId = req.user!.sub;
      const isAuthorized = await verifyObjectOwnership(objectKey, userId, req.user!.role);
      if (!isAuthorized) throw new ForbiddenError("Access denied to this file");

      const downloadUrl = await StorageService.generatePresignedDownloadUrl(objectKey);
      res.json({ downloadUrl, expiresIn: 3600 });
    } catch (err) {
      next(err);
    }
  },
);

export default router;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function verifyObjectOwnership(
  objectKey: string,
  userId: string,
  role: string,
): Promise<boolean> {
  if (role === "ADMIN") return true;

  // Guard against path traversal attacks
  if (objectKey.includes("..") || objectKey.includes("\0")) return false;

  const parts = objectKey.split("/");
  const ownerType = parts[0]; // "companion" | "senior" | "user"
  const ownerId = parts[1];

  if (!ownerType || !ownerId) return false;

  if (ownerType === "companion") {
    const companion = await prisma.companionAccount.findFirst({
      where: { id: ownerId, userId },
    });
    return !!companion;
  }

  if (ownerType === "senior") {
    const senior = await prisma.senior.findFirst({
      where: { id: ownerId, family: { userId } },
    });
    return !!senior;
  }

  return ownerType === "user" && ownerId === userId;
}
