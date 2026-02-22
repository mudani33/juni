import { Router, Request, Response, NextFunction } from "express";
import { CheckrService } from "../services/checkr.service.js";
import { logger } from "../lib/logger.js";

/**
 * Checkr Webhook Handler — /webhooks/checkr
 *
 * Checkr signs payloads with HMAC-SHA256 using the webhook secret.
 * Signature is in the X-Checkr-Signature header.
 *
 * Mount BEFORE express.json() using express.raw() so we get the raw body
 * for signature verification.
 *
 * Retry behavior: Checkr retries every 1min for 10min, then every 1hr for 24hr.
 * Return 2xx quickly, process async.
 */
const router = Router();

router.post(
  "/",
  async (req: Request, res: Response, _next: NextFunction) => {
    const signature = req.headers["x-checkr-signature"];

    if (!signature || typeof signature !== "string") {
      logger.warn("Checkr webhook: missing X-Checkr-Signature header");
      res.status(400).json({ error: "Missing X-Checkr-Signature header" });
      return;
    }

    // req.body is a raw Buffer here
    const rawBody = (req.body as Buffer).toString("utf8");

    const isValid = CheckrService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      logger.warn("Checkr webhook signature verification failed");
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    let event: { type: string; data: { object: Record<string, unknown> } };
    try {
      event = JSON.parse(rawBody) as typeof event;
    } catch {
      res.status(400).json({ error: "Invalid JSON payload" });
      return;
    }

    // Acknowledge immediately — Checkr expects fast 2xx
    res.json({ received: true });

    // Process async so webhook times out don't cause retries
    setImmediate(() => {
      CheckrService.processWebhookEvent(event).catch((err) => {
        logger.error("Error processing Checkr webhook", { type: event.type, error: err });
      });
    });
  },
);

export default router;
