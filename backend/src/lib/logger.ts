import winston from "winston";
import { env } from "../config/env.js";

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

export const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    json(),
  ),
  defaultMeta: { service: "juni-backend" },
  transports: [
    new winston.transports.Console({
      format:
        env.NODE_ENV === "production"
          ? combine(timestamp(), json())
          : combine(colorize(), simple()),
    }),
  ],
});

// Typed request logging helper
export const logRequest = (method: string, path: string, statusCode: number, durationMs: number) => {
  const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
  logger.log(level, `${method} ${path} ${statusCode} ${durationMs}ms`);
};
