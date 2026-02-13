import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Heart,
  Lock,
  Star,
  Music,
  BookOpen,
  Sparkles,
  Eye,
  EyeOff,
  Check,
  Shield,
} from "lucide-react";
import Button from "../ui/Button";
import { Input, Select } from "../ui/Input";
import PageWrapper from "../layout/PageWrapper";

/* ───────────── Fake match data (teaser) ───────────── */

const matchPreviews = [
  {
    initials: "SC",
    name: "Sarah C.",
    age: 34,
    kindred: 96,
    traits: ["Storyteller", "Bilingual", "Musical"],
    color: "bg-sage",
    bio: "Former music therapist who loves cooking Italian food and listening to jazz records.",
    matchReasons: ["Shared love of Italian cooking", "Musical background", "Fluent in Spanish"],
  },
  {
    initials: "JM",
    name: "James M.",
    age: 41,
    kindred: 91,
    traits: ["Patient", "Outdoorsy", "Great listener"],
    color: "bg-blue",
    bio: "Retired teacher with a passion for gardening, crossword puzzles, and long conversations.",
    matchReasons: ["Teaching background", "Gardening enthusiast", "Calm, grounding presence"],
  },
  {
    initials: "RL",
    name: "Rosa L.",
    age: 29,
    kindred: 89,
    traits: ["Energetic", "Creative", "Tech-savvy"],
    color: "bg-gold",
    bio: "Art student who volunteers at senior centers and teaches watercolor painting classes.",
    matchReasons: ["Creative arts background", "Experience with seniors", "Warm energy"],
  },
];

/* ───────────── Animation ───────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

/* ───────────── Component ───────────── */

