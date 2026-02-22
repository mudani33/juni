import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { hmacSha256, safeCompare } from "../lib/crypto.js";
import prisma from "../db/client.js";
import { CheckrStatus } from "@prisma/client";

const CHECKR_BASE = "https://api.checkr.com/v1";

// HTTP Basic Auth — API key as username, empty password
const authHeader = "Basic " + Buffer.from(`${env.CHECKR_API_KEY}:`).toString("base64");

async function checkrFetch(path: string, options?: RequestInit): Promise<unknown> {
  const res = await fetch(`${CHECKR_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error("Checkr API error", { path, status: res.status, body });
    throw new Error(`Checkr API error ${res.status}: ${body}`);
  }

  return res.json();
}

// Map Checkr screening status/result → Juni CheckrStatus
function mapScreeningStatus(status: string, result: string | null): CheckrStatus {
  if (status === "complete") {
    if (result === "clear") return CheckrStatus.PASSED;
    if (result === "consider") return CheckrStatus.WAIVER_REQUIRED;
    return CheckrStatus.FAILED;
  }
  if (status === "pending") return CheckrStatus.PENDING;
  return CheckrStatus.IN_PROGRESS;
}

// Map full Checkr report → overall Juni CheckrStatus (most conservative wins)
function mapReportOverallStatus(report: {
  status: string;
  result: string | null;
  assessment?: string | null;
}): CheckrStatus {
  if (report.status !== "complete") {
    return report.status === "pending" ? CheckrStatus.PENDING : CheckrStatus.IN_PROGRESS;
  }
  if (report.assessment === "escalated") return CheckrStatus.FAILED;
  if (report.result === "clear" || report.assessment === "eligible") return CheckrStatus.PASSED;
  if (report.result === "consider" || report.assessment === "review") return CheckrStatus.WAIVER_REQUIRED;
  return CheckrStatus.IN_PROGRESS;
}

export const CheckrService = {
  /** Create a Checkr candidate */
  async createCandidate(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dob?: string;
    zipcode?: string;
    companionId: string;
  }) {
    const candidate = await checkrFetch("/candidates", {
      method: "POST",
      body: JSON.stringify({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        dob: data.dob,
        zipcode: data.zipcode,
        work_locations: [{ country: "US" }],
        copy_requested: true,
        custom_id: `juni_companion_${data.companionId}`,
      }),
    }) as { id: string };

    await prisma.companionAccount.update({
      where: { id: data.companionId },
      data: {
        checkrCandidateId: candidate.id,
        checkrStatus: CheckrStatus.IN_PROGRESS,
      },
    });

    return candidate;
  },

  /** Create a Checkr-hosted invitation (recommended flow) */
  async createInvitation(params: {
    candidateId: string;
    companionId: string;
    packageName?: string;
  }) {
    const invitation = await checkrFetch("/invitations", {
      method: "POST",
      body: JSON.stringify({
        candidate_id: params.candidateId,
        package: params.packageName ?? "juni_fellow_enhanced",
        work_locations: [{ country: "US" }],
        communication_types: ["email", "sms"],
      }),
    }) as { id: string; invitation_url: string };

    await prisma.companionAccount.update({
      where: { id: params.companionId },
      data: { checkrInvitationId: invitation.id },
    });

    return invitation;
  },

  /** Get invitation status */
  async getInvitation(invitationId: string) {
    return checkrFetch(`/invitations/${invitationId}`);
  },

  /** Get report with all screening results */
  async getReport(reportId: string) {
    return checkrFetch(`/reports/${reportId}`);
  },

  /** Get ML-predicted report completion ETA */
  async getReportETA(reportId: string) {
    return checkrFetch(`/reports/${reportId}/eta`);
  },

  /** Get all reports for a candidate */
  async listCandidateReports(candidateId: string) {
    return checkrFetch(`/candidates/${candidateId}/reports`);
  },

  /**
   * Verify Checkr webhook signature.
   * Checkr signs with HMAC-SHA256 using the webhook secret.
   * Header: X-Checkr-Signature
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const expected = hmacSha256(env.CHECKR_WEBHOOK_SECRET, rawBody);
    return safeCompare(expected, signature);
  },

  /**
   * Process a Checkr webhook event and update the companion's status.
   */
  async processWebhookEvent(event: { type: string; data: { object: Record<string, unknown> } }): Promise<void> {
    const { type, data } = event;
    logger.info("Checkr webhook received", { type });

    switch (type) {
      case "invitation.completed": {
        const obj = data.object as { candidate_id: string; report_id: string };
        await prisma.companionAccount.updateMany({
          where: { checkrCandidateId: obj.candidate_id },
          data: {
            checkrReportId: obj.report_id,
            checkrStatus: CheckrStatus.IN_PROGRESS,
          },
        });
        break;
      }

      case "invitation.expired": {
        const obj = data.object as { candidate_id: string };
        logger.warn("Checkr invitation expired", { candidateId: obj.candidate_id });
        // The companion needs to be re-invited — flag for staff review
        break;
      }

      case "report.completed": {
        const obj = data.object as {
          id: string;
          candidate_id: string;
          status: string;
          result: string | null;
          assessment?: string | null;
          screenings?: Array<{ type: string; status: string; result: string | null; completed_at?: string }>;
        };

        const overallStatus = mapReportOverallStatus({
          status: obj.status,
          result: obj.result,
          assessment: obj.assessment,
        });

        // Build per-screening results map
        const bgResults: Record<string, { status: string; completedDate: string | null }> = {};
        if (obj.screenings) {
          const screeningMap: Record<string, string> = {
            ssn_trace: "identity",
            national_criminal_search: "criminal",
            sex_offender_search: "sex_offender",
            county_criminal_search: "criminal",
            federal_criminal_search: "criminal",
            motor_vehicle_report: "driving",
            education_verification: "education",
            personal_reference_verification: "references",
            global_watchlist_search: "watchlist",
          };
          for (const s of obj.screenings) {
            const key = screeningMap[s.type];
            if (!key) continue;
            bgResults[key] = {
              status: mapScreeningStatus(s.status, s.result),
              completedDate: s.completed_at ?? null,
            };
          }
        }

        await prisma.companionAccount.updateMany({
          where: { checkrCandidateId: obj.candidate_id },
          data: {
            checkrReportId: obj.id,
            checkrStatus: overallStatus,
            bgCheckResults: bgResults,
          },
        });

        logger.info("Checkr report completed", {
          candidateId: obj.candidate_id,
          overallStatus,
        });
        break;
      }

      case "report.suspended":
        logger.warn("Checkr report suspended — manual review required", {
          reportId: (data.object as { id: string }).id,
        });
        break;

      case "report.pre_adverse_action":
      case "report.post_adverse_action":
        logger.warn("Checkr adverse action", {
          type,
          reportId: (data.object as { id: string }).id,
        });
        break;

      default:
        logger.debug("Unhandled Checkr webhook event", { type });
    }
  },
};
