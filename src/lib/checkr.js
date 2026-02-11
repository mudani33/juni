/*
 * ═══════════════════════════════════════════════════════════════
 *  CHECKR API — Background Check Service Layer
 *  Routes all API calls through backend proxy for security.
 *  API keys are NEVER exposed to the client.
 * ═══════════════════════════════════════════════════════════════
 */

import { BG_CHECK_STATUS } from "./constants";

export const CHECKR_CONFIG = {
  baseUrl: "https://api.checkr.com/v1",
  proxyUrl: "/api/checkr",
  webhookPath: "/webhooks/checkr",
};

// Checkr screening package definitions mapped to Juni's requirements
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

// Checkr report status mapping to Juni internal statuses
const CHECKR_STATUS_MAP = {
  pending: BG_CHECK_STATUS.PENDING,
  running: BG_CHECK_STATUS.IN_PROGRESS,
  complete: BG_CHECK_STATUS.PASSED,
  consider: BG_CHECK_STATUS.WAIVER,
  suspended: BG_CHECK_STATUS.IN_PROGRESS,
  dispute: BG_CHECK_STATUS.IN_PROGRESS,
  clear: BG_CHECK_STATUS.PASSED,
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

/**
 * Checkr API service — all calls routed through backend proxy for security.
 * In production, the backend proxy at /api/checkr handles authentication
 * with Checkr's API using server-side stored credentials.
 */
const CheckrService = {
  /** Step 1: Create a candidate in Checkr */
  async createCandidate({ firstName, lastName, email, phone, dob, ssn, zipcode }) {
    const res = await fetch(`${CHECKR_CONFIG.proxyUrl}/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        dob,
        ssn,
        zipcode,
        work_locations: [{ country: "US", state: null, city: null }],
        custom_id: `juni_fellow_${Date.now()}`,
      }),
    });
    if (!res.ok) throw new Error(`Checkr candidate creation failed: ${res.status}`);
    return res.json();
  },

  /** Step 2: Create an invitation (Checkr-hosted consent/disclosure flow) */
  async createInvitation(candidateId, packageName) {
    const res = await fetch(`${CHECKR_CONFIG.proxyUrl}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate_id: candidateId,
        package: packageName || CHECKR_PACKAGES.juni_fellow_standard.name,
        communication_types: ["email", "sms"],
      }),
    });
    if (!res.ok) throw new Error(`Checkr invitation creation failed: ${res.status}`);
    return res.json();
  },

  /** Step 3: Directly create a report (when Juni collects consent, not Checkr-hosted) */
  async createReport(candidateId, packageName) {
    const res = await fetch(`${CHECKR_CONFIG.proxyUrl}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate_id: candidateId,
        package: packageName || CHECKR_PACKAGES.juni_fellow_standard.name,
      }),
    });
    if (!res.ok) throw new Error(`Checkr report creation failed: ${res.status}`);
    return res.json();
  },

  /** Step 4: Retrieve a report with all screening results */
  async getReport(reportId) {
    const res = await fetch(`${CHECKR_CONFIG.proxyUrl}/reports/${reportId}`);
    if (!res.ok) throw new Error(`Checkr report fetch failed: ${res.status}`);
    return res.json();
  },

  /** Step 5: Retrieve individual screening details */
  async getScreening(screeningId) {
    const res = await fetch(`${CHECKR_CONFIG.proxyUrl}/screenings/${screeningId}`);
    if (!res.ok) throw new Error(`Checkr screening fetch failed: ${res.status}`);
    return res.json();
  },

  /** Step 6: List all reports for a candidate */
  async listCandidateReports(candidateId) {
    const res = await fetch(`${CHECKR_CONFIG.proxyUrl}/candidates/${candidateId}/reports`);
    if (!res.ok) throw new Error(`Checkr candidate reports fetch failed: ${res.status}`);
    return res.json();
  },

  /** Map Checkr report to Juni's background check tool statuses */
  mapReportToJuniStatus(checkrReport) {
    const results = {};
    if (!checkrReport?.screenings) return results;

    for (const screening of checkrReport.screenings) {
      const juniKey = SCREENING_MAP[screening.type];
      if (!juniKey) continue;

      const mappedStatus = CHECKR_STATUS_MAP[screening.status] || BG_CHECK_STATUS.PENDING;

      // Use the worse status (most conservative) if key already exists
      if (results[juniKey]) {
        const priority = [BG_CHECK_STATUS.FAILED, BG_CHECK_STATUS.WAIVER, BG_CHECK_STATUS.IN_PROGRESS, BG_CHECK_STATUS.PENDING, BG_CHECK_STATUS.PASSED];
        const existingPriority = priority.indexOf(results[juniKey].status);
        const newPriority = priority.indexOf(mappedStatus);
        if (newPriority < existingPriority) {
          results[juniKey] = { status: mappedStatus, completedDate: screening.completed_at, details: `Checkr ${screening.type}: ${screening.status}` };
        }
      } else {
        results[juniKey] = { status: mappedStatus, completedDate: screening.completed_at, details: `Checkr ${screening.type}: ${screening.status}` };
      }
    }

    // Overall report adjudication
    if (checkrReport.adjudication === "adverse") {
      for (const key of Object.keys(results)) {
        if (results[key].status !== BG_CHECK_STATUS.PASSED) {
          results[key].status = BG_CHECK_STATUS.FAILED;
        }
      }
    }

    return results;
  },

  /** Process incoming Checkr webhook event */
  processWebhookEvent(event) {
    const { type: eventType, data } = event;
    switch (eventType) {
      case "report.completed":
        return { action: "update_status", reportId: data.object.id, status: data.object.status, adjudication: data.object.adjudication };
      case "report.suspended":
        return { action: "flag_review", reportId: data.object.id, reason: "Report suspended - manual review required" };
      case "report.pre_adverse_action":
        return { action: "adverse_notice", reportId: data.object.id, reason: "Pre-adverse action initiated" };
      case "invitation.completed":
        return { action: "invitation_done", candidateId: data.object.candidate_id, invitationId: data.object.id };
      case "invitation.expired":
        return { action: "invitation_expired", candidateId: data.object.candidate_id };
      default:
        return { action: "log", eventType, data };
    }
  },
};

export default CheckrService;
