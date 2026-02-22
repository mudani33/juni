import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { logger, logRequest } from "./lib/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter, webhookLimiter } from "./middleware/rateLimiter.js";

// ── Route imports ────────────────────────────────────────────────────────────
import authRoutes from "./routes/auth.routes.js";
import familiesRoutes from "./routes/families.routes.js";
import companionsRoutes from "./routes/companions.routes.js";
import visitsRoutes from "./routes/visits.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import messagesRoutes from "./routes/messages.routes.js";
import checkrRoutes from "./routes/checkr.routes.js";
import storageRoutes from "./routes/storage.routes.js";

// ── Webhook imports (raw body parsing required) ──────────────────────────────
import stripeWebhook from "./webhooks/stripe.webhook.js";
import checkrWebhook from "./webhooks/checkr.webhook.js";
import prisma from "./db/client.js";

const app = express();

// ── Security middleware ───────────────────────────────────────────────────────

app.use(
  helmet({
    // Content Security Policy — tightened for API-only server
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    // Prevent MIME type sniffing
    noSniff: true,
    // Force HTTPS in production
    hsts: env.NODE_ENV === "production" ? { maxAge: 31536000, includeSubDomains: true } : false,
    // Remove X-Powered-By
    hidePoweredBy: true,
  }),
);

// CORS — only allow the frontend origin
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman) in dev
      if (!origin || env.NODE_ENV === "development") {
        return callback(null, true);
      }
      if (origin === env.FRONTEND_URL) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,          // Allow cookies (refresh token)
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,              // Cache preflight for 24h
  }),
);

// ── Webhooks — MUST be mounted before express.json() ────────────────────────
// Stripe and Checkr require the raw body for signature verification.

app.use(
  "/webhooks/stripe",
  webhookLimiter,
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

app.use(
  "/webhooks/checkr",
  webhookLimiter,
  express.raw({ type: "application/json" }),
  checkrWebhook,
);

// ── Body parsing ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());

// ── Request logging ──────────────────────────────────────────────────────────

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logRequest(req.method, req.path, res.statusCode, Date.now() - start);
  });
  next();
});

// ── Health check ─────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API routes ───────────────────────────────────────────────────────────────

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/families", familiesRoutes);
app.use("/api/companions", companionsRoutes);
app.use("/api/visits", visitsRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/checkr", checkrRoutes);
app.use("/api/storage", storageRoutes);

// ── 404 catch-all ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found", code: "NOT_FOUND" });
});

// ── Global error handler (must be last) ─────────────────────────────────────

app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────────────────

const server = app.listen(env.PORT, () => {
  logger.info(`Juni backend started`, {
    port: env.PORT,
    env: env.NODE_ENV,
    frontendUrl: env.FRONTEND_URL,
  });
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────

async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Server closed and DB disconnected");
    process.exit(0);
  });

  // Force exit after 10s
  setTimeout(() => {
    logger.error("Graceful shutdown timed out — forcing exit");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Handle unhandled rejections — log and exit (let process manager restart)
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason });
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", { error: err });
  process.exit(1);
});

export default app;
