import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Shield, ShieldCheck, Lock, Upload, AlertTriangle,
  Calendar, MapPin, FileCheck, ScanFace, User, Users, FlaskConical, GraduationCap,
  CheckCircle, Eye, RefreshCw, Globe, Fingerprint, Database, Radio, BadgeCheck,
} from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Stat from "../ui/Stat";
import ProgressBar from "../ui/ProgressBar";
import { Input, Select } from "../ui/Input";
import PageWrapper from "../layout/PageWrapper";
import {
  onboardingSteps, bgCheckTools, mockBgCheckResults, BG_CHECK_STATUS,
  safetyFramework, continuousMonitoring,
} from "../../lib/constants";
import useCheckrOnboarding from "../../hooks/useCheckrOnboarding";

// ── Status Badge Component ──
function CheckStatusBadge({ status }) {
  const map = {
    [BG_CHECK_STATUS.PASSED]: { variant: "sage", icon: <Check size={10} /> },
    [BG_CHECK_STATUS.FAILED]: { variant: "danger", icon: "\u2717" },
    [BG_CHECK_STATUS.IN_PROGRESS]: { variant: "blue", icon: <Radio size={10} className="animate-pulse" /> },
    [BG_CHECK_STATUS.PENDING]: { variant: "muted", icon: "\u2014" },
    [BG_CHECK_STATUS.EXPIRED]: { variant: "amber", icon: "\u26A0" },
    [BG_CHECK_STATUS.WAIVER]: { variant: "purple", icon: "!" },
  };
  const s = map[status] || map[BG_CHECK_STATUS.PENDING];
  return <Badge variant={s.variant} className="gap-1"><span>{s.icon}</span> {status}</Badge>;
}

// ── Step Icon Mapping ──
const stepIcons = {
  shield: Shield, scan: ScanFace, user: User, upload: Upload,
  users: Users, flask: FlaskConical, graduation: GraduationCap, "check-circle": CheckCircle,
};

// ── Category Icons ──
const categoryIcons = {
  identity: Fingerprint, criminal: Shield, records: FileCheck, verification: BadgeCheck, health: FlaskConical,
};

const stepVariants = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

