import rateLimit from "express-rate-limit";

/**
 * Strict limiter for auth endpoints (login, register, password reset).
 * 10 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later", code: "RATE_LIMITED" },
  skipSuccessfulRequests: false,
});

/**
 * Standard API limiter.
 * 100 requests per minute per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later", code: "RATE_LIMITED" },
  skipSuccessfulRequests: false,
});

/**
 * Generous limiter for webhooks (high-volume from Stripe/Checkr).
 * 500 requests per minute per IP.
 */
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 500,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many webhook requests", code: "RATE_LIMITED" },
});

/**
 * File upload limiter — prevent abuse.
 * 20 uploads per 10 minutes per IP.
 */
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many upload requests, please try again later", code: "RATE_LIMITED" },
});
