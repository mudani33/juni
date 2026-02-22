import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  FRONTEND_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("30d"),

  // Checkr
  CHECKR_API_KEY: z.string().min(1, "CHECKR_API_KEY is required"),
  CHECKR_WEBHOOK_SECRET: z.string().min(1, "CHECKR_WEBHOOK_SECRET is required"),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith("sk_", "STRIPE_SECRET_KEY must start with sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_", "STRIPE_WEBHOOK_SECRET must start with whsec_"),
  STRIPE_PRICE_ESSENTIALS: z.string().min(1),
  STRIPE_PRICE_PREMIUM: z.string().min(1),
  STRIPE_PRICE_LEGACY: z.string().min(1),

  // SendGrid
  SENDGRID_API_KEY: z.string().startsWith("SG.", "SENDGRID_API_KEY must start with SG."),
  SENDGRID_FROM_EMAIL: z.string().email(),
  SENDGRID_FROM_NAME: z.string().default("Juni"),
  SENDGRID_TEMPLATE_WELCOME_FAMILY: z.string().min(1),
  SENDGRID_TEMPLATE_WELCOME_COMPANION: z.string().min(1),
  SENDGRID_TEMPLATE_VERIFY_EMAIL: z.string().min(1),
  SENDGRID_TEMPLATE_PASSWORD_RESET: z.string().min(1),
  SENDGRID_TEMPLATE_VISIT_REMINDER: z.string().min(1),
  SENDGRID_TEMPLATE_BLOOM_DIGEST: z.string().min(1),
  SENDGRID_TEMPLATE_BG_CHECK_COMPLETE: z.string().min(1),

  // Twilio
  TWILIO_ACCOUNT_SID: z.string().startsWith("AC", "TWILIO_ACCOUNT_SID must start with AC"),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_PHONE_NUMBER: z.string().min(10),
  TWILIO_PROXY_SERVICE_SID: z.string().startsWith("KS", "TWILIO_PROXY_SERVICE_SID must start with KS"),

  // AWS S3
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_S3_BUCKET: z.string().min(1),
  AWS_S3_PRESIGN_EXPIRY: z.coerce.number().int().positive().default(3600),

  // Anthropic
  ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-", "ANTHROPIC_API_KEY must start with sk-ant-"),

  // Email verification
  EMAIL_VERIFICATION_SECRET: z.string().min(32),
  PASSWORD_RESET_SECRET: z.string().min(32),
  PASSWORD_RESET_EXPIRY_MINUTES: z.coerce.number().int().positive().default(60),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    result.error.issues.forEach((issue) => {
      console.error(`  ${issue.path.join(".")}: ${issue.message}`);
    });
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();
