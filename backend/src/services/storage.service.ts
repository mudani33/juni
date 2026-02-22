import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import crypto from "crypto";
import path from "path";

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

// Allowed MIME types per upload category
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  document: [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ],
  legacy_audio: ["audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg"],
  legacy_photo: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"],
  legacy_story: ["text/plain", "application/pdf"],
  avatar: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
};

// Max sizes per category (bytes)
const MAX_SIZES: Record<string, number> = {
  document: 20 * 1024 * 1024,     // 20 MB
  legacy_audio: 100 * 1024 * 1024, // 100 MB
  legacy_photo: 25 * 1024 * 1024,  // 25 MB
  legacy_story: 5 * 1024 * 1024,   // 5 MB
  avatar: 5 * 1024 * 1024,         // 5 MB
};

export type UploadCategory = keyof typeof ALLOWED_MIME_TYPES;

export const StorageService = {
  /**
   * Generate a presigned PUT URL so the client can upload directly to S3.
   * The backend validates the category and MIME type before issuing the URL.
   * After upload, the client calls confirmUpload() to record the file in the DB.
   */
  async generatePresignedUploadUrl(params: {
    category: UploadCategory;
    mimeType: string;
    fileSizeBytes: number;
    ownerId: string;      // userId or seniorId
    ownerType: string;    // "companion" | "senior" | "family"
  }): Promise<{ uploadUrl: string; objectKey: string; expiresIn: number }> {
    const allowed = ALLOWED_MIME_TYPES[params.category];
    if (!allowed?.includes(params.mimeType)) {
      throw new Error(`MIME type '${params.mimeType}' not allowed for category '${params.category}'`);
    }

    const maxSize = MAX_SIZES[params.category] ?? 10 * 1024 * 1024;
    if (params.fileSizeBytes > maxSize) {
      throw new Error(`File size exceeds limit of ${maxSize / (1024 * 1024)} MB for category '${params.category}'`);
    }

    const ext = mimeToExt(params.mimeType);
    const uniqueId = crypto.randomUUID();
    const objectKey = `${params.ownerType}/${params.ownerId}/${params.category}/${uniqueId}${ext}`;

    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: objectKey,
      ContentType: params.mimeType,
      ContentLength: params.fileSizeBytes,
      Metadata: {
        owner_id: params.ownerId,
        owner_type: params.ownerType,
        category: params.category,
        uploaded_at: new Date().toISOString(),
      },
      // Server-side encryption at rest
      ServerSideEncryption: "AES256",
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: env.AWS_S3_PRESIGN_EXPIRY,
    });

    logger.debug("Generated presigned upload URL", { objectKey, category: params.category });

    return {
      uploadUrl,
      objectKey,
      expiresIn: env.AWS_S3_PRESIGN_EXPIRY,
    };
  },

  /**
   * Generate a presigned GET URL for private S3 objects.
   * Only issue after verifying the requesting user owns the resource.
   */
  async generatePresignedDownloadUrl(objectKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: objectKey,
    });

    return getSignedUrl(s3, command, { expiresIn: env.AWS_S3_PRESIGN_EXPIRY });
  },

  /**
   * Delete a file from S3. Call when a legacy item or document is deleted.
   */
  async deleteObject(objectKey: string): Promise<void> {
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: env.AWS_S3_BUCKET,
          Key: objectKey,
        }),
      );
      logger.info("S3 object deleted", { objectKey });
    } catch (err) {
      logger.error("S3 delete failed", { objectKey, error: err });
      throw err;
    }
  },

  /** Build the public CDN URL for a key (use only for public assets like avatars) */
  publicUrl(objectKey: string): string {
    return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${objectKey}`;
  },
};

function mimeToExt(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/heic": ".heic",
    "audio/mpeg": ".mp3",
    "audio/mp4": ".m4a",
    "audio/wav": ".wav",
    "audio/ogg": ".ogg",
    "application/pdf": ".pdf",
    "text/plain": ".txt",
  };
  return map[mimeType] ?? path.extname(mimeType) ?? "";
}
