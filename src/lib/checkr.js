/*
 * ═══════════════════════════════════════════════════════════════
 *  CHECKR API — Background Check Service Layer
 *  Routes all API calls through backend proxy for security.
 *  API keys are NEVER exposed to the client.
 *
 *  Checkr API Reference: https://docs.checkr.com
 *  - POST /v1/candidates — Create candidate with PII
 *  - POST /v1/invitations — Checkr-hosted consent & disclosure flow
 *  - POST /v1/reports — Direct report creation (Juni-collected consent)
 *  - GET  /v1/reports/:id — Retrieve report with screening results
 *  - GET  /v1/reports/:id/eta — Predicted completion time (ML-based)
 *  - GET  /v1/screenings/:id — Individual screening details
 *  - GET  /v1/candidates/:id/reports — All reports for a candidate
 *
 *  Authentication: HTTP Basic Auth (API key as username, no password)
 *  Webhooks: report.completed, report.created, report.suspended,
 *            report.pre_adverse_action, invitation.completed,
 *            invitation.expired, screening.completed
 * ═══════════════════════════════════════════════════════════════
 */

import { BG_CHECK_STATUS } from "./constants";

export const CHECKR_CONFIG = {
  baseUrl: "https://api.checkr.com/v1",
  proxyUrl: "/api/checkr",
  webhookPath: "/webhooks/checkr",
};

// Checkr screening package definitions mapped to Juni's requirements
// These correspond to Checkr Package objects configured in the Checkr Dashboard
export const CHECKR_PACKAGES = {
  juni_fellow_standard: {
    name: "juni_fellow_standard",
    screenings: [
      { type: "ssn_trace", subtype: null },
      { type: "national_criminal_search", subtype: null },
      { type: "sex_offender_search", subtype: null },
      { type: "county_criminal_search", subtype: null },
      { type: "federal_criminal_search", subtype: null },
      { type: "global_watchlist_search", subtype: null },
    ],
  },
  juni_fellow_enhanced: {
    name: "juni_fellow_enhanced",
    screenings: [
      { type: "ssn_trace", subtype: null },
      { type: "national_criminal_search", subtype: null },
      { type: "sex_offender_search", subtype: null },
      { type: "county_criminal_search", subtype: null },
      { type: "federal_criminal_search", subtype: null },
      { type: "global_watchlist_search", subtype: null },
      { type: "motor_vehicle_report", subtype: null },
      { type: "education_verification", subtype: null },
      { type: "personal_reference_verification", subtype: null },
    ],
  },
};

// Checkr report result → Juni internal status mapping
// Checkr uses: pending, running, complete + result (clear/consider)
// Also: suspended, dispute for reports needing review
const CHECKR_STATUS_MAP = {
  pending: BG_CHECK_STATUS.PENDING,
  running: BG_CHECK_STATUS.IN_PROGRESS,
  complete: BG_CHECK_STATUS.PASSED,
  consider: BG_CHECK_STATUS.WAIVER,
  suspended: BG_CHECK_STATUS.IN_PROGRESS,
  dispute: BG_CHECK_STATUS.IN_PROGRESS,
  clear: BG_CHECK_STATUS.PASSED,
};

// Checkr report assessment → Juni handling
// Assessments are returned when Checkr Assess is enabled
const CHECKR_ASSESSMENT_MAP = {
  eligible: BG_CHECK_STATUS.PASSED,
  review: BG_CHECK_STATUS.WAIVER,
  escalated: BG_CHECK_STATUS.FAILED,
};

