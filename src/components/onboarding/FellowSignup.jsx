import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, Heart, Shield, ShieldCheck, Users, Star,
  MapPin, Mail, Phone, User, Calendar, Check, Lock, Sparkles,
  BookOpen, GraduationCap, Clock, DollarSign, AlertTriangle,
} from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { Input, TextArea, Select } from "../ui/Input";
import PageWrapper from "../layout/PageWrapper";
import api, { ApiError } from "../../lib/api";

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function CompanionSignup() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const [step, setStep] = useState(0); // 0: welcome, 1: personal, 2: about, 3: submit/confirm
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    dob: "", zipcode: "", city: "", state: "",
    motivation: "", experience: "", availability: "",
    interests: [],
    hearAbout: "",
  });

  const set = (key, val) => setForm({ ...form, [key]: val });

  const interestOptions = [
    "Cooking & Food", "Music & Arts", "Travel Stories", "History & Culture",
    "Gardening", "Photography", "Sports & Games", "Reading & Literature",
    "Technology", "Faith & Spirituality", "Crafts & DIY", "Pets & Animals",
  ];

  const toggleInterest = (interest) => {
    set("interests", form.interests.includes(interest)
      ? form.interests.filter(i => i !== interest)
      : [...form.interests, interest]
    );
  };

  const step1Valid = form.firstName && form.lastName && form.email && form.phone && form.dob && form.zipcode;
  const step2Valid = form.motivation && form.availability && form.interests.length >= 2;

  const handleSubmit = async () => {
    setSubmitting(true);
    setApiError("");
    try {
      await api.auth.registerCompanion({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        dob: form.dob || undefined,
        zipcode: form.zipcode || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        motivation: form.motivation || undefined,
        experience: form.experience || undefined,
        availability: form.availability || undefined,
        interests: form.interests,
        hearAbout: form.hearAbout || undefined,
      });
      setSubmitted(true);
      setStep(3);
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Welcome Screen ──
  if (step === 0) {
    return (
      <PageWrapper className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sage to-sage-soft flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sage/20"
          >
            <Users className="text-white" size={36} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="font-serif text-4xl font-semibold text-dark mb-4 tracking-tight"
          >
            Become a Juni Companion
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="text-base text-mid font-light leading-relaxed mb-2 max-w-md mx-auto"
          >
            You&apos;re not applying for a gig. You&apos;re joining a movement to end senior loneliness.
            Juni Companions are trained companions who build real, lasting relationships.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-sm text-muted mb-10"
          >
            5-minute application · Background screening by Checkr · Matched within 48 hours
          </motion.p>
        </div>

        {/* What You'll Get */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10"
        >
          {[
            { icon: DollarSign, color: "text-sage", bg: "bg-sage-bg", title: "$22\u2013$35/hour", desc: "Competitive pay with weekly direct deposit" },
            { icon: Clock, color: "text-blue", bg: "bg-blue-bg", title: "Flexible Schedule", desc: "Choose your hours, build your own caseload" },
            { icon: GraduationCap, color: "text-gold", bg: "bg-gold-bg", title: "Paid Training", desc: "Elder care, dementia, HIPAA, and more" },
            { icon: Heart, color: "text-sage", bg: "bg-sage-bg", title: "Meaningful Impact", desc: "Be the highlight of someone's week" },
          ].map((item, i) => (
            <Card key={i} className="!py-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon size={18} className={item.color} />
                </div>
                <div>
                  <p className="font-serif text-sm font-semibold text-dark m-0">{item.title}</p>
                  <p className="text-xs text-muted m-0">{item.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Application Steps Preview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="mb-10"
        >
          <Card className="!bg-bg">
            <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-4 m-0">Your Path to Becoming a Companion</p>
            <div className="flex flex-col gap-3">
              {[
                { num: "1", title: "Quick Application", desc: "5 minutes \u2014 tell us about yourself and why you want to be a Companion", active: true },
                { num: "2", title: "Background Screening", desc: "Checkr-powered 9-layer verification across 1,300+ databases" },
                { num: "3", title: "Safety Training", desc: "Complete mandatory orientation, HIPAA, and elder care modules" },
                { num: "4", title: "Kindred Matching", desc: "Our AI matches you with seniors who share your interests and personality" },
                { num: "5", title: "Start Visiting", desc: "Begin building relationships, creating legacy moments, and getting paid" },
              ].map((s) => (
                <div key={s.num} className={`flex items-center gap-3 p-3 rounded-xl ${s.active ? "bg-sage-bg border border-sage/20" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${s.active ? "bg-sage text-white" : "bg-border text-muted"}`}>
                    {s.num}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold m-0 ${s.active ? "text-sage" : "text-dark"}`}>{s.title}</p>
                    <p className="text-[11px] text-muted m-0">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="text-center"
        >
          <Button size="lg" onClick={() => setStep(1)}>
            Start Your Application <ArrowRight size={16} />
          </Button>
          <p className="text-xs text-light mt-4 flex items-center justify-center gap-1.5">
            <Lock size={11} /> All data encrypted · Background check by Checkr · FCRA compliant
          </p>
        </motion.div>
      </PageWrapper>
    );
  }

  // ── Submitted Confirmation ──
  if (step === 3 && submitted) {
    return (
      <PageWrapper className="max-w-lg mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sage to-sage-soft flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sage/20">
            <Check className="text-white" size={36} />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-dark mb-3">
            Application Received, {form.firstName}!
          </h1>
          <p className="text-base text-mid font-light leading-relaxed mb-2">
            We&apos;re excited to have you. Here&apos;s what happens next:
          </p>

          <Card className="text-left mt-8 mb-8">
            <div className="flex flex-col gap-4">
              {[
                { icon: Mail, title: "Check Your Email", desc: `We've sent a Checkr background screening invitation to ${form.email}. Complete it within 7 days.`, color: "text-blue", active: true },
                { icon: Shield, title: "Background Screening", desc: "Our 9-layer verification runs across 1,300+ databases. Most results arrive within 3\u20135 days.", color: "text-sage" },
                { icon: GraduationCap, title: "Safety Training", desc: "Once screening begins, you can start your mandatory training modules right away.", color: "text-gold" },
                { icon: Users, title: "Get Matched", desc: "After clearance, our AI matches you with seniors based on personality, interests, and location.", color: "text-sage" },
              ].map((s, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${s.active ? "bg-blue-bg border border-blue/15" : ""}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.active ? "bg-blue/10" : "bg-bg"}`}>
                    <s.icon size={16} className={s.color} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark m-0">{s.title}</p>
                    <p className="text-xs text-muted mt-0.5 m-0">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-3 justify-center flex-wrap">
            <Button onClick={() => navigate("/companion/onboarding")}>
              Continue to Screening <ArrowRight size={14} />
            </Button>
            <Button variant="secondary" onClick={() => navigate("/")}>
              Return Home
            </Button>
          </div>

          <p className="text-xs text-light mt-6 flex items-center justify-center gap-1.5">
            <ShieldCheck size={11} /> Background screening powered by Checkr · FCRA compliant
          </p>
        </motion.div>
      </PageWrapper>
    );
  }

  // ── Application Form Steps ──
  return (
    <PageWrapper className="max-w-2xl mx-auto px-6 py-10">
      {/* Progress */}
      <div className="mb-9">
        <div className="flex gap-1 mb-4">
          {[1, 2].map((i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
              i < step ? "bg-sage" : i === step ? "bg-blue" : "bg-bg"
            }`} />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sage-bg flex items-center justify-center">
              <Users size={16} className="text-sage" />
            </div>
            <div>
              <p className="text-xs text-sage font-semibold tracking-widest uppercase m-0">
                Step {step} of 2
              </p>
              <p className="text-[11px] text-light m-0">Companion Application</p>
            </div>
          </div>
          <Badge variant="sage" className="!text-[10px]">
            <Sparkles size={10} /> Quick Apply
          </Badge>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={stepVariants}
          initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* ── STEP 1: Personal Info ── */}
          {step === 1 && (
            <div>
              <h2 className="font-serif text-3xl font-semibold text-dark mb-2 tracking-tight">About You</h2>
              <p className="text-base text-mid font-light leading-relaxed mb-8">
                Let&apos;s start with the basics. This information is used to verify your identity and begin the Checkr background screening.
              </p>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="First Name" placeholder="Jordan" value={form.firstName}
                    onChange={e => set("firstName", e.target.value)} />
                  <Input label="Last Name" placeholder="Rivera" value={form.lastName}
                    onChange={e => set("lastName", e.target.value)} />
                </div>

                <Input label="Email" type="email" placeholder="jordan@email.com" value={form.email}
                  onChange={e => set("email", e.target.value)} />

                <Input label="Phone" type="tel" placeholder="(555) 123-4567" value={form.phone}
                  onChange={e => set("phone", e.target.value)} />

                <Input label="Date of Birth" type="date" value={form.dob}
                  onChange={e => set("dob", e.target.value)} />

                <div className="grid grid-cols-3 gap-3">
                  <Input label="ZIP Code" placeholder="48104" maxLength={5} value={form.zipcode}
                    onChange={e => set("zipcode", e.target.value)} />
                  <Input label="City" placeholder="Ann Arbor" value={form.city}
                    onChange={e => set("city", e.target.value)} />
                  <Input label="State" placeholder="MI" maxLength={2} value={form.state}
                    onChange={e => set("state", e.target.value)} />
                </div>

                <Card className="!bg-blue-bg/50 !border-blue/10 mt-2">
                  <div className="flex gap-2.5 items-start">
                    <Shield size={14} className="text-blue shrink-0 mt-0.5" />
                    <p className="text-xs text-mid leading-relaxed m-0">
                      Your information is securely transmitted to Checkr for identity verification.
                      Juni never stores your SSN or sensitive documents on our servers.
                      Full SSN will only be requested during the Checkr screening process.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ── STEP 2: About & Motivation ── */}
          {step === 2 && (
            <div>
              <h2 className="font-serif text-3xl font-semibold text-dark mb-2 tracking-tight">Why Juni?</h2>
              <p className="text-base text-mid font-light leading-relaxed mb-8">
                Help us understand why you&apos;d be a great Companion. There are no wrong answers — we value authenticity.
              </p>

              <div className="flex flex-col gap-5">
                <TextArea
                  label="Why do you want to be a Juni Companion?"
                  placeholder="Tell us what draws you to companionship work with seniors. Maybe you have a grandparent who inspired you, or you've seen the impact of loneliness firsthand..."
                  value={form.motivation}
                  onChange={e => set("motivation", e.target.value)}
                />

                <TextArea
                  label="Relevant experience (optional)"
                  placeholder="Any experience with elder care, caregiving, social work, volunteering, or similar roles..."
                  value={form.experience}
                  onChange={e => set("experience", e.target.value)}
                />

                <Select label="Availability" value={form.availability}
                  onChange={e => set("availability", e.target.value)}>
                  <option value="">Select your availability...</option>
                  <option value="full-time">Full-time (30+ hours/week)</option>
                  <option value="part-time">Part-time (15\u201330 hours/week)</option>
                  <option value="flexible">Flexible (10\u201315 hours/week)</option>
                  <option value="weekends">Weekends only</option>
                </Select>

                <div>
                  <p className="text-sm font-semibold text-dark mb-3">
                    Select your interests <span className="text-muted font-normal">(choose at least 2)</span>
                  </p>
                  <p className="text-xs text-muted mb-3 m-0">
                    We use these to match you with seniors who share your passions.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map(interest => (
                      <motion.button
                        key={interest}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleInterest(interest)}
                        className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border-none ${
                          form.interests.includes(interest)
                            ? "bg-sage text-white shadow-sm shadow-sage/20"
                            : "bg-bg text-mid hover:bg-border"
                        }`}
                      >
                        {form.interests.includes(interest) && <Check size={10} className="inline mr-1" />}
                        {interest}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <Select label="How did you hear about Juni?" value={form.hearAbout}
                  onChange={e => set("hearAbout", e.target.value)}>
                  <option value="">Select...</option>
                  <option value="social-media">Social media</option>
                  <option value="friend">Friend or family member</option>
                  <option value="job-board">Job board (Indeed, LinkedIn)</option>
                  <option value="university">University or career services</option>
                  <option value="search">Google search</option>
                  <option value="other">Other</option>
                </Select>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation ── */}
      <div className="flex justify-between mt-10">
        <Button variant="secondary" onClick={() => step > 1 ? setStep(step - 1) : setStep(0)}>
          <ArrowLeft size={14} /> {step === 1 ? "Overview" : "Back"}
        </Button>

        {step === 1 && (
          <Button variant="blue" onClick={() => setStep(2)} disabled={!step1Valid}>
            Continue <ArrowRight size={14} />
          </Button>
        )}

        {step === 2 && (
          <Button
            onClick={handleSubmit}
            disabled={!step2Valid || submitting}
          >
            {submitting ? (
              <><span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" /> Submitting...</>
            ) : (
              <><ShieldCheck size={14} /> Submit Application</>
            )}
          </Button>
        )}
      </div>

      {apiError && (
        <div className="mt-4 p-3 rounded-xl bg-gold-bg border border-gold/20">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-gold shrink-0 mt-0.5" />
            <p className="text-xs text-mid m-0">{apiError}</p>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
