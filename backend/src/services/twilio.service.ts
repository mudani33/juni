import twilio from "twilio";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import prisma from "../db/client.js";

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

export const TwilioService = {
  /**
   * Send an SMS notification.
   * In production, use masked numbers via Proxy for companion↔family comms.
   */
  async sendSMS(to: string, body: string): Promise<void> {
    try {
      await client.messages.create({
        body,
        from: env.TWILIO_PHONE_NUMBER,
        to,
      });
    } catch (err) {
      logger.error("Twilio SMS failed", { to, error: err });
      // Don't throw — SMS failure shouldn't break the primary request
    }
  },

  /**
   * Create a Twilio Proxy session so that a companion and family can
   * communicate via masked phone numbers — neither party sees the other's
   * real number. Uses Twilio Proxy.
   */
  async createProxySession(params: {
    seniorId: string;
    companionId: string;
    familyPhone: string;
    companionPhone: string;
  }): Promise<{ familyProxiedNumber: string; companionProxiedNumber: string }> {
    // Create Proxy session
    const session = await client.proxy.v1
      .services(env.TWILIO_PROXY_SERVICE_SID)
      .sessions.create({
        uniqueName: `juni_${params.seniorId}_${params.companionId}_${Date.now()}`,
        ttl: 30 * 24 * 60 * 60, // 30 days
      });

    // Add family participant
    const familyParticipant = await client.proxy.v1
      .services(env.TWILIO_PROXY_SERVICE_SID)
      .sessions(session.sid)
      .participants.create({
        identifier: params.familyPhone,
      });

    // Add companion participant
    const companionParticipant = await client.proxy.v1
      .services(env.TWILIO_PROXY_SERVICE_SID)
      .sessions(session.sid)
      .participants.create({
        identifier: params.companionPhone,
      });

    const familyProxiedNumber = familyParticipant.proxyIdentifier ?? "";
    const companionProxiedNumber = companionParticipant.proxyIdentifier ?? "";

    // Persist the proxy session
    await prisma.twilioProxySession.create({
      data: {
        twilioSid: session.sid,
        seniorId: params.seniorId,
        companionId: params.companionId,
        familyProxiedNumber,
        companionProxiedNumber,
        status: "open",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    logger.info("Twilio Proxy session created", {
      sessionSid: session.sid,
      seniorId: params.seniorId,
      companionId: params.companionId,
    });

    return { familyProxiedNumber, companionProxiedNumber };
  },

  /** Close a Proxy session when a match ends */
  async closeProxySession(twilioSid: string): Promise<void> {
    try {
      await client.proxy.v1
        .services(env.TWILIO_PROXY_SERVICE_SID)
        .sessions(twilioSid)
        .update({ status: "closed" });

      await prisma.twilioProxySession.update({
        where: { twilioSid },
        data: { status: "closed" },
      });
    } catch (err) {
      logger.error("Failed to close Twilio Proxy session", { twilioSid, error: err });
    }
  },

  /** Send visit reminder SMS to companion */
  async sendVisitReminderToCompanion(params: {
    phone: string;
    seniorName: string;
    visitDate: string;
    visitTime: string;
  }): Promise<void> {
    const msg = `Juni reminder: You have a visit with ${params.seniorName} on ${params.visitDate} at ${params.visitTime}. Reply HELP for support.`;
    await TwilioService.sendSMS(params.phone, msg);
  },

  /** Send visit reminder SMS to family */
  async sendVisitReminderToFamily(params: {
    phone: string;
    companionName: string;
    visitDate: string;
    visitTime: string;
  }): Promise<void> {
    const msg = `Juni: ${params.companionName} is scheduled to visit on ${params.visitDate} at ${params.visitTime}. Reply HELP for support.`;
    await TwilioService.sendSMS(params.phone, msg);
  },

  /** Notify family that a Companion has checked in */
  async sendCheckInNotification(params: {
    familyPhone: string;
    companionName: string;
    seniorName: string;
  }): Promise<void> {
    const msg = `Juni: ${params.companionName} has arrived and checked in with ${params.seniorName}. Have a great visit!`;
    await TwilioService.sendSMS(params.familyPhone, msg);
  },

  /** Notify family that a visit has ended */
  async sendCheckOutNotification(params: {
    familyPhone: string;
    companionName: string;
    seniorName: string;
    durationMinutes: number;
  }): Promise<void> {
    const hours = Math.floor(params.durationMinutes / 60);
    const minutes = params.durationMinutes % 60;
    const duration = hours > 0 ? `${hours}h ${minutes > 0 ? `${minutes}m` : ""}` : `${minutes}m`;
    const msg = `Juni: ${params.companionName}'s visit with ${params.seniorName} has ended (${duration.trim()}). Your Daily Bloom will be ready soon.`;
    await TwilioService.sendSMS(params.familyPhone, msg);
  },
};