// Screening type → Juni check ID mapping
const SCREENING_MAP = {
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

// All Checkr webhook event types Juni listens for
export const CHECKR_WEBHOOK_EVENTS = [
  "report.created",
  "report.completed",
  "report.suspended",
  "report.resumed",
  "report.upgraded",
  "report.pre_adverse_action",
  "report.post_adverse_action",
  "report.dispute.created",
  "invitation.created",
  "invitation.completed",
  "invitation.expired",
  "screening.completed",
];

/**
 * Checkr API service — all calls routed through backend proxy for security.
 *
 * Production architecture:
 *   Client (this file) → Backend Proxy (/api/checkr) → Checkr API (api.checkr.com/v1)
 *
 * The backend proxy:
 *   1. Authenticates requests using server-stored Checkr API key (HTTP Basic Auth)
 *   2. Validates request payloads before forwarding
 *   3. Stores candidate_id and report_id in the database
 *   4. Returns sanitized responses (strips sensitive PII if needed)
 *
 * Checkr API Authentication:
 *   curl -u YOUR_SECRET_API_KEY: https://api.checkr.com/v1/...
 *   (API key as username, empty password — HTTP Basic Auth)
 */
const CheckrService = {

  // ────────────────────────────────────────────
  //  CANDIDATE MANAGEMENT
  // ────────────────────────────────────────────

  /**
   * Create a candidate in Checkr.
   * POST /v1/candidates
   *
   * Required fields depend on screening package:
   * - SSN-based screenings: first_name, last_name, email, dob, ssn, zipcode
   * - MVR screenings: additionally driver_license_number, driver_license_state
   * - All: work_locations (array of {country, state?, city?})
   *
   * The custom_id links Checkr's candidate to Juni's internal Fellow record.
   * Checkr recommends reusing existing candidates instead of creating duplicates.
   */
  async createCandidate({ firstName, lastName, email, phone, dob, ssn, zipcode, driverLicenseNumber, driverLicenseState }) {
    const body = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      dob,         // Format: YYYY-MM-DD
      ssn,         // Format: XXX-XX-XXXX (optional at creation, required for screening)
      zipcode,
      work_locations: [{ country: "US", state: null, city: null }],
      copy_requested: true,  // Candidate receives copy of their report (FCRA requirement)
      custom_id: `juni_fellow_${Date.now()}`,
    };

    // Only include driver license fields if provided (for MVR screenings)
    if (driverLicenseNumber) body.driver_license_number = driverLicenseNumber;
    if (driverLicenseState) body.driver_license_state = driverLicenseState;

    const res = await fetch(`${CHECKR_CONFIG.proxyUrl}/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Checkr candidate creation failed: ${res.status} - ${err.error || "Unknown error"}`);
    }
    return res.json();
  },

  /**
   * Retrieve a candidate by ID.
   * GET /v1/candidates/:id
   */
  async getCandidate(candidateId) {
    const res = await fetch(`${CHECKR_CONFIG.proxyUrl}/candidates/${candidateId}`);
    if (!res.ok) throw new Error(`Checkr candidate fetch failed: ${res.status}`);
    return res.json();
  },

  // ────────────────────────────────────────────
  //  INVITATION FLOW (Checkr-Hosted Consent)
  // ────────────────────────────────────────────

  /**
   * Create an invitation — Checkr-hosted consent/disclosure flow.
   * POST /v1/invitations
   *
   * This is the recommended approach for the Checkr-Hosted Apply Flow:
   * 1. Juni creates candidate with basic PII (email required)
   * 2. Juni creates invitation → Checkr sends email/SMS to candidate
   * 3. Candidate completes PII entry, reviews disclosures, grants consent
   * 4. Checkr auto-creates Report when invitation is completed
   * 5. Juni receives invitation.completed webhook with report_id
   *
   * Invitation expires after 7 days with daily follow-up reminders.
   *
   * Required: candidate_id, package, work_locations
   */
  async createInvitation(candidateId, packageName, workLocations) {
    const res = await fetch(`${CHECKR_CONFIG.proxyUrl}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate_id: candidateId,
        package: packageName || CHECKR_PACKAGES.juni_fellow_enhanced.name,
        work_locations: workLocations || [{ country: "US" }],
        communication_types: ["email", "sms"],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Checkr invitation creation failed: ${res.status} - ${err.error || "Unknown error"}`);
    }
    return res.json();
    // Response includes: { id, status, invitation_url, candidate_id, package, ... }
  },

  /**
   * Retrieve invitation status.
   * GET /v1/invitations/:id
   *
   * Statuses: pending, completed, expired
   * When completed, response includes report_id.
   */
  async getInvitation(invitationId) {
    const res = await fetch(`${CHECKR_CONFIG.proxyUrl}/invitations/${invitationId}`);
    if (!res.ok) throw new Error(`Checkr invitation fetch failed: ${res.status}`);
    return res.json();
  },

  // ────────────────────────────────────────────
  //  DIRECT REPORT FLOW (Juni-Collected Consent)
  // ────────────────────────────────────────────

  /**
   * Directly create a report (when Juni collects consent, not Checkr-hosted).
   * POST /v1/reports
   *
   * Use this when Juni's own UI collects FCRA disclosure and consent.
   * Requires full candidate PII to already be in the candidate object.
   *
   * Note: Reports API cannot create Credit Reports, Health Screenings,
   * or International background checks — those require Invitation API.
   */
  async createReport(candidateId, packageName) {
    const res = await fetch(`${CHECKR_CONFIG.proxyUrl}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate_id: candidateId,
        package: packageName || CHECKR_PACKAGES.juni_fellow_enhanced.name,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Checkr report creation failed: ${res.status} - ${err.error || "Unknown error"}`);
    }
    return res.json();
    // Response: { id, object, uri, status, result, candidate_id, package, screenings[], ... }
  },

  /**
   * Retrieve a report with all screening results.
   * GET /v1/reports/:id
   *
   * Report statuses: pending, running, complete
   * Report results (when complete): null, clear, consider
   * Report assessments (with Assess enabled): null, eligible, review, escalated
   */
  async getReport(reportId) {
    const res = await fetch(`${CHECKR_CONFIG.proxyUrl}/reports/${reportId}`);
    if (!res.ok) throw new Error(`Checkr report fetch failed: ${res.status}`);
    return res.json();
  },

  /**
   * Get estimated completion time for a report.
   * GET /v1/reports/:id/eta
   *
   * Uses Checkr's proprietary ML algorithm to predict when all screenings
   * will complete. Returns estimated_completion_time as ISO 8601 datetime.
   */
  async getReportETA(reportId) {
    const res = await fetch(`${CHECKR_CONFIG.proxyUrl}/reports/${reportId}/eta`);
    if (!res.ok) throw new Error(`Checkr ETA fetch failed: ${res.status}`);
    return res.json();
    // Response: { estimated_completion_time: "2026-02-15T12:00:00Z" }
  },

  // ────────────────────────────────────────────
  //  SCREENING DETAILS
  // ────────────────────────────────────────────

  /**
   * Retrieve individual screening details.
   * GET /v1/screenings/:id
   */
  async getScreening(screeningId) {
    const res = await fetch(`${CHECKR_CONFIG.proxyUrl}/screenings/${screeningId}`);
    if (!res.ok) throw new Error(`Checkr screening fetch failed: ${res.status}`);
    return res.json();
  },

  /**
   * List all reports for a candidate.
   * GET /v1/candidates/:id/reports
   */
  async listCandidateReports(candidateId) {
    const res = await fetch(`${CHECKR_CONFIG.proxyUrl}/candidates/${candidateId}/reports`);
    if (!res.ok) throw new Error(`Checkr candidate reports fetch failed: ${res.status}`);
    return res.json();
  },

  // ────────────────────────────────────────────
  //  STATUS MAPPING
  // ────────────────────────────────────────────

  /**
   * Map Checkr report to Juni's background check tool statuses.
   *
   * Checkr report structure:
   *   { status, result, assessment, adjudication, screenings: [{ type, status, result, ... }] }
   *
   * - status: pending | running | complete
   * - result: null | clear | consider (only when status=complete)
   * - assessment: null | eligible | review | escalated (only with Assess enabled)
   * - adjudication: null | adverse (set by customer after review)
   */
  mapReportToJuniStatus(checkrReport) {
    const results = {};
    if (!checkrReport?.screenings) return results;

    for (const screening of checkrReport.screenings) {
      const juniKey = SCREENING_MAP[screening.type];
      if (!juniKey) continue;

      // Map screening status, prefer result over status when complete
      let mappedStatus;
      if (screening.status === "complete" && screening.result) {
        mappedStatus = screening.result === "clear"
          ? BG_CHECK_STATUS.PASSED
          : BG_CHECK_STATUS.WAIVER;
      } else {
        mappedStatus = CHECKR_STATUS_MAP[screening.status] || BG_CHECK_STATUS.PENDING;
      }

      // Use the worse status (most conservative) if key already exists
      // Priority: FAILED > WAIVER > IN_PROGRESS > PENDING > PASSED
      if (results[juniKey]) {
        const priority = [BG_CHECK_STATUS.FAILED, BG_CHECK_STATUS.WAIVER, BG_CHECK_STATUS.IN_PROGRESS, BG_CHECK_STATUS.PENDING, BG_CHECK_STATUS.PASSED];
        const existingPriority = priority.indexOf(results[juniKey].status);
        const newPriority = priority.indexOf(mappedStatus);
        if (newPriority < existingPriority) {
          results[juniKey] = {
            status: mappedStatus,
            completedDate: screening.completed_at,
            details: `Checkr ${screening.type}: ${screening.result || screening.status}`,
          };
        }
      } else {
        results[juniKey] = {
          status: mappedStatus,
          completedDate: screening.completed_at,
          details: `Checkr ${screening.type}: ${screening.result || screening.status}`,
        };
      }
    }

    // Apply assessment if Checkr Assess is enabled
    if (checkrReport.assessment) {
      const assessmentStatus = CHECKR_ASSESSMENT_MAP[checkrReport.assessment];
      if (assessmentStatus === BG_CHECK_STATUS.FAILED) {
        for (const key of Object.keys(results)) {
          if (results[key].status !== BG_CHECK_STATUS.PASSED) {
            results[key].status = BG_CHECK_STATUS.FAILED;
          }
        }
      }
    }

    // Overall report adjudication (set by customer after review)
    if (checkrReport.adjudication === "adverse") {
      for (const key of Object.keys(results)) {
        if (results[key].status !== BG_CHECK_STATUS.PASSED) {
          results[key].status = BG_CHECK_STATUS.FAILED;
        }
      }
    }

    return results;
  },

  // ────────────────────────────────────────────
  //  WEBHOOK PROCESSING
  // ────────────────────────────────────────────

  /**
   * Process incoming Checkr webhook event.
   *
   * Webhook delivery:
   * - Endpoint must return 2xx within timeout
   * - Retries: every 1min for 10min, then every 1hr for 24hr
   * - Events may arrive out of order — handle idempotently
   *
   * Key events for Juni:
   * - invitation.completed → Candidate finished Checkr-hosted flow, report auto-created
   * - invitation.expired → 7-day window elapsed, need new invitation
   * - report.created → Report initiated (may come before invitation.completed)
   * - report.completed → All screenings finished, result is clear or consider
   * - report.suspended → Manual review needed (rare, usually document issues)
   * - screening.completed → Individual screening finished (granular updates)
   */
  processWebhookEvent(event) {
    const { type: eventType, data } = event;

    switch (eventType) {
      // ── Invitation Events ──
      case "invitation.completed":
        return {
          action: "invitation_done",
          candidateId: data.object.candidate_id,
          invitationId: data.object.id,
          reportId: data.object.report_id,
        };
      case "invitation.expired":
        return {
          action: "invitation_expired",
          candidateId: data.object.candidate_id,
          message: "Invitation expired after 7 days. Create a new invitation.",
        };

      // ── Report Events ──
      case "report.created":
        return {
          action: "report_created",
          reportId: data.object.id,
          candidateId: data.object.candidate_id,
          status: data.object.status,
        };
      case "report.completed":
        return {
          action: "update_status",
          reportId: data.object.id,
          status: data.object.status,
          result: data.object.result,          // clear | consider
          assessment: data.object.assessment,  // eligible | review | escalated
          adjudication: data.object.adjudication,
        };
      case "report.suspended":
        return {
          action: "flag_review",
          reportId: data.object.id,
          reason: "Report suspended — manual review required. This typically occurs when additional documents or verification are needed.",
        };
      case "report.resumed":
        return {
          action: "resume_processing",
          reportId: data.object.id,
          status: data.object.status,
        };
      case "report.pre_adverse_action":
        return {
          action: "adverse_notice",
          reportId: data.object.id,
          reason: "Pre-adverse action initiated. FCRA requires waiting period before final adverse decision.",
        };
      case "report.post_adverse_action":
        return {
          action: "adverse_final",
          reportId: data.object.id,
          reason: "Post-adverse action completed. Candidate has been formally notified.",
        };

      // ── Screening Events (granular updates) ──
      case "screening.completed":
        return {
          action: "screening_update",
          screeningId: data.object.id,
          screeningType: data.object.type,
          status: data.object.status,
          result: data.object.result,
        };

      default:
        return { action: "log", eventType, data };
    }
  },
};

export default CheckrService;
