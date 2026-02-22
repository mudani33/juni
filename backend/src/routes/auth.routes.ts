import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service.js";
import { validateBody } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { authenticate } from "../middleware/auth.js";
import { verifyRefreshToken } from "../lib/jwt.js";
import prisma from "../db/client.js";
import { AuthError } from "../middleware/errorHandler.js";
import { env } from "../config/env.js";

const router = Router();

// ── Schemas ─────────────────────────────────────────────────────────────────

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const registerFamilySchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  phone: z.string().optional(),
  howHeard: z.string().optional(),
  parentName: z.string().min(1).max(100).trim(),
});

const registerCompanionSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  phone: z.string().optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
  zipcode: z.string().max(10).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  motivation: z.string().max(2000).optional(),
  experience: z.string().max(2000).optional(),
  availability: z.enum(["full-time", "part-time", "flexible", "weekends"]).optional(),
  interests: z.array(z.string()).max(20).optional(),
  hearAbout: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const verifyEmailSchema = z.object({
  token: z.string().min(32),
});

const requestResetSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password: passwordSchema,
});

// ── Routes ───────────────────────────────────────────────────────────────────

/** POST /api/auth/register/family */
router.post(
  "/register/family",
  authLimiter,
  validateBody(registerFamilySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthService.registerFamily(req.body as z.infer<typeof registerFamilySchema>);
      res.status(201).json({
        message: "Account created. Please check your email to verify your address.",
        userId: result.user.id,
        seniorId: result.seniorId,
      });
    } catch (err) {
      next(err);
    }
  },
);

/** POST /api/auth/register/companion */
router.post(
  "/register/companion",
  authLimiter,
  validateBody(registerCompanionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthService.registerCompanion(req.body as z.infer<typeof registerCompanionSchema>);
      res.status(201).json({
        message: "Application received. Check your email to begin background screening.",
        userId: result.user.id,
        companionId: result.companionId,
      });
    } catch (err) {
      next(err);
    }
  },
);

/** POST /api/auth/login */
router.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as z.infer<typeof loginSchema>;
      const { tokens, user } = await AuthService.login(email, password);

      // httpOnly cookie for refresh token
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/api/auth/refresh",
      });

      res.json({ accessToken: tokens.accessToken, user });
    } catch (err) {
      next(err);
    }
  },
);

/** POST /api/auth/refresh */
router.post("/refresh", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Accept refresh token from httpOnly cookie or body (for native clients)
    const rawToken: string | undefined =
      (req.cookies as Record<string, string | undefined>)["refreshToken"] ??
      (req.body as { refreshToken?: string }).refreshToken;

    if (!rawToken) throw new AuthError("Refresh token required");

    const tokens = await AuthService.refreshTokens(rawToken);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/api/auth/refresh",
    });

    res.json({ accessToken: tokens.accessToken });
  } catch (err) {
    next(err);
  }
});

/** POST /api/auth/logout */
router.post("/logout", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawToken: string | undefined =
      (req.cookies as Record<string, string | undefined>)["refreshToken"];
    if (rawToken) {
      try {
        const payload = verifyRefreshToken(rawToken);
        await AuthService.logout(payload.jti);
      } catch {
        // Token already invalid — still clear the cookie
      }
    }

    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
});

/** POST /api/auth/verify-email */
router.post(
  "/verify-email",
  authLimiter,
  validateBody(verifyEmailSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body as z.infer<typeof verifyEmailSchema>;
      await AuthService.verifyEmail(token);
      res.json({ message: "Email verified successfully" });
    } catch (err) {
      next(err);
    }
  },
);

/** POST /api/auth/forgot-password */
router.post(
  "/forgot-password",
  authLimiter,
  validateBody(requestResetSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as z.infer<typeof requestResetSchema>;
      await AuthService.requestPasswordReset(email);
      // Always return 200 to prevent user enumeration
      res.json({ message: "If an account exists, a reset email has been sent." });
    } catch (err) {
      next(err);
    }
  },
);

/** POST /api/auth/reset-password */
router.post(
  "/reset-password",
  authLimiter,
  validateBody(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body as z.infer<typeof resetPasswordSchema>;
      await AuthService.resetPassword(token, password);
      res.json({ message: "Password reset successfully" });
    } catch (err) {
      next(err);
    }
  },
);

/** GET /api/auth/me */
router.get("/me", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.user!.sub },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        family: { select: { id: true, firstName: true, lastName: true } },
        companion: { select: { id: true, firstName: true, lastName: true, status: true } },
      },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
