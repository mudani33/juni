import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, AccessTokenPayload } from "../lib/jwt.js";
import { AuthError, ForbiddenError } from "./errorHandler.js";
import { UserRole } from "@prisma/client";

// Augment Express Request with authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

/**
 * Extracts and verifies the Bearer token from the Authorization header.
 * Sets req.user on success. Throws AuthError on failure.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthError("Bearer token required");
  }

  const token = authHeader.slice(7);
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    throw new AuthError("Invalid or expired access token");
  }
}

/**
 * Require that the authenticated user has one of the specified roles.
 * Must be used after authenticate().
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthError();
    }
    if (!roles.includes(req.user.role as UserRole)) {
      throw new ForbiddenError(`Role '${req.user.role}' is not permitted to access this resource`);
    }
    next();
  };
}

/** Convenience — require FAMILY role */
export const requireFamily = requireRole(UserRole.FAMILY);

/** Convenience — require COMPANION role */
export const requireCompanion = requireRole(UserRole.COMPANION);

/** Convenience — require ADMIN role */
export const requireAdmin = requireRole(UserRole.ADMIN);

/** Convenience — require FAMILY or ADMIN */
export const requireFamilyOrAdmin = requireRole(UserRole.FAMILY, UserRole.ADMIN);

/** Convenience — require COMPANION or ADMIN */
export const requireCompanionOrAdmin = requireRole(UserRole.COMPANION, UserRole.ADMIN);
