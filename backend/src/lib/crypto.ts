import crypto from "crypto";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

/** Hash a password with bcrypt (cost factor 12) */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/** Timing-safe password comparison */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Generate a cryptographically secure random token (hex string) */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/** Generate a unique refresh token JTI */
export function generateJti(): string {
  return crypto.randomUUID();
}

/** HMAC-SHA256 signing — for Checkr webhook verification */
export function hmacSha256(secret: string, data: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/** Timing-safe string comparison — prevents timing attacks */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
