import prisma from "../db/client.js";
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  generateJti,
} from "../lib/crypto.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { EmailService } from "./email.service.js";
import { ConflictError, AuthError, NotFoundError, BadRequestError } from "../middleware/errorHandler.js";
import { UserRole } from "@prisma/client";
import { env } from "../config/env.js";
import crypto from "crypto";

const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const AuthService = {
  /** Register a new family account */
  async registerFamily(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    howHeard?: string;
    parentName: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) throw new ConflictError("An account with this email already exists");

    const passwordHash = await hashPassword(data.password);
    const verifyToken = generateSecureToken();
    const verifyTokenHash = hashToken(verifyToken);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        role: UserRole.FAMILY,
        emailVerifyToken: verifyTokenHash,
        emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        family: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            howHeard: data.howHeard,
            seniors: {
              create: {
                firstName: data.parentName,
              },
            },
          },
        },
      },
      include: { family: { include: { seniors: true } } },
    });

    // Send welcome + email verification
    await EmailService.sendEmailVerification({
      to: user.email,
      firstName: data.firstName,
      token: verifyToken,
    });
    await EmailService.sendWelcomeFamily({
      to: user.email,
      firstName: data.firstName,
      parentName: data.parentName,
    });

    return { user, seniorId: user.family?.seniors[0]?.id };
  },

  /** Register a new companion account */
  async registerCompanion(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dob?: string;
    zipcode?: string;
    city?: string;
    state?: string;
    motivation?: string;
    experience?: string;
    availability?: string;
    interests?: string[];
    hearAbout?: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) throw new ConflictError("An account with this email already exists");

    // Generate a temporary password — companion sets via email verification link
    const tempPassword = generateSecureToken(16);
    const passwordHash = await hashPassword(tempPassword);
    const verifyToken = generateSecureToken();
    const verifyTokenHash = hashToken(verifyToken);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        role: UserRole.COMPANION,
        emailVerifyToken: verifyTokenHash,
        emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        companion: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            dob: data.dob ? new Date(data.dob) : undefined,
            zipcode: data.zipcode,
            city: data.city,
            state: data.state,
            motivation: data.motivation,
            experience: data.experience,
            availability: data.availability,
            interests: data.interests ?? [],
            hearAbout: data.hearAbout,
          },
        },
      },
      include: { companion: true },
    });

    const onboardingUrl = `${env.FRONTEND_URL}/companion/onboarding?token=${verifyToken}`;
    await EmailService.sendWelcomeCompanion({
      to: user.email,
      firstName: data.firstName,
      onboardingUrl,
    });

    return { user, companionId: user.companion?.id };
  },

  /** Login — returns access + refresh tokens */
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        family: { select: { id: true } },
        companion: { select: { id: true, status: true } },
      },
    });

    if (!user) {
      // Use same timing as bcrypt to prevent user enumeration
      await hashPassword("timing_equalization_dummy");
      throw new AuthError("Invalid email or password");
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new AuthError("Invalid email or password");

    if (!user.emailVerified) {
      throw new AuthError("Please verify your email address before logging in");
    }

    if (user.companion?.status === "DEACTIVATED") {
      throw new AuthError("This companion account has been deactivated");
    }

    const tokens = await issueTokenPair(user.id, user.role, user.email);

    return {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        familyId: user.family?.id ?? null,
        companionId: user.companion?.id ?? null,
      },
    };
  },

  /** Refresh access token using a valid refresh token */
  async refreshTokens(rawRefreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new AuthError("Invalid or expired refresh token");
    }

    // Look up the stored refresh token record
    const stored = await prisma.refreshToken.findUnique({ where: { jti: payload.jti } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new AuthError("Refresh token has been revoked or expired");
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true },
    });

    // Rotate: revoke old token, issue new pair
    await prisma.refreshToken.update({
      where: { jti: payload.jti },
      data: { revokedAt: new Date() },
    });

    return issueTokenPair(user.id, user.role, user.email);
  },

  /** Revoke a specific refresh token (logout) */
  async logout(jti: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { jti },
      data: { revokedAt: new Date() },
    });
  },

  /** Verify email address */
  async verifyEmail(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: tokenHash,
        emailVerifyExpires: { gt: new Date() },
        emailVerified: false,
      },
    });

    if (!user) throw new BadRequestError("Invalid or expired email verification link");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });
  },

  /** Initiate password reset — sends email with reset link */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Always return success to prevent user enumeration
    if (!user) return;

    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    const expiry = new Date(Date.now() + env.PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: tokenHash,
        passwordResetExpires: expiry,
      },
    });

    const firstName =
      (await prisma.familyAccount.findUnique({ where: { userId: user.id }, select: { firstName: true } }))
        ?.firstName ??
      (await prisma.companionAccount.findUnique({ where: { userId: user.id }, select: { firstName: true } }))
        ?.firstName ??
      "there";

    await EmailService.sendPasswordReset({ to: user.email, firstName, token });
  },

  /** Complete password reset using token from email */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) throw new BadRequestError("Invalid or expired password reset link");

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      }),
      // Revoke all existing refresh tokens on password reset
      prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function issueTokenPair(userId: string, role: UserRole, email: string) {
  const jti = generateJti();

  // Store refresh token in DB for rotation + revocation
  await prisma.refreshToken.create({
    data: {
      jti,
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    },
  });

  const accessToken = signAccessToken({ sub: userId, role, email });
  const refreshToken = signRefreshToken({ sub: userId, jti });

  return { accessToken, refreshToken };
}

/** Hash a token for secure storage (prevents DB leaks from exposing valid tokens) */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
