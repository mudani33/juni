import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { Input } from "../ui/Input";
import PageWrapper from "../layout/PageWrapper";

const steps = [
  {
    title: "The Spark",
    sub: "What decade was your parent\u2019s favorite?",
    kind: "grid",
    opts: [
      { l: "The 50s", e: "\uD83C\uDFB5", d: "Jukebox melodies" },
      { l: "The 60s", e: "\uD83C\uDF38", d: "Flower power" },
      { l: "The 70s", e: "\uD83D\uDD7A", d: "Disco nights" },
      { l: "The 80s", e: "\uD83D\uDCFB", d: "Boombox era" },
      { l: "The 90s", e: "\uD83D\uDCFA", d: "Golden television" },
    ],
  },
  {
    title: "The Laugh",
    sub: "What makes them laugh?",
    kind: "multi",
    opts: ["Dry wit", "Slapstick", "Puns", "Telling stories", "Other people\u2019s stories", "Wordplay"],
  },
  {
    title: "The Spark of Joy",
    sub: "What lights them up? Select all that apply.",
    kind: "multi",
    opts: ["Gardening", "Cooking", "Reading", "Music", "Sports", "Travel stories", "Grandchildren", "Puzzles", "Current events", "Faith community"],
  },
  {
    title: "The Legacy",
    sub: "If you could capture one thing from their life for your children to know, what would it be?",
    kind: "text",
  },
  {
    title: "The Practical",
    sub: "A few helpful details to get started.",
    kind: "form",
  },
];

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function VibeCheck() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const [direction, setDirection] = useState(1);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showComplete, setShowComplete] = useState(false);

  const cur = steps[step];

  const goNext = () => {
    if (step < steps.length - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      setShowComplete(true);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  // Welcome screen
  if (showWelcome) {
    return (
      <PageWrapper className="max-w-lg mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-20 h-20 rounded-3xl bg-sage-bg flex items-center justify-center mx-auto mb-8"
        >
          <Sparkles className="text-sage" size={36} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="font-serif text-4xl font-semibold text-dark mb-4 tracking-tight"
        >
          The Vibe Check
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-base text-mid font-light leading-relaxed mb-10 max-w-sm mx-auto"
        >
          Tell us about your loved one in just a few questions. This helps us find the perfect
          Fellow match — someone who\u2019ll truly connect.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <Button size="lg" onClick={() => setShowWelcome(false)}>
            Let\u2019s Begin
            <ArrowRight size={16} />
          </Button>
          <p className="text-xs text-light mt-4">Takes about 3 minutes</p>
        </motion.div>
      </PageWrapper>
    );
  }

  // Completion screen
  if (showComplete) {
    return (
      <PageWrapper className="max-w-lg mx-auto px-6 py-20 text-center">
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
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-serif text-3xl font-semibold text-dark mb-4"
        >
          Vibe Check Complete!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-base text-mid font-light leading-relaxed mb-10 max-w-sm mx-auto"
        >
          We\u2019re finding the perfect Fellow match based on everything you shared.
          Welcome to the family.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button size="lg" onClick={() => navigate("/family")}>
            View Your Dashboard
            <ArrowRight size={16} />
          </Button>
        </motion.div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="max-w-xl mx-auto px-6 py-10">
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-10">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-500 ${
              i <= step ? "bg-sage" : "bg-bg"
            }`}
          />
        ))}
      </div>

      {/* Step counter */}
      <p className="text-xs text-sage font-semibold tracking-widest uppercase mb-2">
        Step {step + 1} of {steps.length}
      </p>

      {/* Animated step content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <h2 className="font-serif text-3xl font-semibold text-dark mb-2 tracking-tight">
            {cur.title}
          </h2>
          <p className="text-base text-mid font-light leading-relaxed mb-8">{cur.sub}</p>

          {/* Grid selection */}
          {cur.kind === "grid" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {cur.opts.map((o, i) => {
                const sel = ans[step] === i;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAns({ ...ans, [step]: i })}
                    className={`py-6 px-4 rounded-2xl border-2 cursor-pointer text-center transition-all duration-200 ${
                      sel
                        ? "border-sage bg-sage-bg shadow-sm"
                        : "border-border bg-warm-white hover:border-sage/30"
                    }`}
                  >
                    <div className="text-4xl mb-2">{o.e}</div>
                    <p className="font-serif text-base font-semibold text-dark m-0">{o.l}</p>
                    <p className="text-xs text-muted mt-1 m-0">{o.d}</p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Multi selection pills */}
          {cur.kind === "multi" && (
            <div className="flex flex-wrap gap-2.5">
              {cur.opts.map((o, i) => {
                const selected = (ans[step] || []).includes(i);
                return (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      const prev = ans[step] || [];
                      setAns({ ...ans, [step]: selected ? prev.filter(x => x !== i) : [...prev, i] });
                    }}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer border-2 transition-all duration-200 ${
                      selected
                        ? "border-sage bg-sage-bg text-sage"
                        : "border-border bg-warm-white text-mid hover:border-sage/30"
                    }`}
                  >
                    {selected && <Check size={12} className="inline mr-1.5 -mt-0.5" />}
                    {o}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Text input */}
          {cur.kind === "text" && (
            <textarea
              value={ans[step] || ""}
              onChange={e => setAns({ ...ans, [step]: e.target.value })}
              placeholder="Tell us their story in your words\u2026"
              className="w-full min-h-[180px] p-5 rounded-2xl border border-border font-sans text-base leading-relaxed text-txt bg-warm-white outline-none resize-vertical focus:border-sage focus:ring-2 focus:ring-sage/10 placeholder:text-light transition-all"
            />
          )}

          {/* Form fields */}
          {cur.kind === "form" && (
            <div className="flex flex-col gap-4">
              {[
                { l: "Preferred visit times", p: "Mornings, afternoons, or evenings?" },
                { l: "Mobility considerations", p: "Any mobility needs we should know about?" },
                { l: "Topics to approach with care", p: "Anything sensitive we should be mindful of?" },
              ].map((f, i) => (
                <Input key={i} label={f.l} placeholder={f.p} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-10">
        <Button variant="secondary" onClick={goBack} disabled={step === 0}>
          <ArrowLeft size={14} />
          Back
        </Button>
        <Button onClick={goNext}>
          {step < steps.length - 1 ? "Continue" : "Find My Match"}
          <ArrowRight size={14} />
        </Button>
      </div>
    </PageWrapper>
  );
}
