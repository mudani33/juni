import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, BarChart3, BookOpen, ArrowRight, Check, Minus, Sparkles, Shield, Eye,
  AlertTriangle, ShieldCheck, Users, Star, DollarSign, GraduationCap, Clock,
  UserCheck, Handshake, Search, CalendarCheck,
} from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import PageWrapper from "../layout/PageWrapper";
import { safetyFramework } from "../../lib/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
};

const pillars = [
  { icon: Heart, color: "text-sage", bg: "bg-sage-bg", title: "One Dedicated Person", desc: "No rotating strangers. Your parent gets a single Companion who knows their stories, their quirks, and how they take their coffee." },
  { icon: BarChart3, color: "text-blue", bg: "bg-blue-bg", title: "You'll See the Difference", desc: "After every visit, track engagement, memory recall, and mood — so you know your parent is truly doing better, not just being watched." },
  { icon: BookOpen, color: "text-gold", bg: "bg-gold-bg", title: "Their Stories Live On", desc: "Every visit captures a piece of who they are — memoirs, voice recordings, life lessons — preserved for your family forever." },
];

const familySteps = [
  { num: "1", icon: Search, title: "Take the Vibe Check", desc: "A 5-minute guided conversation about your parent — their personality, interests, care needs, and what matters most to you." },
  { num: "2", icon: UserCheck, title: "Create Your Account", desc: "Sign up to see your parent's top Companion matches, ranked by our Kindred matching algorithm." },
  { num: "3", icon: CalendarCheck, title: "Meet Your Match", desc: "Review Companion profiles, see why they fit, and schedule a video or in-person meet-and-greet." },
  { num: "4", icon: Heart, title: "Watch Them Bloom", desc: "After every visit, see the Daily Bloom — mood, memory, engagement, and legacy moments captured beautifully." },
];

const companionSteps = [
  { num: "1", icon: Users, title: "Quick Application", desc: "5 minutes — tell us about yourself, your interests, and why you want to be a Companion." },
  { num: "2", icon: Shield, title: "Background Screening", desc: "Checkr-powered 9-layer verification across 1,300+ databases. TSA-grade identity checks." },
  { num: "3", icon: GraduationCap, title: "Safety Training", desc: "Complete mandatory training in elder care, dementia awareness, HIPAA, and emergency response." },
  { num: "4", icon: Handshake, title: "Get Matched & Start", desc: "Our AI matches you with seniors who share your interests and personality. Start visiting and get paid." },
];

const plans = [
  { name: "Essentials", feats: ["8 hours/month", "Standard matching", "Weekly Summary", "Text Legacy Vault"], no: ["Predictive Alerts", "Partner Integration"] },
  { name: "Premium", popular: true, feats: ["16 hours/month", "Priority matching", "Per-visit Daily Bloom", "Text + Audio Legacy", "Predictive Alerts"], no: ["Partner Integration"] },
  { name: "Legacy", feats: ["24+ hours/month", "Concierge matching", "Bloom + Audio per visit", "Full Legacy Vault", "Alerts + Clinical Escalation", "Trust Partner Integration"], no: [] },
];

/* ═══════════════════════════════════════════════════════════════
   Interactive "How It Works" stepper — tab toggle + auto-advance
   ═══════════════════════════════════════════════════════════════ */

const AUTO_ADVANCE_MS = 3000;

/* Static class maps — Tailwind needs full class names at build time */
const accentClasses = {
  sage: {
    toggleActive: "bg-sage text-white shadow-md",
    stepActive: "border-sage bg-sage-bg shadow-sm",
    iconActive: "bg-sage shadow-md",
    iconPast: "bg-sage-bg",
    checkColor: "text-sage",
    labelColor: "text-sage",
    progressBar: "bg-sage",
    cardBorder: "border-sage/15",
    iconBox: "bg-sage-bg",
    iconColor: "text-sage",
    divider: "bg-sage/10",
    nextBtn: "text-sage",
  },
  blue: {
    toggleActive: "bg-blue text-white shadow-md",
    stepActive: "border-blue bg-blue-bg shadow-sm",
    iconActive: "bg-blue shadow-md",
    iconPast: "bg-blue-bg",
    checkColor: "text-blue",
    labelColor: "text-blue",
    progressBar: "bg-blue",
    cardBorder: "border-blue/15",
    iconBox: "bg-blue-bg",
    iconColor: "text-blue",
    divider: "bg-blue/10",
    nextBtn: "text-blue",
  },
};

