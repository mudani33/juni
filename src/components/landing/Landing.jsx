import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  { icon: Heart, color: "text-sage", bg: "bg-sage-bg", title: "One Dedicated Person", desc: "No rotating strangers. Your parent gets a single Fellow who knows their stories, their quirks, and how they take their coffee." },
  { icon: BarChart3, color: "text-blue", bg: "bg-blue-bg", title: "You'll See the Difference", desc: "After every visit, track engagement, memory recall, and mood — so you know your parent is truly doing better, not just being watched." },
  { icon: BookOpen, color: "text-gold", bg: "bg-gold-bg", title: "Their Stories Live On", desc: "Every visit captures a piece of who they are — memoirs, voice recordings, life lessons — preserved for your family forever." },
];

const familySteps = [
  { num: "01", icon: Search, title: "Take the Vibe Check", desc: "A 5-minute guided conversation about your parent — their personality, interests, care needs, and what matters most to you." },
  { num: "02", icon: UserCheck, title: "Create Your Account", desc: "Sign up to see your parent's top Fellow matches, ranked by our Kindred matching algorithm." },
  { num: "03", icon: CalendarCheck, title: "Meet Your Match", desc: "Review Fellow profiles, see why they fit, and schedule a video or in-person meet-and-greet." },
  { num: "04", icon: Heart, title: "Watch Them Bloom", desc: "After every visit, see the Daily Bloom — mood, memory, engagement, and legacy moments captured beautifully." },
];

const fellowSteps = [
  { num: "01", icon: Users, title: "Quick Application", desc: "5 minutes — tell us about yourself, your interests, and why you want to be a Fellow." },
  { num: "02", icon: Shield, title: "Background Screening", desc: "Checkr-powered 9-layer verification across 1,300+ databases. TSA-grade identity checks." },
  { num: "03", icon: GraduationCap, title: "Safety Training", desc: "Complete mandatory training in elder care, dementia awareness, HIPAA, and emergency response." },
  { num: "04", icon: Handshake, title: "Get Matched & Start", desc: "Our AI matches you with seniors who share your interests and personality. Start visiting and get paid." },
];

