import { useState, useCallback } from "react";
import CheckrService, { CHECKR_PACKAGES } from "../lib/checkr";

/**
 * Custom hook for managing Checkr-integrated Fellow onboarding.
 * Handles candidate creation, invitation flow, report creation,
 * and status polling against Checkr's API (via backend proxy).
 */
export default function useCheckrOnboarding() {
  const [candidateId, setCandidateId] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [invitationUrl, setInvitationUrl] = useState(null);
  const [checkrStatus, setCheckrStatus] = useState("idle"); // idle | creating | invited | running | complete | error
  const [checkrResults, setCheckrResults] = useState(null);
  const [error, setError] = useState(null);

  /** Create candidate and initiate Checkr-hosted consent flow */
  const initiateBackgroundCheck = useCallback(async (fellowInfo) => {
    setCheckrStatus("creating");
    setError(null);
    try {
      const candidate = await CheckrService.createCandidate({
        firstName: fellowInfo.firstName,
        lastName: fellowInfo.lastName,
        email: fellowInfo.email,
        phone: fellowInfo.phone,
        dob: fellowInfo.dob,
        ssn: fellowInfo.ssn,
        zipcode: fellowInfo.zipcode,
      });
      setCandidateId(candidate.id);

      const invitation = await CheckrService.createInvitation(
        candidate.id,
        CHECKR_PACKAGES.juni_fellow_enhanced.name,
      );
      setInvitationUrl(invitation.invitation_url);
      setCheckrStatus("invited");

      return { candidateId: candidate.id, invitationUrl: invitation.invitation_url };
    } catch (err) {
      setError(err.message);
      setCheckrStatus("error");
      throw err;
    }
  }, []);

  /** Create a direct report (when consent is collected by Juni, not Checkr-hosted) */
  const createDirectReport = useCallback(async () => {
    if (!candidateId) throw new Error("No candidate ID available");
    setCheckrStatus("running");
    setError(null);
    try {
      const report = await CheckrService.createReport(
        candidateId,
        CHECKR_PACKAGES.juni_fellow_enhanced.name,
      );
      setReportId(report.id);
      return report;
    } catch (err) {
      setError(err.message);
      setCheckrStatus("error");
      throw err;
    }
  }, [candidateId]);

  /** Poll Checkr for current report status and map to Juni statuses */
  const pollReportStatus = useCallback(async () => {
    if (!reportId) return null;
    try {
      const report = await CheckrService.getReport(reportId);
      const mappedResults = CheckrService.mapReportToJuniStatus(report);
      setCheckrResults(mappedResults);

      if (report.status === "complete") {
        setCheckrStatus("complete");
      }
      return { report, mappedResults };
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [reportId]);

  return {
    candidateId,
    reportId,
    invitationUrl,
    checkrStatus,
    checkrResults,
    error,
    initiateBackgroundCheck,
    createDirectReport,
    pollReportStatus,
  };
}
