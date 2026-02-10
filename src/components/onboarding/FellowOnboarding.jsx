import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Shield, Lock, Upload, AlertTriangle, Calendar, MapPin, FileCheck } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { Input, Select } from "../ui/Input";
import Stat from "../ui/Stat";
import Badge from "../ui/Badge";
import ProgressBar from "../ui/ProgressBar";
import PageWrapper from "../layout/PageWrapper";
import { onboardingSteps, bgCheckTools, mockBgCheckResults, BG_CHECK_STATUS } from "../../lib/constants";

function CheckStatusBadge({ status }) {
  const map = {
    [BG_CHECK_STATUS.PASSED]: { variant: "sage", icon: <Check size={10} /> },
    [BG_CHECK_STATUS.FAILED]: { variant: "danger", icon: "\u2717" },
    [BG_CHECK_STATUS.IN_PROGRESS]: { variant: "blue", icon: "\u25CB" },
    [BG_CHECK_STATUS.PENDING]: { variant: "muted", icon: "\u2014" },
    [BG_CHECK_STATUS.EXPIRED]: { variant: "amber", icon: "\u26A0" },
    [BG_CHECK_STATUS.WAIVER]: { variant: "purple", icon: "!" },
  };
  const s = map[status] || map[BG_CHECK_STATUS.PENDING];
  return (
    <Badge variant={s.variant} className="gap-1">
      <span>{s.icon}</span> {status}
    </Badge>
  );
}

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const bgCheckIcons = {
  identity: Shield, criminal: Shield, sex_offender: Shield, elder_abuse: Shield,
  driving: FileCheck, references: FileCheck, education: FileCheck, drug_screen: FileCheck,
};

