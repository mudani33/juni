import sgMail from "@sendgrid/mail";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

sgMail.setApiKey(env.SENDGRID_API_KEY);

interface EmailOptions {
  to: string;
  templateId: string;
  dynamicTemplateData: Record<string, unknown>;
}

async function send(options: EmailOptions): Promise<void> {
  try {
    await sgMail.send({
      to: options.to,
      from: { email: env.SENDGRID_FROM_EMAIL, name: env.SENDGRID_FROM_NAME },
      templateId: options.templateId,
      dynamicTemplateData: options.dynamicTemplateData,
    });
  } catch (err) {
    logger.error("SendGrid email failed", { to: options.to, templateId: options.templateId, error: err });
    // Don't throw — email failure shouldn't break the primary request
  }
}

export const EmailService = {
  async sendWelcomeFamily(params: { to: string; firstName: string; parentName: string }): Promise<void> {
    await send({
      to: params.to,
      templateId: env.SENDGRID_TEMPLATE_WELCOME_FAMILY,
      dynamicTemplateData: {
        first_name: params.firstName,
        parent_name: params.parentName,
        portal_url: `${env.FRONTEND_URL}/family`,
      },
    });
  },

  async sendWelcomeCompanion(params: { to: string; firstName: string; onboardingUrl: string }): Promise<void> {
    await send({
      to: params.to,
      templateId: env.SENDGRID_TEMPLATE_WELCOME_COMPANION,
      dynamicTemplateData: {
        first_name: params.firstName,
        onboarding_url: params.onboardingUrl,
      },
    });
  },

  async sendEmailVerification(params: { to: string; firstName: string; token: string }): Promise<void> {
    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${params.token}`;
    await send({
      to: params.to,
      templateId: env.SENDGRID_TEMPLATE_VERIFY_EMAIL,
      dynamicTemplateData: {
        first_name: params.firstName,
        verify_url: verifyUrl,
        expires_in: "24 hours",
      },
    });
  },

  async sendPasswordReset(params: { to: string; firstName: string; token: string }): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${params.token}`;
    await send({
      to: params.to,
      templateId: env.SENDGRID_TEMPLATE_PASSWORD_RESET,
      dynamicTemplateData: {
        first_name: params.firstName,
        reset_url: resetUrl,
        expires_in: `${env.PASSWORD_RESET_EXPIRY_MINUTES} minutes`,
      },
    });
  },

  async sendVisitReminder(params: {
    to: string;
    firstName: string;
    seniorName: string;
    visitDate: string;
    visitTime: string;
  }): Promise<void> {
    await send({
      to: params.to,
      templateId: env.SENDGRID_TEMPLATE_VISIT_REMINDER,
      dynamicTemplateData: {
        first_name: params.firstName,
        senior_name: params.seniorName,
        visit_date: params.visitDate,
        visit_time: params.visitTime,
      },
    });
  },

  async sendBloomDigest(params: {
    to: string;
    familyFirstName: string;
    seniorName: string;
    companionName: string;
    mood: string;
    summary: string;
    highlights: string[];
    portalUrl: string;
  }): Promise<void> {
    await send({
      to: params.to,
      templateId: env.SENDGRID_TEMPLATE_BLOOM_DIGEST,
      dynamicTemplateData: {
        family_first_name: params.familyFirstName,
        senior_name: params.seniorName,
        companion_name: params.companionName,
        mood: params.mood,
        summary: params.summary,
        highlights: params.highlights,
        portal_url: params.portalUrl,
      },
    });
  },

  async sendBackgroundCheckComplete(params: {
    to: string;
    firstName: string;
    status: "passed" | "consider" | "failed";
    nextStep: string;
  }): Promise<void> {
    await send({
      to: params.to,
      templateId: env.SENDGRID_TEMPLATE_BG_CHECK_COMPLETE,
      dynamicTemplateData: {
        first_name: params.firstName,
        status: params.status,
        next_step: params.nextStep,
        portal_url: `${env.FRONTEND_URL}/companion/onboarding`,
      },
    });
  },
};