export default function CompanionOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  // Checkr integration
  const {
    candidateId, reportId, checkrStatus, checkrResults, error: checkrError,
    createDirectReport, pollReportStatus,
  } = useCheckrOnboarding();

  // Load application data from sign-up flow
  const [applicantName, setApplicantName] = useState("Companion");
  useEffect(() => {
    try {
      const app = JSON.parse(localStorage.getItem("juni_fellow_application") || "{}");
      if (app.firstName) setApplicantName(app.firstName);
    } catch { /* ignore */ }
  }, []);

  // Step 0: Consent
  const [consent, setConsent] = useState({ disclosure: false, fcra: false, authorized: false, drugTest: false, continuous: false });
  // Step 1: Identity Verification
  const [idVerify, setIdVerify] = useState({ selfieComplete: false, idScanComplete: false, livenessComplete: false });
  // Step 2: Personal Info
  const [personalInfo, setPersonalInfo] = useState({ legal_name: "", dob: "", ssn_last4: "", address: "", city: "", state: "", zip: "" });
  // Step 3: Documents
  const [docs, setDocs] = useState({ govId: false, proofAddress: false, ssnCard: false, certifications: false });
  // Step 4: References
  const [refs, setRefs] = useState([
    { name: "", relationship: "", phone: "", email: "" },
    { name: "", relationship: "", phone: "", email: "" },
    { name: "", relationship: "", phone: "", email: "" },
  ]);
  // Step 5: Screening
  const [screening, setScreening] = useState({ scheduled: false, location: "", date: "" });
  // Step 6: Training
  const [training, setTraining] = useState({ orientation: false, safety: false, hipaa: false, elderCare: false, emergency: false });
  // Step 7: Background Check Status — use live Checkr results when available, fallback to mock
  const [bgResults, setBgResults] = useState(mockBgCheckResults);

  // When Checkr results arrive, merge them with mock data
  useEffect(() => {
    if (checkrResults) {
      setBgResults(prev => ({ ...prev, ...checkrResults }));
    }
  }, [checkrResults]);

  // Trigger Checkr report creation when consent is completed and user moves to step 1
  const handleConsentComplete = useCallback(async () => {
    if (candidateId && !reportId) {
      try {
        await createDirectReport();
      } catch { /* handled by hook */ }
    }
    setStep(1);
  }, [candidateId, reportId, createDirectReport]);

  // Poll for Checkr results when on the final step
  useEffect(() => {
    if (step !== 7 || !reportId || checkrStatus === "complete") return;
    const interval = setInterval(() => { pollReportStatus(); }, 30000);
    pollReportStatus(); // immediate first poll
    return () => clearInterval(interval);
  }, [step, reportId, checkrStatus, pollReportStatus]);

  // Validation
  const allConsented = consent.disclosure && consent.fcra && consent.authorized && consent.drugTest && consent.continuous;
  const idVerified = idVerify.selfieComplete && idVerify.idScanComplete && idVerify.livenessComplete;
  const infoComplete = personalInfo.legal_name && personalInfo.dob && personalInfo.ssn_last4 && personalInfo.address && personalInfo.city && personalInfo.state && personalInfo.zip;
  const docsComplete = docs.govId && docs.proofAddress;
  const refsComplete = refs.every(r => r.name && r.phone && r.email);
  const screeningComplete = screening.scheduled;
  const trainingComplete = training.orientation && training.safety && training.hipaa && training.elderCare && training.emergency;

  const requiredChecks = bgCheckTools.filter(c => c.required);
  const requiredPassed = requiredChecks.filter(c => bgResults[c.id]?.status === BG_CHECK_STATUS.PASSED).length;
  const allRequiredPassed = requiredPassed === requiredChecks.length;
  const totalPassed = bgCheckTools.filter(c => bgResults[c.id]?.status === BG_CHECK_STATUS.PASSED).length;
  const hasFailure = bgCheckTools.some(c => c.required && bgResults[c.id]?.status === BG_CHECK_STATUS.FAILED);

  const canProceed = [allConsented, idVerified, infoComplete, docsComplete, refsComplete, screeningComplete, trainingComplete, allRequiredPassed];
  const cur = onboardingSteps[step];

  // ── Welcome Screen ──
  if (showWelcome) {
    return (
      <PageWrapper className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue to-blue/70 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue/20"
          >
            <ShieldCheck className="text-white" size={36} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="font-serif text-4xl font-semibold text-dark mb-4 tracking-tight"
          >
            Companion Safety Onboarding
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="text-base text-mid font-light leading-relaxed mb-2 max-w-md mx-auto"
          >
            Welcome, {applicantName}. Juni maintains the strictest background screening in the industry to protect our seniors. This process ensures trust and safety for everyone.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-sm text-muted mb-10"
          >
            8 steps · TSA-grade verification · 1,300+ databases · Continuous monitoring
          </motion.p>
        </div>

        {/* PSA Safety Framework Preview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
        >
          {Object.entries(safetyFramework).map(([key, phase]) => (
            <Card key={key} className="text-center !py-6">
              <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                key === "prevent" ? "bg-blue-bg" : key === "support" ? "bg-sage-bg" : "bg-gold-bg"
              }`}>
                {key === "prevent" ? <Shield size={18} className="text-blue" /> :
                 key === "support" ? <Eye size={18} className="text-sage" /> :
                 <AlertTriangle size={18} className="text-gold" />}
              </div>
              <h3 className="font-serif text-base font-semibold mb-1">{phase.title}</h3>
              <p className="text-xs text-muted m-0">{phase.desc}</p>
            </Card>
          ))}
        </motion.div>

        {/* Key Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        >
          <Card className="!bg-gradient-to-r !from-dark !to-[#2d2d2d] text-white mb-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { v: "1,300+", l: "Databases Checked" },
                { v: "9", l: "Screening Layers" },
                { v: "12 mo", l: "Check Validity" },
                { v: "24/7", l: "Continuous Monitoring" },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold text-white m-0">{s.v}</p>
                  <p className="text-xs text-white/50 mt-1 m-0">{s.l}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="text-center"
        >
          <Button variant="blue" size="lg" onClick={() => setShowWelcome(false)}>
            Begin Safety Screening <ArrowRight size={16} />
          </Button>
          <p className="text-xs text-light mt-4 flex items-center justify-center gap-1.5">
            <Lock size={11} /> All data encrypted end-to-end · Never stored on device
          </p>
        </motion.div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="max-w-2xl mx-auto px-6 py-10">
      {/* ── Progress Header ── */}
      <div className="mb-9">
        <div className="flex gap-1 mb-4">
          {onboardingSteps.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
              i < step ? "bg-sage" : i === step ? "bg-blue" : "bg-bg"
            }`} />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-bg flex items-center justify-center">
              {(() => { const Icon = stepIcons[cur.icon]; return Icon ? <Icon size={16} className="text-blue" /> : null; })()}
            </div>
            <div>
              <p className="text-xs text-blue font-semibold tracking-widest uppercase m-0">Step {step + 1} of {onboardingSteps.length}</p>
              <p className="text-[11px] text-light m-0">Powered by Checkr · FCRA Compliant</p>
            </div>
          </div>
          <Badge variant="blue" className="!text-[10px]">
            <Shield size={10} /> Companion Screening
          </Badge>
        </div>
      </div>

      {/* ── Step Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={stepVariants}
          initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <h2 className="font-serif text-3xl font-semibold text-dark mb-2 tracking-tight">{cur.title}</h2>
          <p className="text-base text-mid font-light leading-relaxed mb-8">{cur.desc}</p>

          {/* ════════════ STEP 0: Authorization & Consent ════════════ */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <Card className="!bg-gradient-to-r !from-gold-bg !to-amber-bg/50 !border-gold/20">
                <div className="flex gap-3 items-start">
                  <Shield size={20} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-serif text-[15px] font-semibold text-dark mb-2 m-0">Senior Safety Commitment</p>
                    <p className="text-[13px] text-mid leading-relaxed m-0">
                      Juni goes <strong>beyond the industry standard</strong> with multi-layer verification across 1,300+ federal,
                      state, county, and international databases. Every Companion undergoes TSA-grade identity verification,
                      comprehensive criminal screening with manual human review, and continuous post-approval monitoring.
                      This is non-negotiable.
                    </p>
                  </div>
                </div>
              </Card>

              {[
                { k: "disclosure", label: "I acknowledge that Juni will conduct the most comprehensive background investigation in the elder care industry, including identity verification, criminal records, sex offender registries, elder abuse registries, global watchlists, drug screening, and reference verification." },
                { k: "fcra", label: "I have read and understand the Summary of Rights Under the Fair Credit Reporting Act (FCRA) and authorize Juni and its partner Checkr to obtain consumer reports for the purpose of evaluating my suitability as a Companion." },
                { k: "authorized", label: "I authorize the release of information from all federal, state, local, and international agencies, including law enforcement, to verify my identity and suitability. I understand this includes manual courthouse review of non-digitized records." },
                { k: "drugTest", label: "I consent to pre-engagement and random drug testing as a condition of my Companion role. I understand that refusal to test or a positive result for any controlled substance constitutes automatic and permanent disqualification." },
                { k: "continuous", label: "I consent to continuous criminal record monitoring, annual full background re-screening, and monthly OIG exclusion list checks for the duration of my engagement as a Companion." },
              ].map(item => (
                <motion.div key={item.k} whileTap={{ scale: 0.995 }}>
                  <Card
                    onClick={() => setConsent({ ...consent, [item.k]: !consent[item.k] })}
                    className={`cursor-pointer !border-2 transition-all ${consent[item.k] ? "!border-sage !bg-sage-bg/50" : "!border-border"}`}
                  >
                    <div className="flex gap-3.5 items-start">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        consent[item.k] ? "border-sage bg-sage" : "border-border"
                      }`}>
                        {consent[item.k] && <Check size={12} className="text-white" />}
                      </div>
                      <p className="text-sm text-txt leading-relaxed m-0">{item.label}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
              {!allConsented && (
                <p className="text-xs text-danger font-medium mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} /> All five authorizations must be accepted to proceed.
                </p>
              )}
            </div>
          )}

          {/* ════════════ STEP 1: Identity Verification ════════════ */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <Card className="!bg-blue-bg/50 !border-blue/15">
                <div className="flex gap-3 items-start">
                  <Fingerprint size={18} className="text-blue shrink-0 mt-0.5" />
                  <div>
                    <p className="font-serif text-sm font-semibold text-dark mb-1 m-0">TSA-Grade Identity Verification</p>
                    <p className="text-[13px] text-mid leading-relaxed m-0">
                      Juni uses the same identity verification technology as airports and financial institutions.
                      Your driver&apos;s license is matched against a live selfie using AI facial recognition,
                      then verified across 1,300+ databases.
                    </p>
                  </div>
                </div>
              </Card>

              {[
                { k: "idScanComplete", icon: ScanFace, title: "Scan Government-Issued ID", desc: "Position your driver's license or passport within the frame. Both sides required.", actionLabel: "Scan ID", doneLabel: "ID Scanned" },
                { k: "selfieComplete", icon: User, title: "Live Selfie Verification", desc: "Take a real-time selfie to match against your photo ID using AI facial recognition.", actionLabel: "Take Selfie", doneLabel: "Selfie Captured" },
                { k: "livenessComplete", icon: Eye, title: "Liveness Detection", desc: "Follow the on-screen prompts to confirm you are a real person (blink, turn head).", actionLabel: "Start Check", doneLabel: "Liveness Confirmed" },
              ].map(v => (
                <Card key={v.k} className={`!border-2 transition-all ${idVerify[v.k] ? "!border-sage !bg-sage-bg/30" : ""}`}>
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex gap-3 items-center flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${idVerify[v.k] ? "bg-sage/10" : "bg-bg"}`}>
                        <v.icon size={18} className={idVerify[v.k] ? "text-sage" : "text-mid"} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif text-[15px] font-semibold text-dark m-0">{v.title}</p>
                        <p className="text-xs text-muted mt-0.5 m-0">{v.desc}</p>
                      </div>
                    </div>
                    <Button variant={idVerify[v.k] ? "primary" : "blue"} size="sm" className="shrink-0"
                      onClick={() => setIdVerify({ ...idVerify, [v.k]: !idVerify[v.k] })}>
                      {idVerify[v.k] ? <><Check size={12} /> {v.doneLabel}</> : v.actionLabel}
                    </Button>
                  </div>
                </Card>
              ))}

              <div className="flex items-center gap-2 mt-2 px-1">
                <Lock size={12} className="text-blue" />
                <p className="text-xs text-muted m-0">Biometric data is processed in real-time and never stored. Powered by IDScan.net.</p>
              </div>
            </div>
          )}

          {/* ════════════ STEP 2: Personal Information ════════════ */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              {[
                { k: "legal_name", l: "Legal Full Name", p: "As it appears on government-issued ID", type: "text" },
                { k: "dob", l: "Date of Birth", p: "", type: "date" },
                { k: "ssn_last4", l: "Last 4 of SSN", p: "For identity verification only", type: "text" },
              ].map(f => (
                <Input key={f.k} label={f.l} type={f.type} placeholder={f.p} value={personalInfo[f.k]}
                  onChange={e => setPersonalInfo({ ...personalInfo, [f.k]: e.target.value })}
                  maxLength={f.k === "ssn_last4" ? 4 : undefined} />
              ))}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Input label="Street Address" placeholder="123 Main St, Apt 4" value={personalInfo.address}
                    onChange={e => setPersonalInfo({ ...personalInfo, address: e.target.value })} />
                </div>
                <Input label="City" value={personalInfo.city}
                  onChange={e => setPersonalInfo({ ...personalInfo, city: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="State" placeholder="MI" maxLength={2} value={personalInfo.state}
                  onChange={e => setPersonalInfo({ ...personalInfo, state: e.target.value })} />
                <Input label="ZIP Code" placeholder="48104" maxLength={5} value={personalInfo.zip}
                  onChange={e => setPersonalInfo({ ...personalInfo, zip: e.target.value })} />
              </div>
              <Card className="!bg-blue-bg/50 !border-blue/10">
                <div className="flex gap-2.5 items-start">
                  <Database size={14} className="text-blue shrink-0 mt-0.5" />
                  <p className="text-xs text-mid leading-relaxed m-0">
                    This information is used for multi-jurisdictional criminal records search across federal, state, and county databases.
                    Your full SSN is transmitted securely to Checkr via encrypted connection and is never stored by Juni.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* ════════════ STEP 3: Document Upload ════════════ */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              {[
                { k: "govId", l: "Government-Issued Photo ID", d: "Driver's license, passport, or state ID — both sides required", req: true },
                { k: "proofAddress", l: "Proof of Current Address", d: "Utility bill, bank statement, or lease dated within 90 days", req: true },
                { k: "ssnCard", l: "Social Security Card", d: "Or W-2/1099 showing full SSN (optional but expedites processing)", req: false },
                { k: "certifications", l: "Relevant Certifications", d: "CPR, First Aid, CNA, or other elder care certifications", req: false },
              ].map(doc => (
                <Card key={doc.k} className={`!border-2 transition-all ${docs[doc.k] ? "!border-sage !bg-sage-bg/30" : ""}`}>
                  <div className="flex justify-between items-start flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-serif text-[15px] font-semibold text-dark m-0">{doc.l}</p>
                        {doc.req && <Badge variant="danger" className="!text-[9px] uppercase">Required</Badge>}
                      </div>
                      <p className="text-[13px] text-muted m-0">{doc.d}</p>
                    </div>
                    <Button variant={docs[doc.k] ? "primary" : "secondary"} size="sm"
                      onClick={() => setDocs({ ...docs, [doc.k]: !docs[doc.k] })}>
                      {docs[doc.k] ? <><Check size={12} /> Uploaded</> : <><Upload size={12} /> Upload</>}
                    </Button>
                  </div>
                </Card>
              ))}
              <Card className="!bg-bg">
                <p className="text-xs text-muted leading-relaxed m-0">
                  Accepted formats: JPG, PNG, PDF. Max: 10MB. Documents must be clear, unaltered, and show complete information.
                  Blurred, cropped, or tampered documents will be rejected and may delay your screening.
                </p>
              </Card>
            </div>
          )}

          {/* ════════════ STEP 4: References ════════════ */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <Card className="!bg-blue-bg/50 !border-blue/10">
                <div className="flex gap-2.5 items-start">
                  <Users size={16} className="text-blue shrink-0 mt-0.5" />
                  <p className="text-[13px] text-mid leading-relaxed m-0">
                    Provide at least 3 professional references who can speak to your character, reliability, and suitability
                    for working with elderly individuals. References will be contacted via phone and email by our internal review team.
                    <strong className="text-dark"> Family members are not accepted.</strong>
                  </p>
                </div>
              </Card>
              {refs.map((ref, idx) => (
                <Card key={idx}>
                  <p className="font-serif text-[15px] font-semibold text-dark mb-4 m-0">
                    Reference {idx + 1} <Badge variant="danger" className="ml-2 !text-[9px] uppercase">Required</Badge>
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Full Name" value={ref.name}
                      onChange={e => { const n = [...refs]; n[idx] = { ...n[idx], name: e.target.value }; setRefs(n); }} />
                    <Input label="Relationship" placeholder="e.g., Former supervisor" value={ref.relationship}
                      onChange={e => { const n = [...refs]; n[idx] = { ...n[idx], relationship: e.target.value }; setRefs(n); }} />
                    <Input label="Phone" type="tel" value={ref.phone}
                      onChange={e => { const n = [...refs]; n[idx] = { ...n[idx], phone: e.target.value }; setRefs(n); }} />
                    <Input label="Email" type="email" value={ref.email}
                      onChange={e => { const n = [...refs]; n[idx] = { ...n[idx], email: e.target.value }; setRefs(n); }} />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ════════════ STEP 5: Drug Screening ════════════ */}
          {step === 5 && (
            <div className="flex flex-col gap-4">
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <FlaskConical size={18} className="text-blue" />
                  <h3 className="font-serif text-lg font-semibold m-0">10-Panel Drug Screening</h3>
                </div>
                <p className="text-sm text-mid leading-relaxed font-light mb-5">
                  A comprehensive 10-panel drug test including opioids, amphetamines, benzodiazepines, cannabinoids, cocaine,
                  methadone, barbiturates, phencyclidine, propoxyphene, and methaqualone. Must be completed within 7 days of scheduling.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <Select label="Preferred Location" value={screening.location}
                    onChange={e => setScreening({ ...screening, location: e.target.value })}>
                    <option value="">Select a location...</option>
                    <option value="downtown">Quest Diagnostics - Downtown</option>
                    <option value="midtown">Quest Diagnostics - Midtown</option>
                    <option value="suburban">Quest Diagnostics - Suburban East</option>
                  </Select>
                  <Input label="Preferred Date" type="date" value={screening.date}
                    onChange={e => setScreening({ ...screening, date: e.target.value })} />
                </div>
                {!screening.scheduled ? (
                  <Button variant="blue" disabled={!screening.location || !screening.date}
                    onClick={() => setScreening({ ...screening, scheduled: true })}>
                    <MapPin size={14} /> Schedule Appointment
                  </Button>
                ) : (
                  <div className="flex items-center gap-2.5 px-5 py-3.5 bg-sage-bg rounded-xl border border-sage/20">
                    <Check size={16} className="text-sage" />
                    <p className="text-sm text-sage font-semibold m-0">Appointment Scheduled — Confirmation Sent</p>
                  </div>
                )}
              </Card>
              <Card className="!bg-gold-bg !border-gold/20">
                <div className="flex gap-3 items-start">
                  <AlertTriangle size={16} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-serif text-sm font-semibold text-dark mb-1 m-0">Zero-Tolerance Policy</p>
                    <ul className="m-0 pl-4 text-[13px] text-mid leading-relaxed">
                      <li>Bring government-issued photo ID to the appointment</li>
                      <li>Arrive 15 minutes early for registration</li>
                      <li>No-show or refusal = <strong>automatic permanent disqualification</strong></li>
                      <li>Positive result for any substance = <strong>automatic permanent disqualification</strong></li>
                      <li>Random re-testing may occur at any time during your engagement</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ════════════ STEP 6: Safety Training ════════════ */}
          {step === 6 && (
            <div className="flex flex-col gap-4">
              <Card className="!bg-blue-bg/50 !border-blue/15">
                <div className="flex gap-3 items-start">
                  <GraduationCap size={18} className="text-blue shrink-0 mt-0.5" />
                  <p className="text-[13px] text-mid leading-relaxed m-0">
                    Complete all mandatory training modules before your background checks finalize.
                    Each module includes a short assessment. You must pass with 80% or higher.
                  </p>
                </div>
              </Card>
              {[
                { k: "orientation", title: "Juni Orientation", desc: "Platform overview, Companion role expectations, and scope of services", duration: "15 min" },
                { k: "safety", title: "Senior Safety & Boundaries", desc: "Physical safety protocols, professional boundaries, and incident reporting", duration: "25 min" },
                { k: "hipaa", title: "HIPAA & Privacy Compliance", desc: "Handling sensitive health information, confidentiality, and CMS fraud/waste/abuse", duration: "20 min" },
                { k: "elderCare", title: "Elder Care Essentials", desc: "Dementia awareness, fall prevention, emergency recognition, cultural competency", duration: "30 min" },
                { k: "emergency", title: "Emergency Response", desc: "Crisis protocols, when to call 911, seizure and fall response, emergency contacts", duration: "15 min" },
              ].map(mod => (
                <Card key={mod.k} className={`!border-2 transition-all ${training[mod.k] ? "!border-sage !bg-sage-bg/30" : ""}`}>
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex gap-3 items-center flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${training[mod.k] ? "bg-sage/10" : "bg-bg"}`}>
                        <GraduationCap size={16} className={training[mod.k] ? "text-sage" : "text-mid"} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-serif text-[15px] font-semibold text-dark m-0">{mod.title}</p>
                          <Badge variant="danger" className="!text-[9px] uppercase shrink-0">Required</Badge>
                        </div>
                        <p className="text-xs text-muted mt-0.5 m-0">{mod.desc}</p>
                        <p className="text-[11px] text-light mt-1 m-0">{mod.duration} · Assessment included</p>
                      </div>
                    </div>
                    <Button variant={training[mod.k] ? "primary" : "secondary"} size="sm" className="shrink-0"
                      onClick={() => setTraining({ ...training, [mod.k]: !training[mod.k] })}>
                      {training[mod.k] ? <><Check size={12} /> Passed</> : "Start"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ════════════ STEP 7: Background Check Status Dashboard ════════════ */}
          {step === 7 && (
            <div>
              {/* Overall Status Banner */}
              <Card className={`mb-6 !border-2 ${
                allRequiredPassed
                  ? "!bg-gradient-to-br !from-sage-bg !to-[#e8f5e8] !border-sage/20"
                  : hasFailure
                    ? "!bg-gradient-to-br !from-danger-bg !to-[#fbe9e7] !border-danger/20"
                    : "!bg-gradient-to-br !from-blue-bg !to-[#e3f2fd] !border-blue/20"
              }`}>
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {allRequiredPassed
                        ? <ShieldCheck size={28} className="text-sage" />
                        : hasFailure
                          ? <AlertTriangle size={28} className="text-danger" />
                          : <RefreshCw size={28} className="text-blue animate-spin" style={{ animationDuration: "3s" }} />
                      }
                      <h3 className="font-serif text-xl font-semibold text-dark m-0">
                        {allRequiredPassed ? "Clearance Approved" : hasFailure ? "Action Required" : "Screening In Progress"}
                      </h3>
                    </div>
                    <p className="text-sm text-mid font-light m-0">
                      {allRequiredPassed
                        ? "All required background checks have passed. You are cleared to begin as a Juni Companion."
                        : hasFailure
                          ? "One or more required checks have failed. Please contact our Trust & Safety team."
                          : "Your background checks are being processed across 1,300+ databases. We\u2019ll notify you when complete."}
                    </p>
                  </div>
                  <div className="flex gap-5">
                    <Stat label="Required" value={`${requiredPassed}/${requiredChecks.length}`} color={allRequiredPassed ? "sage" : "danger"} />
                    <Stat label="Total" value={`${totalPassed}/${bgCheckTools.length}`} color="blue" />
                  </div>
                </div>
                <div className="mt-5">
                  <ProgressBar value={(requiredPassed / requiredChecks.length) * 100}
                    color={allRequiredPassed ? "sage" : hasFailure ? "danger" : "blue"} height="h-2" />
                </div>
              </Card>

              {/* Checks grouped by category */}
              {["criminal", "identity", "verification", "records", "health"].map(cat => {
                const checksInCat = bgCheckTools.filter(c => c.category === cat);
                if (checksInCat.length === 0) return null;
                const CatIcon = categoryIcons[cat];
                const catLabels = { criminal: "Criminal & Registry Checks", identity: "Identity Verification", verification: "Reference & Education", records: "Records", health: "Health Screening" };
                return (
                  <div key={cat} className="mb-4">
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <CatIcon size={14} className="text-muted" />
                      <span className="text-xs text-muted uppercase tracking-widest font-semibold">{catLabels[cat]}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {checksInCat.map(check => {
                        const result = bgResults[check.id] || { status: BG_CHECK_STATUS.PENDING };
                        const isPassed = result.status === BG_CHECK_STATUS.PASSED;
                        const isFailed = result.status === BG_CHECK_STATUS.FAILED;
                        const isInProgress = result.status === BG_CHECK_STATUS.IN_PROGRESS;
                        return (
                          <Card key={check.id} padding="p-4" className={`!border-l-4 ${
                            isPassed ? "!border-l-sage" : isFailed ? "!border-l-danger" : isInProgress ? "!border-l-blue" : "!border-l-bg"
                          }`}>
                            <div className="flex justify-between items-start flex-wrap gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="font-serif text-sm font-semibold text-dark m-0 truncate">{check.name}</p>
                                  {check.required && <Badge variant="danger" className="!text-[8px] !px-1.5 !py-0 uppercase shrink-0">Req</Badge>}
                                </div>
                                <p className="text-[11px] text-muted m-0 line-clamp-2">{check.desc}</p>
                                <p className="text-[10px] text-light mt-1 m-0">{check.provider} · {check.estimatedDays}</p>
                                {result.details && (
                                  <p className={`text-[11px] mt-1.5 m-0 italic ${isPassed ? "text-sage" : isFailed ? "text-danger" : "text-mid"}`}>
                                    {result.details}
                                  </p>
                                )}
                              </div>
                              <CheckStatusBadge status={result.status} />
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Continuous Monitoring */}
              <Card className="mt-4 !bg-gradient-to-r !from-dark !to-[#2d2d2d] text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={18} className="text-blue" />
                  <h3 className="font-serif text-base font-semibold m-0">Continuous Post-Approval Monitoring</h3>
                </div>
                <p className="text-xs text-white/60 mb-4 m-0">
                  Your background screening doesn&apos;t end at approval. Juni maintains continuous monitoring for the duration of your engagement.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {continuousMonitoring.map((m, i) => (
                    <div key={i} className="flex gap-2.5 items-start p-3 rounded-lg bg-white/5">
                      <RefreshCw size={12} className="text-blue shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-white m-0">{m.name}</p>
                        <p className="text-[10px] text-white/40 mt-0.5 m-0">{m.frequency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Policy Notice */}
              <Card className="mt-4 !bg-gold-bg !border-gold/20">
                <div className="flex gap-3 items-start">
                  <Shield size={18} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-serif text-sm font-semibold text-dark mb-1 m-0">Zero-Tolerance Compliance Policy</p>
                    <p className="text-[13px] text-mid leading-relaxed m-0">
                      All required background checks must pass before any Companion can be matched with a senior.
                      Results are valid for 12 months with mandatory annual renewal. Any failed required check triggers
                      immediate suspension. Juni maintains the strictest safety standards in the elder care industry — no exceptions.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Checkr Status Indicator ── */}
      {checkrStatus === "running" && step < 7 && (
        <div className="mt-6 p-3 rounded-xl bg-blue-bg border border-blue/15">
          <div className="flex items-center gap-2">
            <RefreshCw size={12} className="text-blue animate-spin" style={{ animationDuration: "3s" }} />
            <p className="text-xs text-blue font-medium m-0">
              Background screening in progress via Checkr. Continue completing your steps while we process.
            </p>
          </div>
        </div>
      )}

      {/* ── Navigation Footer ── */}
      <div className="flex justify-between mt-10">
        <Button variant="secondary" onClick={() => step > 0 ? setStep(step - 1) : setShowWelcome(true)}>
          <ArrowLeft size={14} /> {step === 0 ? "Overview" : "Back"}
        </Button>
        {step === 0 && (
          <Button variant="blue" onClick={() => { if (canProceed[0]) handleConsentComplete(); }} disabled={!canProceed[0]}>
            Authorize & Continue <ArrowRight size={14} />
          </Button>
        )}
        {step > 0 && step < onboardingSteps.length - 1 && (
          <Button variant="blue" onClick={() => canProceed[step] && setStep(step + 1)} disabled={!canProceed[step]}>
            Continue <ArrowRight size={14} />
          </Button>
        )}
        {step === onboardingSteps.length - 1 && allRequiredPassed && (
          <Button onClick={() => { localStorage.setItem("juni_fellow_cleared", "true"); navigate("/companion"); }}>
            <ShieldCheck size={14} /> Access Companion Portal
          </Button>
        )}
        {step === onboardingSteps.length - 1 && !allRequiredPassed && (
          <Button disabled>
            <RefreshCw size={14} className="animate-spin" style={{ animationDuration: "3s" }} /> Awaiting Clearance
          </Button>
        )}
      </div>
    </PageWrapper>
  );
}