function HowItWorks({ navigate }) {
  const [path, setPath] = useState("family");
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = path === "family" ? familySteps : companionSteps;
  const a = accentClasses[path === "family" ? "sage" : "blue"];
  const cur = steps[active];
  const StepIcon = cur.icon;

  // Auto-advance with progress bar
  useEffect(() => {
    setProgress(0);
    const tick = 50;
    const inc = (tick / AUTO_ADVANCE_MS) * 100;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p + inc >= 100) {
          setActive((prev) => (prev + 1) % steps.length);
          return 0;
        }
        return p + inc;
      });
    }, tick);
    return () => clearInterval(interval);
  }, [active, path, steps.length]);

  const selectStep = useCallback((i) => {
    setActive(i);
    setProgress(0);
  }, []);

  const switchPath = useCallback((p) => {
    setPath(p);
    setActive(0);
    setProgress(0);
  }, []);

  return (
    <section id="how-it-works" className="bg-bg py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="font-serif text-4xl font-semibold mb-3"
          >
            How Juni Works
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-base text-muted font-light mb-8"
          >
            Two paths, one mission — ending senior loneliness.
          </motion.p>

          {/* ── Path Toggle ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
            className="inline-flex bg-warm-white rounded-2xl p-1.5 border border-border shadow-sm"
          >
            {[
              { id: "family", label: "For Families", icon: Heart, activeCls: "bg-sage text-white shadow-md" },
              { id: "companion", label: "For Companions", icon: Users, activeCls: "bg-blue text-white shadow-md" },
            ].map(({ id, label, icon: Icon, activeCls }) => (
              <button
                key={id}
                onClick={() => switchPath(id === "companion" ? "companion" : id)}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border-none cursor-pointer ${
                  (id === "companion" ? path !== "family" : path === id) ? activeCls : "bg-transparent text-muted hover:text-dark"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* ── Step Selector ── */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3}
        >
          {/* Horizontal step buttons */}
          <div className="flex items-center justify-between mb-2 gap-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === active;
              const isPast = i < active;
              return (
                <button
                  key={`${path}-${i}`}
                  onClick={() => selectStep(i)}
                  className={`flex-1 group relative flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-2 cursor-pointer transition-all duration-300 bg-transparent ${
                    isActive
                      ? a.stepActive
                      : isPast
                        ? "border-border bg-warm-white"
                        : "border-transparent hover:border-border hover:bg-warm-white"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? a.iconActive
                      : isPast
                        ? a.iconPast
                        : "bg-bg group-hover:bg-border"
                  }`}>
                    {isPast ? (
                      <Check size={16} className={a.checkColor} />
                    ) : (
                      <Icon size={16} className={isActive ? "text-white" : "text-mid group-hover:text-dark"} />
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-[10px] font-bold tracking-wider uppercase m-0 transition-colors duration-300 ${
                      isActive ? a.labelColor : "text-light"
                    }`}>
                      Step {s.num}
                    </p>
                    <p className={`text-xs font-semibold m-0 mt-0.5 transition-colors duration-300 hidden sm:block ${
                      isActive ? "text-dark" : "text-muted"
                    }`}>
                      {s.title}
                    </p>
                  </div>
                  {/* Progress timer bar */}
                  {isActive && (
                    <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-border overflow-hidden">
                      <div
                        className={`h-full ${a.progressBar} rounded-full transition-none`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Active Step Content Card ── */}
          <div className="mt-6 min-h-[180px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${path}-${active}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`rounded-2xl border-2 ${a.cardBorder} bg-warm-white p-8 sm:p-10`}
              >
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {/* Large Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${a.iconBox} flex items-center justify-center shrink-0`}>
                    <StepIcon size={28} className={a.iconColor} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-bold tracking-wider uppercase ${a.labelColor}`}>
                        Step {cur.num}
                      </span>
                      <div className={`h-px flex-1 ${a.divider}`} />
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-dark mb-3 m-0">
                      {cur.title}
                    </h3>
                    <p className="text-base text-mid font-light leading-relaxed m-0 mb-6">
                      {cur.desc}
                    </p>

                    {/* CTA on last step, next-step hint otherwise */}
                    {active === steps.length - 1 ? (
                      <Button
                        variant={path === "family" ? "primary" : "blue"}
                        onClick={() => navigate(path === "family" ? "/onboarding" : "/companion/signup")}
                      >
                        {path === "family" ? "Start the Vibe Check" : "Apply Now"}
                        <ArrowRight size={14} />
                      </Button>
                    ) : (
                      <button
                        onClick={() => selectStep(active + 1)}
                        className={`flex items-center gap-1.5 text-sm font-semibold ${a.nextBtn} bg-transparent border-none cursor-pointer hover:gap-2.5 transition-all duration-200 p-0`}
                      >
                        Next: {steps[active + 1].title}
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Interactive Two-Path cards ────────────────────────────────────────────────

const checkVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.07, duration: 0.28, ease: "easeOut" },
  }),
};

function PathCards({ navigate }) {
  const [hovered, setHovered] = useState(null);

  const cards = [
    {
      id: "family",
      badge: "For Families",
      badgeVariant: "sage",
      title: "Find a Companion for Your Parent",
      desc: "You can't always be there — but someone who truly gets them can. Take a 5-minute Vibe Check and we'll match your parent with a companion based on who they actually are.",
      items: ["5-min Vibe Check about your parent", "See top Companion matches instantly", "Schedule a meet-and-greet", "Track social health after every visit"],
      Icon: Heart,
      iconCls: "text-sage",
      iconBg: "bg-sage-bg",
      glow: "rgba(140,190,150,0.13)",
      borderHover: "rgba(120,175,135,0.45)",
      shadowHover: "0 20px 56px rgba(100,165,115,0.13)",
      cta: "Start the Vibe Check",
      ctaVariant: "primary",
      path: "/onboarding",
      checkCls: "text-sage",
      topBar: "from-sage to-sage-soft",
    },
    {
      id: "companion",
      badge: "For Companions",
      badgeVariant: "blue",
      title: "Become a Juni Companion",
      desc: "This isn't a gig. Companions are trained individuals who build real relationships, preserve legacy, and get paid to make the world a little less lonely.",
      items: ["$22–$35/hr with flexible scheduling", "Paid training in elder care & safety", "Background screened by Checkr", "Matched by personality & interests"],
      Icon: Users,
      iconCls: "text-blue",
      iconBg: "bg-blue-bg",
      glow: "rgba(90,140,210,0.11)",
      borderHover: "rgba(80,130,200,0.4)",
      shadowHover: "0 20px 56px rgba(70,120,190,0.12)",
      cta: "Apply in 5 Minutes",
      ctaVariant: "blue",
      path: "/companion/signup",
      checkCls: "text-blue",
      topBar: "from-blue to-blue/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {cards.map((card, ci) => {
        const { Icon } = card;
        const isHov = hovered === card.id;
        const isDimmed = hovered !== null && hovered !== card.id;
        return (
          <motion.div
            key={card.id}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={ci}
            animate={{ opacity: isDimmed ? 0.52 : 1, scale: isHov ? 1.018 : isDimmed ? 0.985 : 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onHoverStart={() => setHovered(card.id)}
            onHoverEnd={() => setHovered(null)}
            className="flex"
          >
            <div
              className="relative flex flex-col w-full rounded-2xl bg-warm-white border overflow-hidden transition-colors duration-300"
              style={{
                borderColor: isHov ? card.borderHover : "var(--color-border, #e8e3dc)",
                boxShadow: isHov ? card.shadowHover : "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              {/* Top accent bar */}
              <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${card.topBar}`} />

              {/* Animated ambient glow */}
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(circle at 15% 15%, ${card.glow} 0%, transparent 65%)` }}
                animate={{ opacity: isHov ? 1 : 0 }}
                transition={{ duration: 0.35 }}
              />

              <div className="relative p-7 flex flex-col flex-1">
                {/* Icon with pulse ring */}
                <div className="relative w-14 h-14 mb-5 self-start">
                  <motion.div
                    className={`w-14 h-14 rounded-2xl ${card.iconBg} flex items-center justify-center`}
                    animate={{ scale: isHov ? 1.08 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className={card.iconCls} size={24} />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2"
                    style={{ borderColor: card.borderHover }}
                    animate={{ scale: isHov ? 1.55 : 1.0, opacity: isHov ? 0 : 0 }}
                    initial={{ scale: 1.0, opacity: 0 }}
                    transition={{ duration: 0.7, repeat: isHov ? Infinity : 0, ease: "easeOut" }}
                  />
                </div>

                <Badge variant={card.badgeVariant} className="mb-3 self-start">{card.badge}</Badge>
                <h3 className="font-serif text-2xl font-semibold mb-2 text-dark">{card.title}</h3>
                <p className="text-sm text-mid font-light leading-relaxed mb-5">{card.desc}</p>

                <div className="flex flex-col gap-2.5 mb-7 flex-1">
                  {card.items.map((item, i) => (
                    <motion.div
                      key={i}
                      custom={i}
                      variants={checkVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="flex items-center gap-2.5 text-sm text-mid"
                    >
                      <motion.div
                        animate={{ scale: isHov ? 1.2 : 1 }}
                        transition={{ duration: 0.2, delay: i * 0.04 }}
                      >
                        <Check size={13} className={`${card.checkCls} shrink-0`} />
                      </motion.div>
                      <span className="font-light">{item}</span>
                    </motion.div>
                  ))}
                </div>

                <Button variant={card.ctaVariant} onClick={() => navigate(card.path)} className="w-full">
                  {card.cta} <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  return (
    <PageWrapper>
      {/* ══════════ Hero ══════════ */}
      <section ref={heroRef} className="relative pt-24 pb-14 px-6 text-center max-w-3xl mx-auto overflow-visible">

        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-visible">
          <motion.div
            className="absolute -top-28 -left-40 w-[480px] h-[480px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(180,215,188,0.32) 0%, transparent 68%)" }}
            animate={{ scale: [1, 1.07, 1], rotate: [0, 6, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-12 -right-28 w-[380px] h-[380px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(200,185,155,0.22) 0%, transparent 68%)" }}
            animate={{ scale: [1, 1.1, 1], rotate: [0, -7, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          />
        </div>

        {/* Badge with live pulse */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-sage-bg text-sage text-sm font-semibold mb-8">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-55" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sage" />
            </span>
            Social Health, Beautifully Measured
          </div>
        </motion.div>

        <motion.h1
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="font-serif text-5xl sm:text-6xl font-semibold text-dark leading-[1.1] mb-6 tracking-tight"
        >
          The end of{" "}
          <span className="bg-gradient-to-r from-sage to-sage-soft bg-clip-text text-transparent">
            senior loneliness
          </span>
        </motion.h1>

        <motion.p
          initial="hidden" animate="visible" variants={fadeUp} custom={2}
          className="text-lg text-mid font-light leading-relaxed mb-10 max-w-xl mx-auto"
        >
          Juni matches aging parents with dedicated companions based on personality, passions, and life
          story — then tracks their social well-being so families can see the difference.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={3}
          className="flex gap-3 justify-center flex-wrap mb-10"
        >
          <Button size="lg" onClick={() => navigate("/onboarding")}>
            <Heart size={16} />
            Find a Companion
          </Button>
          <Button variant="dark" size="lg" onClick={() => navigate("/companion/signup")}>
            <Users size={16} />
            Become a Companion
          </Button>
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={4}
          className="flex items-center justify-center gap-3 flex-wrap"
        >
          <div className="flex -space-x-2.5">
            <div className="w-8 h-8 rounded-full border-2 border-cream bg-sage-bg flex items-center justify-center text-[10px] font-bold text-sage">RR</div>
            <div className="w-8 h-8 rounded-full border-2 border-cream bg-gold-bg flex items-center justify-center text-[10px] font-bold text-gold">JW</div>
            <div className="w-8 h-8 rounded-full border-2 border-cream bg-blue-bg flex items-center justify-center text-[10px] font-bold text-blue">KP</div>
            <div className="w-8 h-8 rounded-full border-2 border-cream bg-sage-bg flex items-center justify-center text-[10px] font-bold text-sage">SM</div>
            <div className="w-8 h-8 rounded-full border-2 border-cream bg-gold-bg flex items-center justify-center text-[10px] font-bold text-gold">AL</div>
          </div>
          <span className="text-sm text-dark font-semibold">1,200+ families</span>
          <span className="text-sm text-muted font-light">matched with a companion</span>
          <span className="text-faint text-sm">·</span>
          <span className="flex items-center gap-1 text-sm text-mid">
            <Star size={12} className="text-gold" style={{ fill: "currentColor" }} />
            4.9
          </span>
          <span className="text-faint text-sm">·</span>
          <span className="text-sm text-mid font-light">&lt;48hr first match</span>
        </motion.div>
      </section>

      {/* ══════════ Two Paths ══════════ */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <PathCards navigate={navigate} />
      </section>

      {/* ══════════ Pillars ══════════ */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((p, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card hover className="h-full">
                <div className={`w-12 h-12 rounded-xl ${p.bg} flex items-center justify-center mb-5`}>
                  <p.icon className={p.color} size={22} />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2.5">{p.title}</h3>
                <p className="text-sm text-mid font-light leading-relaxed m-0">{p.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════ How It Works — Interactive Stepper ══════════ */}
      <HowItWorks navigate={navigate} />

      {/* ══════════ Trust & Safety ══════════ */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <Badge variant="blue" className="mb-4"><ShieldCheck size={12} /> Industry-Leading Safety</Badge>
          </motion.div>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="font-serif text-4xl font-semibold mb-3"
          >
            Safety That Never Sleeps
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
            className="text-base text-muted font-light max-w-lg mx-auto"
          >
            Every Companion is screened across 1,300+ databases with TSA-grade identity verification, continuous monitoring, and zero-tolerance enforcement.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {Object.entries(safetyFramework).map(([key, phase], i) => {
            const icons = { prevent: Shield, support: Eye, act: AlertTriangle };
            const colors = { prevent: "text-blue", support: "text-sage", act: "text-gold" };
            const bgs = { prevent: "bg-blue-bg", support: "bg-sage-bg", act: "bg-gold-bg" };
            const Icon = icons[key];
            return (
              <motion.div key={key} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card hover className="h-full">
                  <div className={`w-12 h-12 rounded-xl ${bgs[key]} flex items-center justify-center mb-5`}>
                    <Icon className={colors[key]} size={22} />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-1">{phase.title}</h3>
                  <p className="text-xs text-muted mb-4">{phase.desc}</p>
                  <ul className="flex flex-col gap-2 m-0 p-0 list-none">
                    {phase.items.slice(0, 4).map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <Check size={12} className="text-sage shrink-0 mt-0.5" />
                        <span className="text-sm text-mid font-light leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3}
          className="rounded-2xl bg-gradient-to-r from-[#2a2520] to-[#3d352d] text-white p-8 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {[
              { v: "1,300+", l: "Databases Screened" },
              { v: "9", l: "Verification Layers" },
              { v: "24/7", l: "Continuous Monitoring" },
              { v: "0", l: "Tolerance for Risk" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-bold text-white m-0">{s.v}</p>
                <p className="text-xs text-white/50 mt-1 m-0">{s.l}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/40 m-0">Powered by Checkr · FCRA Compliant · SOC 2 Type II</p>
        </motion.div>
      </section>

      {/* ══════════ Pricing ══════════ */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl font-semibold mb-3">Simple, Transparent Pricing</h2>
          <p className="text-base text-muted font-light">No surge pricing. No hidden fees. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-8 relative ${
                p.popular
                  ? "bg-gradient-to-b from-[#2a2520] to-[#3d352d] text-white shadow-2xl shadow-dark/20 scale-[1.02] z-10"
                  : "bg-warm-white border border-border"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold rounded-full text-[11px] font-bold text-white tracking-wide">
                  MOST POPULAR
                </div>
              )}
              <h3 className="font-serif text-2xl font-semibold mb-6">{p.name}</h3>
              <div className="flex flex-col gap-2.5 mb-6">
                {p.feats.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Check size={14} className={p.popular ? "text-sage-soft" : "text-sage"} />
                    <span className={`text-sm font-light ${p.popular ? "text-white/85" : "text-mid"}`}>{f}</span>
                  </div>
                ))}
                {p.no.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 opacity-40">
                    <Minus size={14} />
                    <span className="text-sm font-light">{f}</span>
                  </div>
                ))}
              </div>
              <Button
                variant={p.popular ? "primary" : "secondary"}
                className="w-full"
                onClick={() => navigate("/onboarding")}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ Final CTA ══════════ */}
      <section className="bg-bg py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="rounded-2xl bg-gradient-to-br from-[#2a2520] to-[#3d352d] text-white p-10 text-center"
          >
            <h2 className="font-serif text-3xl font-semibold text-white mb-3">
              Ready to start?
            </h2>
            <p className="text-base text-white/60 font-light leading-relaxed mb-8 max-w-lg mx-auto">
              Whether you're looking for companionship for a parent or want to make a difference
              as a Companion — your journey starts here.
            </p>
            <div className="flex gap-3 justify-center flex-wrap mb-6">
              <Button size="lg" onClick={() => navigate("/onboarding")}>
                <Heart size={16} />
                Find a Companion
              </Button>
              <Button variant="secondary" size="lg" className="!border-white/20 !text-white hover:!bg-white/10" onClick={() => navigate("/companion/signup")}>
                <Users size={16} />
                Become a Companion
              </Button>
            </div>
            <div className="flex items-center justify-center gap-8 pt-4 border-t border-white/10">
              {[
                { v: "94%", l: "Kindred Match" },
                { v: "4.9", l: "Family Rating" },
                { v: "< 48hrs", l: "First Visit" },
                { v: "1,300+", l: "Safety Databases" },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-lg font-bold text-sage-soft m-0">{s.v}</p>
                  <p className="text-[10px] text-white/40 m-0">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center py-12 border-t border-border mx-6">
        <p className="text-xs text-faint font-serif">Juni · Social Health, Beautifully Measured</p>
      </div>
    </PageWrapper>
  );
}