const plans = [
  { name: "Essentials", feats: ["8 hours/month", "Standard matching", "Weekly Summary", "Text Legacy Vault"], no: ["Predictive Alerts", "Partner Integration"] },
  { name: "Premium", popular: true, feats: ["16 hours/month", "Priority matching", "Per-visit Daily Bloom", "Text + Audio Legacy", "Predictive Alerts"], no: ["Partner Integration"] },
  { name: "Legacy", feats: ["24+ hours/month", "Concierge matching", "Bloom + Audio per visit", "Full Legacy Vault", "Alerts + Clinical Escalation", "Trust Partner Integration"], no: [] },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      {/* ══════════ Hero ══════════ */}
      <section className="pt-24 pb-16 px-6 text-center max-w-3xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-sage-bg text-sage text-sm font-semibold mb-8">
            <Sparkles size={14} />
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

        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={3}
          className="flex gap-3 justify-center flex-wrap"
        >
          <Button size="lg" onClick={() => navigate("/onboarding")}>
            <Heart size={16} />
            Find a Fellow for Your Parent
          </Button>
          <Button variant="dark" size="lg" onClick={() => navigate("/fellow/signup")}>
            <Users size={16} />
            Become a Fellow
          </Button>
        </motion.div>
      </section>

      {/* ══════════ Two Paths ══════════ */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Family Path */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <Card hover className="h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sage to-sage-soft" />
              <div className="w-12 h-12 rounded-xl bg-sage-bg flex items-center justify-center mb-5 mt-2">
                <Heart className="text-sage" size={22} />
              </div>
              <Badge variant="sage" className="mb-3">For Families</Badge>
              <h3 className="font-serif text-2xl font-semibold mb-2">Find a Fellow for Your Parent</h3>
              <p className="text-sm text-mid font-light leading-relaxed mb-5">
                You can't always be there — but someone who truly gets them can. Take a 5-minute Vibe
                Check and we'll match your parent with a companion based on who they actually are.
              </p>
              <div className="flex flex-col gap-2 mb-6">
                {["5-min Vibe Check about your parent", "See top Fellow matches instantly", "Schedule a meet-and-greet", "Track social health after every visit"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-mid">
                    <Check size={13} className="text-sage shrink-0" />
                    <span className="font-light">{item}</span>
                  </div>
                ))}
              </div>
              <Button onClick={() => navigate("/onboarding")} className="w-full">
                Start the Vibe Check <ArrowRight size={14} />
              </Button>
            </Card>
          </motion.div>

          {/* Fellow Path */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
            <Card hover className="h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue to-blue/70" />
              <div className="w-12 h-12 rounded-xl bg-blue-bg flex items-center justify-center mb-5 mt-2">
                <Users className="text-blue" size={22} />
              </div>
              <Badge variant="blue" className="mb-3">For Companions</Badge>
              <h3 className="font-serif text-2xl font-semibold mb-2">Become a Juni Fellow</h3>
              <p className="text-sm text-mid font-light leading-relaxed mb-5">
                This isn't a gig. Fellows are trained companions who build real relationships, preserve
                legacy, and get paid to make the world a little less lonely.
              </p>
              <div className="flex flex-col gap-2 mb-6">
                {["$22–$35/hr with flexible scheduling", "Paid training in elder care & safety", "Background screened by Checkr", "Matched by personality & interests"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-mid">
                    <Check size={13} className="text-blue shrink-0" />
                    <span className="font-light">{item}</span>
                  </div>
                ))}
              </div>
              <Button variant="blue" onClick={() => navigate("/fellow/signup")} className="w-full">
                Apply in 5 Minutes <ArrowRight size={14} />
              </Button>
            </Card>
          </motion.div>
        </div>
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

      {/* ══════════ How It Works — Families ══════════ */}
      <section id="how-it-works" className="bg-bg py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              className="font-serif text-4xl font-semibold mb-3"
            >
              How Juni Works
            </motion.h2>
            <motion.p
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              className="text-base text-muted font-light"
            >
              Two paths, one mission — ending senior loneliness.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Family Journey */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-sage-bg flex items-center justify-center">
                  <Heart size={14} className="text-sage" />
                </div>
                <h3 className="font-serif text-lg font-semibold m-0">For Families</h3>
              </div>
              <div className="flex flex-col gap-5">
                {familySteps.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-warm-white border-2 border-sage flex items-center justify-center text-sage font-bold text-xs shrink-0 shadow-sm">
                      {item.num}
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-semibold mb-1 m-0">{item.title}</h4>
                      <p className="text-sm text-mid font-light leading-relaxed m-0">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <Button onClick={() => navigate("/onboarding")} className="self-start mt-2">
                  Start the Vibe Check <ArrowRight size={14} />
                </Button>
              </div>
            </motion.div>

            {/* Fellow Journey */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-bg flex items-center justify-center">
                  <Users size={14} className="text-blue" />
                </div>
                <h3 className="font-serif text-lg font-semibold m-0">For Fellows</h3>
              </div>
              <div className="flex flex-col gap-5">
                {fellowSteps.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-warm-white border-2 border-blue flex items-center justify-center text-blue font-bold text-xs shrink-0 shadow-sm">
                      {item.num}
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-semibold mb-1 m-0">{item.title}</h4>
                      <p className="text-sm text-mid font-light leading-relaxed m-0">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <Button variant="blue" onClick={() => navigate("/fellow/signup")} className="self-start mt-2">
                  Apply Now <ArrowRight size={14} />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

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
            Every Fellow is screened across 1,300+ databases with TSA-grade identity verification, continuous monitoring, and zero-tolerance enforcement.
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
              as a Fellow — your journey starts here.
            </p>
            <div className="flex gap-3 justify-center flex-wrap mb-6">
              <Button size="lg" onClick={() => navigate("/onboarding")}>
                <Heart size={16} />
                Find a Fellow
              </Button>
              <Button variant="secondary" size="lg" className="!border-white/20 !text-white hover:!bg-white/10" onClick={() => navigate("/fellow/signup")}>
                <Users size={16} />
                Become a Fellow
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
