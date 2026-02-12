import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, BarChart3, BookOpen, ArrowRight, Check, Minus, Sparkles, Shield, Eye, AlertTriangle, ShieldCheck, Users, Star, DollarSign, GraduationCap } from "lucide-react";
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

const steps = [
  { num: "01", title: "Tell Us About Your Parent", desc: "A 5-minute guided conversation about who they are, what they love, and what they need — it feels like telling a friend, not filling out a form." },
  { num: "02", title: "We Find Their Person", desc: "Our matching algorithm pairs personality, interests, communication style, and care needs to find a Fellow who'll genuinely connect — not just show up." },
  { num: "03", title: "Watch Them Bloom", desc: "After every visit, see the Daily Bloom — mood, engagement, memory recall, and conversation highlights tracked beautifully over time." },
  { num: "04", title: "Build Their Legacy", desc: "Stories, voice recordings, and life lessons captured during every visit — preserved for your family forever." },
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
      {/* Hero */}
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
          Your parent deserves{" "}
          <span className="bg-gradient-to-r from-sage to-sage-soft bg-clip-text text-transparent">
            more than a visit
          </span>
        </motion.h1>

        <motion.p
          initial="hidden" animate="visible" variants={fadeUp} custom={2}
          className="text-lg text-mid font-light leading-relaxed mb-10 max-w-xl mx-auto"
        >
          You can't always be there — but someone who truly <em>gets</em> them can. Juni matches your parent
          with a dedicated Fellow based on who they actually are: their personality, their passions, their stories.
        </motion.p>

        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={3}
          className="flex gap-3 justify-center flex-wrap"
        >
          <Button size="lg" onClick={() => navigate("/onboarding")}>
            Start the Vibe Check
            <ArrowRight size={16} />
          </Button>
          <Button variant="secondary" size="lg" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
            How It Works
          </Button>
        </motion.div>
      </section>

      {/* Pillars */}
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

      {/* How it Works */}
      <section id="how-it-works" className="bg-bg py-16 px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="font-serif text-4xl font-semibold mb-4"
          >
            How Juni Works
          </motion.h2>
        </div>
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          {steps.map((item, i) => (
            <motion.div
              key={i}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              className="flex gap-6 items-start"
            >
              <div className="w-12 h-12 rounded-full bg-warm-white border-2 border-sage flex items-center justify-center text-sage font-bold text-sm shrink-0 shadow-sm">
                {item.num}
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold mb-1.5">{item.title}</h3>
                <p className="text-sm text-mid font-light leading-relaxed m-0">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust & Safety */}
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

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl font-semibold mb-3">Simple, Transparent Pricing</h2>
          <p className="text-base text-muted font-light">No surge pricing. No hidden fees.</p>
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

      {/* ── Become a Fellow ── */}
      <section id="become-fellow" className="bg-bg py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <Badge variant="blue" className="mb-4"><Users size={12} /> Become a Fellow</Badge>
            </motion.div>
            <motion.h2
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              className="font-serif text-4xl font-semibold mb-3"
            >
              Make a Living Making a Difference
            </motion.h2>
            <motion.p
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
              className="text-base text-muted font-light max-w-lg mx-auto"
            >
              Juni Fellows aren&apos;t gig workers. You&apos;re a trained companion who builds real relationships
              with seniors, preserves their legacy, and gets paid to make the world a little less lonely.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              { icon: Heart, color: "text-sage", bg: "bg-sage-bg", title: "Meaningful Work", desc: "Build lasting relationships with seniors. Hear their stories. Be the highlight of their week." },
              { icon: DollarSign, color: "text-blue", bg: "bg-blue-bg", title: "Competitive Pay", desc: "Earn $22\u2013$35/hr with flexible scheduling. Weekly pay, benefits for full-time Fellows." },
              { icon: GraduationCap, color: "text-gold", bg: "bg-gold-bg", title: "Professional Growth", desc: "Paid training in elder care, dementia awareness, and reminiscence therapy. Build a real career." },
            ].map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card hover className="h-full">
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-5`}>
                    <item.icon className={item.color} size={22} />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-2.5">{item.title}</h3>
                  <p className="text-sm text-mid font-light leading-relaxed m-0">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3}
          >
            <Card className="!bg-gradient-to-br !from-dark !to-[#2d2d2d] text-white">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex-1">
                  <h3 className="font-serif text-2xl font-semibold text-white mb-3">
                    Ready to Become a Juni Fellow?
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-4 m-0">
                    Apply in 5 minutes. Our industry-leading background screening (powered by Checkr)
                    ensures trust and safety for everyone. Once cleared, you&apos;ll be matched with seniors
                    who share your interests and personality.
                  </p>
                  <div className="flex items-center gap-6">
                    {[
                      { v: "4.8", l: "Fellow Rating" },
                      { v: "486+", l: "Avg Hours/Fellow" },
                      { v: "94%", l: "Kindred Match" },
                    ].map((s, i) => (
                      <div key={i}>
                        <p className="text-lg font-bold text-sage-soft m-0">{s.v}</p>
                        <p className="text-[10px] text-white/40 m-0">{s.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="shrink-0">
                  <Button variant="primary" size="lg" onClick={() => navigate("/fellow/signup")}>
                    Apply Now <ArrowRight size={16} />
                  </Button>
                  <p className="text-[10px] text-white/30 text-center mt-3 m-0">
                    <Shield size={10} className="inline mr-1" />
                    Background check powered by Checkr
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <div className="text-center py-12 border-t border-border mx-6">
        <p className="text-xs text-faint font-serif">Juni · Social Health, Beautifully Measured</p>
      </div>
    </PageWrapper>
  );
}