export default function FamilySignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    howHeard: "",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Pull parent name from vibe check answers
  const vibeData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("juni_vibe_check") || "{}");
    } catch {
      return {};
    }
  }, []);
  const parentName = vibeData.parentName || "your parent";

  const set = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim()) errs.lastName = "Required";
    if (!form.email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.phone.trim()) errs.phone = "Required";
    if (!form.password) errs.password = "Required";
    else if (form.password.length < 8) errs.password = "At least 8 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    if (!form.agreeTerms) errs.agreeTerms = "You must agree to continue";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    // Save family account info
    localStorage.setItem(
      "juni_family_account",
      JSON.stringify({
        ...form,
        password: undefined,
        parentName,
        createdAt: new Date().toISOString(),
      }),
    );
    setSubmitted(true);
  };

  /* ───── Success / Redirect Screen ───── */
  if (submitted) {
    return (
      <PageWrapper className="max-w-lg mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-sage flex items-center justify-center mx-auto mb-8"
        >
          <Check className="text-white" size={36} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-serif text-3xl font-semibold text-dark mb-4"
        >
          Welcome to Juni, {form.firstName}!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-base text-mid font-light leading-relaxed mb-10 max-w-sm mx-auto"
        >
          Your account is set up. Let's meet the Fellows we've matched for {parentName} — you
          can review their profiles, read why they're a fit, and schedule a meet-and-greet.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button size="lg" onClick={() => navigate("/family")}>
            See Your Matches
            <ArrowRight size={16} />
          </Button>
        </motion.div>
      </PageWrapper>
    );
  }

  /* ───── Main Layout: Match Teaser + Sign Up Form ───── */
  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage-bg text-sage text-sm font-semibold mb-6">
              <Sparkles size={14} />
              Vibe Check Complete
            </div>
          </motion.div>
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="font-serif text-4xl sm:text-5xl font-semibold text-dark mb-4 tracking-tight"
          >
            Great news — we found Fellows for{" "}
            <span className="bg-gradient-to-r from-sage to-sage-soft bg-clip-text text-transparent">
              {parentName}
            </span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-base text-mid font-light leading-relaxed max-w-lg mx-auto"
          >
            Based on everything you shared, our algorithm matched {parentName} with companions
            who fit their personality, interests, and care needs. Create your account to see the
            full profiles.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* ───── Left: Match Teasers ───── */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="flex flex-col gap-4"
          >
            <p className="text-xs text-sage font-semibold tracking-widest uppercase mb-1">
              Top matches for {parentName}
            </p>

            {matchPreviews.map((fellow, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-border bg-warm-white p-5 overflow-hidden"
              >
                {/* Blur overlay for 2nd and 3rd */}
                {i > 0 && (
                  <div className="absolute inset-0 bg-warm-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="text-center">
                      <Lock size={20} className="text-muted mx-auto mb-2" />
                      <p className="text-sm font-medium text-mid m-0">
                        Create your account to view
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  {/* Avatar */}
                  <div
                    className={`w-14 h-14 rounded-2xl ${fellow.color} text-white flex items-center justify-center font-bold text-lg shrink-0`}
                  >
                    {fellow.initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif text-lg font-semibold text-dark m-0">
                        {fellow.name}
                      </h3>
                      <span className="text-xs text-muted">Age {fellow.age}</span>
                      <div className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage-bg">
                        <Heart size={10} className="text-sage fill-sage" />
                        <span className="text-xs font-bold text-sage">{fellow.kindred}%</span>
                      </div>
                    </div>

                    <p className="text-sm text-mid font-light leading-relaxed mb-3 m-0">
                      {fellow.bio}
                    </p>

                    {/* Match reasons */}
                    <div className="mb-3">
                      <p className="text-[10px] text-sage font-semibold tracking-wider uppercase mb-1.5 m-0">
                        Why they match
                      </p>
                      <div className="flex flex-col gap-1">
                        {fellow.matchReasons.map((reason, j) => (
                          <div key={j} className="flex items-center gap-1.5 text-xs text-mid">
                            <Check size={10} className="text-sage shrink-0" />
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Traits */}
                    <div className="flex flex-wrap gap-1.5">
                      {fellow.traits.map((trait) => (
                        <span
                          key={trait}
                          className="px-2.5 py-1 rounded-full bg-bg text-xs text-muted font-medium"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Social proof */}
            <div className="rounded-xl bg-bg p-4 text-center">
              <div className="flex items-center justify-center gap-6">
                {[
                  { v: "94%", l: "Avg Kindred Match" },
                  { v: "4.9", l: "Family Rating" },
                  { v: "< 48hrs", l: "Time to First Visit" },
                ].map((s, i) => (
                  <div key={i}>
                    <p className="text-lg font-bold text-dark m-0">{s.v}</p>
                    <p className="text-[10px] text-muted m-0">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ───── Right: Sign Up Form ───── */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
            className="rounded-2xl border border-border bg-warm-white p-8"
          >
            <h2 className="font-serif text-2xl font-semibold text-dark mb-2">
              Create Your Account
            </h2>
            <p className="text-sm text-mid font-light mb-6">
              Set up your family account to view full Fellow profiles, schedule a meet-and-greet,
              and start building {parentName}'s trust circle.
            </p>

            <div className="flex flex-col gap-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    label="First name"
                    placeholder="Your first name"
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-danger mt-1 m-0">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <Input
                    label="Last name"
                    placeholder="Your last name"
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-danger mt-1 m-0">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
                {errors.email && (
                  <p className="text-xs text-danger mt-1 m-0">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <Input
                  label="Phone number"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
                {errors.phone && (
                  <p className="text-xs text-danger mt-1 m-0">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-muted hover:text-mid transition-colors bg-transparent border-none cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-danger mt-1 m-0">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Input
                  label="Confirm password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-danger mt-1 m-0">{errors.confirmPassword}</p>
                )}
              </div>

              {/* How did you hear */}
              <Select
                label="How did you hear about Juni?"
                value={form.howHeard}
                onChange={(e) => set("howHeard", e.target.value)}
              >
                <option value="">Select…</option>
                <option value="google">Google search</option>
                <option value="friend">Friend or family</option>
                <option value="doctor">Doctor or care provider</option>
                <option value="social">Social media</option>
                <option value="employer">My employer</option>
                <option value="other">Other</option>
              </Select>

              {/* Terms */}
              <div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={(e) => set("agreeTerms", e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-border text-sage accent-sage cursor-pointer"
                  />
                  <span className="text-xs text-mid leading-relaxed">
                    I agree to Juni's Terms of Service and Privacy Policy. I understand that
                    my information will be used to match my family member with a Fellow and to
                    provide ongoing social health tracking.
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-xs text-danger mt-1 m-0">{errors.agreeTerms}</p>
                )}
              </div>

              {/* Submit */}
              <Button size="lg" className="w-full mt-2" onClick={handleSubmit}>
                Create Account & View Matches
                <ArrowRight size={16} />
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted">
                <Shield size={12} />
                <span>Your data is encrypted and never shared with third parties</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