export default function FellowOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState({ disclosure: false, fcra: false, authorized: false, drugTest: false });
  const [personalInfo, setPersonalInfo] = useState({ legal_name: "", dob: "", ssn_last4: "", address: "", city: "", state: "", zip: "" });
  const [docs, setDocs] = useState({ govId: false, proofAddress: false, ssnCard: false });
  const [refs, setRefs] = useState([
    { name: "", relationship: "", phone: "", email: "" },
    { name: "", relationship: "", phone: "", email: "" },
    { name: "", relationship: "", phone: "", email: "" },
  ]);
  const [screening, setScreening] = useState({ scheduled: false, location: "", date: "" });
  const [bgResults] = useState(mockBgCheckResults);
  const [showWelcome, setShowWelcome] = useState(true);

  const allConsented = consent.disclosure && consent.fcra && consent.authorized && consent.drugTest;
  const infoComplete = personalInfo.legal_name && personalInfo.dob && personalInfo.ssn_last4 && personalInfo.address && personalInfo.city && personalInfo.state && personalInfo.zip;
  const docsComplete = docs.govId && docs.proofAddress;
  const refsComplete = refs.every(r => r.name && r.phone && r.email);
  const screeningComplete = screening.scheduled;

  const requiredChecks = bgCheckTools.filter(c => c.required);
  const requiredPassed = requiredChecks.filter(c => bgResults[c.id]?.status === BG_CHECK_STATUS.PASSED).length;
  const allRequiredPassed = requiredPassed === requiredChecks.length;
  const totalPassed = bgCheckTools.filter(c => bgResults[c.id]?.status === BG_CHECK_STATUS.PASSED).length;

  const canProceed = [allConsented, infoComplete, docsComplete, refsComplete, screeningComplete, allRequiredPassed];
  const cur = onboardingSteps[step];

  // Welcome screen
  if (showWelcome) {
    return (
      <PageWrapper className="max-w-lg mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-20 h-20 rounded-3xl bg-blue-bg flex items-center justify-center mx-auto mb-8"
        >
          <Shield className="text-blue" size={36} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="font-serif text-4xl font-semibold text-dark mb-4 tracking-tight"
        >
          Fellow Onboarding
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-base text-mid font-light leading-relaxed mb-3 max-w-sm mx-auto"
        >
          Welcome, Jordan. To protect our seniors, we require comprehensive background verification
          before matching begins.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted mb-10"
        >
          6 steps · All information is encrypted end-to-end
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button variant="blue" size="lg" onClick={() => setShowWelcome(false)}>
            Begin Onboarding
            <ArrowRight size={16} />
          </Button>
        </motion.div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="max-w-2xl mx-auto px-6 py-10">
      {/* Progress */}
      <div className="mb-9">
        <div className="flex gap-1.5 mb-4">
          {onboardingSteps.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-500 ${
              i < step ? "bg-sage" : i === step ? "bg-blue" : "bg-bg"
            }`} />
          ))}
        </div>
        <div className="flex justify-between items-baseline">
          <p className="text-xs text-blue font-semibold tracking-widest uppercase m-0">
            Step {step + 1} of {onboardingSteps.length}
          </p>
          <p className="text-xs text-light m-0">Fellow Onboarding</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={stepVariants}
          initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <h2 className="font-serif text-3xl font-semibold text-dark mb-2 tracking-tight">{cur.title}</h2>
          <p className="text-base text-mid font-light leading-relaxed mb-8">{cur.desc}</p>

          {/* Step 0: Consent */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <Card className="!bg-gold-bg !border-gold/20">
                <div className="flex gap-3 items-start">
                  <AlertTriangle size={18} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-serif text-[15px] font-semibold text-dark mb-2 m-0">Important Disclosure</p>
                    <p className="text-[13px] text-mid leading-relaxed m-0">
                      Juni requires comprehensive background screening for all Fellows before they can be matched with seniors.
                      This includes criminal records checks, sex offender registry searches, elder abuse registry verification,
                      drug screening, and reference verification.
                    </p>
                  </div>
                </div>
              </Card>
              {[
                { k: "disclosure", label: "I acknowledge that Juni will conduct a comprehensive background investigation as a condition of my engagement as a Fellow." },
                { k: "fcra", label: "I have read and understand the Summary of Rights Under the Fair Credit Reporting Act (FCRA) and authorize Juni to obtain consumer reports for employment purposes." },
                { k: "authorized", label: "I authorize the release of information from all federal, state, and local agencies, including law enforcement, to verify my suitability as a Fellow." },
                { k: "drugTest", label: "I consent to pre-employment and random drug testing as a condition of my role, understanding that refusal constitutes automatic disqualification." },
              ].map(item => (
                <motion.div key={item.k} whileTap={{ scale: 0.99 }}>
                  <Card
                    onClick={() => setConsent({ ...consent, [item.k]: !consent[item.k] })}
                    className={`cursor-pointer !border-2 transition-all ${
                      consent[item.k] ? "!border-sage !bg-sage-bg" : "!border-border"
                    }`}
                  >
                    <div className="flex gap-3.5 items-start">
                      <div className={`w-5.5 h-5.5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
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
                <p className="text-xs text-danger font-medium mt-1">All four authorizations must be accepted to proceed.</p>
              )}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              {[
                { k: "legal_name", l: "Legal Full Name", p: "As it appears on government-issued ID", type: "text" },
                { k: "dob", l: "Date of Birth", p: "", type: "date" },
                { k: "ssn_last4", l: "Last 4 of SSN", p: "For identity verification only", type: "text" },
              ].map(f => (
                <Input
                  key={f.k}
                  label={f.l}
                  type={f.type}
                  placeholder={f.p}
                  value={personalInfo[f.k]}
                  onChange={e => setPersonalInfo({ ...personalInfo, [f.k]: e.target.value })}
                  maxLength={f.k === "ssn_last4" ? 4 : undefined}
                />
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
              <Card className="!bg-blue-bg !border-blue/10">
                <div className="flex gap-2.5 items-start">
                  <Lock size={14} className="text-blue shrink-0 mt-0.5" />
                  <p className="text-xs text-mid leading-relaxed m-0">
                    Your personal information is encrypted end-to-end and only shared with authorized background check providers. Juni never stores full SSN data.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Step 2: Documents */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              {[
                { k: "govId", l: "Government-Issued Photo ID", d: "Driver's license, passport, or state ID", req: true },
                { k: "proofAddress", l: "Proof of Current Address", d: "Utility bill, bank statement, or lease (within 90 days)", req: true },
                { k: "ssnCard", l: "Social Security Card", d: "Or W-2/1099 showing full SSN (optional)", req: false },
              ].map(doc => (
                <Card key={doc.k} className={`!border-2 transition-all ${docs[doc.k] ? "!border-sage !bg-sage-bg" : ""}`}>
                  <div className="flex justify-between items-start flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-serif text-base font-semibold text-dark m-0">{doc.l}</p>
                        {doc.req && <Badge variant="danger" className="!text-[9px] uppercase">Required</Badge>}
                      </div>
                      <p className="text-[13px] text-muted m-0">{doc.d}</p>
                    </div>
                    <Button
                      variant={docs[doc.k] ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setDocs({ ...docs, [doc.k]: !docs[doc.k] })}
                    >
                      {docs[doc.k] ? <><Check size={12} /> Uploaded</> : <><Upload size={12} /> Upload</>}
                    </Button>
                  </div>
                </Card>
              ))}
              <Card className="!bg-bg">
                <p className="text-xs text-muted leading-relaxed m-0">
                  Accepted formats: JPG, PNG, PDF. Max file size: 10MB. All documents must be clear, unaltered, and show complete information.
                </p>
              </Card>
            </div>
          )}

          {/* Step 3: References */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <Card className="!bg-blue-bg !border-blue/10">
                <p className="text-[13px] text-mid leading-relaxed m-0">
                  Provide at least 3 professional references who can speak to your character, reliability, and suitability
                  for working with elderly individuals. <strong>Family members are not accepted as references.</strong>
                </p>
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

          {/* Step 4: Screening */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={18} className="text-blue" />
                  <h3 className="font-serif text-lg font-semibold m-0">Drug Screening</h3>
                </div>
                <p className="text-sm text-mid leading-relaxed font-light mb-5">
                  A 10-panel drug screening is required at an authorized Quest Diagnostics location. You must complete your
                  screening within 7 days of scheduling.
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
                    <MapPin size={14} />
                    Schedule Appointment
                  </Button>
                ) : (
                  <div className="flex items-center gap-2.5 px-5 py-3.5 bg-sage-bg rounded-xl border border-sage/20">
                    <Check size={16} className="text-sage" />
                    <p className="text-sm text-sage font-semibold m-0">Appointment Scheduled</p>
                  </div>
                )}
              </Card>
              <Card className="!bg-gold-bg !border-gold/20">
                <div className="flex gap-3 items-start">
                  <AlertTriangle size={16} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-serif text-sm font-semibold text-dark mb-1 m-0">Testing Requirements</p>
                    <ul className="m-0 pl-4 text-[13px] text-mid leading-relaxed">
                      <li>Bring your government-issued photo ID to the appointment</li>
                      <li>Arrive 15 minutes early for registration</li>
                      <li>No-show or refusal to test results in immediate disqualification</li>
                      <li>Positive results for any controlled substance are disqualifying</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 5: Review & Status */}
          {step === 5 && (
            <div>
              {/* Status Banner */}
              <Card className={`mb-6 !border-2 ${
                allRequiredPassed
                  ? "!bg-gradient-to-br !from-sage-bg !to-[#e8f5e8] !border-sage/20"
                  : "!bg-gradient-to-br !from-blue-bg !to-[#e3f2fd] !border-blue/20"
              }`}>
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{allRequiredPassed ? "\u2705" : "\u23F3"}</span>
                      <h3 className="font-serif text-xl font-semibold text-dark m-0">
                        {allRequiredPassed ? "Clearance Approved" : "Checks In Progress"}
                      </h3>
                    </div>
                    <p className="text-sm text-mid font-light m-0">
                      {allRequiredPassed
                        ? "All required background checks have passed. You are cleared to begin."
                        : "Your background checks are being processed. We\u2019ll notify you when complete."}
                    </p>
                  </div>
                  <div className="flex gap-5">
                    <Stat label="Required" value={`${requiredPassed}/${requiredChecks.length}`} color={allRequiredPassed ? "sage" : "danger"} />
                    <Stat label="Total" value={`${totalPassed}/${bgCheckTools.length}`} color="blue" />
                  </div>
                </div>
                <div className="mt-5">
                  <ProgressBar value={(requiredPassed / requiredChecks.length) * 100} color={allRequiredPassed ? "sage" : "blue"} height="h-2" />
                </div>
              </Card>

              {/* Individual checks */}
              <div className="flex flex-col gap-3">
                {bgCheckTools.map(check => {
                  const result = bgResults[check.id] || { status: BG_CHECK_STATUS.PENDING };
                  const isPassed = result.status === BG_CHECK_STATUS.PASSED;
                  const isFailed = result.status === BG_CHECK_STATUS.FAILED;
                  const isInProgress = result.status === BG_CHECK_STATUS.IN_PROGRESS;
                  return (
                    <Card key={check.id} className={`!border-l-4 ${
                      isPassed ? "!border-l-sage" : isFailed ? "!border-l-danger" : isInProgress ? "!border-l-blue" : "!border-l-bg"
                    }`}>
                      <div className="flex justify-between items-start flex-wrap gap-3">
                        <div className="flex gap-3 items-start flex-1">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-serif text-[15px] font-semibold text-dark m-0">{check.name}</p>
                              {check.required && <Badge variant="danger" className="!text-[9px] uppercase">Required</Badge>}
                            </div>
                            <p className="text-[13px] text-muted mb-1 m-0">{check.desc}</p>
                            <p className="text-[11px] text-light m-0">Provider: {check.provider} · Est. {check.estimatedDays}</p>
                            {result.details && (
                              <p className={`text-xs mt-2 m-0 italic ${isPassed ? "text-sage" : isFailed ? "text-danger" : "text-mid"}`}>
                                {result.details}
                              </p>
                            )}
                            {result.completedDate && <p className="text-[11px] text-light mt-1 m-0">Completed: {result.completedDate}</p>}
                          </div>
                        </div>
                        <CheckStatusBadge status={result.status} />
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Policy notice */}
              <Card className="mt-6 !bg-gold-bg !border-gold/20">
                <div className="flex gap-3 items-start">
                  <AlertTriangle size={18} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-serif text-sm font-semibold text-dark mb-1 m-0">Strict Compliance Policy</p>
                    <p className="text-[13px] text-mid leading-relaxed m-0">
                      All required background checks must be completed and passed before any Fellow can be matched with a senior.
                      Results are valid for 12 months and must be renewed annually. Juni maintains a zero-tolerance policy for the safety of our seniors.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-10">
        <Button variant="secondary" onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0}>
          <ArrowLeft size={14} /> Back
        </Button>
        {step < onboardingSteps.length - 1 ? (
          <Button variant="blue" onClick={() => canProceed[step] && setStep(step + 1)} disabled={!canProceed[step]}>
            Continue <ArrowRight size={14} />
          </Button>
        ) : allRequiredPassed ? (
          <Button onClick={() => navigate("/fellow")}>
            Complete Onboarding <Check size={14} />
          </Button>
        ) : (
          <Button disabled>Awaiting Clearance</Button>
        )}
      </div>
    </PageWrapper>
  );
}
