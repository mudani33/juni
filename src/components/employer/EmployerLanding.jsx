import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Check, Minus, Shield, ShieldCheck, TrendingDown, TrendingUp,
  Heart, Brain, BarChart3, Building2, Users, BookOpen, DollarSign, Lock,
  Sparkles, ChevronRight, Star, Quote,
} from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import PageWrapper from "../layout/PageWrapper";
import {
  employerPlans, employerB2BDifferentiators, employerTestimonials,
  safetyFramework,
} from "../../lib/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
};

const crisisStats = [
  { v: "73%", l: "of employees are caregivers", icon: Users, color: "text-blue" },
  { v: "$44B", l: "lost annually to caregiver burnout", icon: DollarSign, color: "text-danger" },
  { v: "70%", l: "more likely to leave their job", icon: TrendingUp, color: "text-gold" },
  { v: "29%", l: "more health issues for caregivers", icon: Heart, color: "text-danger" },
];

const juniVsPapa = [
  { feature: "Companion model", juni: "Dedicated Fellow (anti-gig)", papa: "Rotating Pals" },
  { feature: "Background screening", juni: "9-layer, 1,300+ databases", papa: "Standard checks" },
  { feature: "Health outcomes", juni: "Clinical-grade (engagement, memory, mood)", papa: "Satisfaction surveys" },
  { feature: "Caregiver burden tracking", juni: "Proprietary Burden Index (ZBI-adapted)", papa: "Not offered" },
  { feature: "ROI dashboard", juni: "Real-time with board-ready reports", papa: "Basic utilization" },
  { feature: "Legacy preservation", juni: "Full Legacy Vault (audio, stories, photos)", papa: "Not offered" },
  { feature: "Predictive analytics", juni: "AI-powered health decline alerts", papa: "Not offered" },
  { feature: "Continuous monitoring", juni: "24/7 criminal + OIG + annual re-screen", papa: "Initial screen only" },
  { feature: "HRIS integration", juni: "Workday, BambooHR, ADP", papa: "Not offered" },
];

export default function EmployerLanding() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      {/* ── Hero ── */}
      <section className="pt-24 pb-16 px-6 text-center max-w-4xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <Badge variant="blue" className="mb-6">
            <Building2 size={12} /> For Employers & HR Teams
          </Badge>
        </motion.div>

        <motion.h1
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="font-serif text-5xl sm:text-6xl font-semibold text-dark leading-[1.1] mb-6 tracking-tight"
        >
          Your employees are{" "}
          <span className="bg-gradient-to-r from-blue to-blue/70 bg-clip-text text-transparent">
            caregivers too
          </span>
        </motion.h1>

        <motion.p
          initial="hidden" animate="visible" variants={fadeUp} custom={2}
          className="text-lg text-mid font-light leading-relaxed mb-4 max-w-2xl mx-auto"
        >
          73% of your workforce is quietly managing elder care. It costs you $44 billion in lost
          productivity, turnover, and absenteeism. Juni turns your biggest hidden cost into your
          most meaningful benefit.
        </motion.p>

        <motion.p
          initial="hidden" animate="visible" variants={fadeUp} custom={2.5}
          className="text-sm text-muted mb-10 max-w-xl mx-auto"
        >
          Not another EAP add-on. Not rotating gig workers. A dedicated companion for every
          employee&apos;s parent — with clinical outcomes, caregiver burden tracking, and real ROI.
        </motion.p>

        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={3}
          className="flex gap-3 justify-center flex-wrap"
        >
          <Button variant="blue" size="lg" onClick={() => navigate("/employer")}>
            See the Employer Dashboard <ArrowRight size={16} />
          </Button>
          <Button variant="secondary" size="lg" onClick={() => document.getElementById("roi")?.scrollIntoView({ behavior: "smooth" })}>
            Calculate Your ROI
          </Button>
        </motion.div>
      </section>

      {/* ── The Caregiver Crisis ── */}
      <section className="bg-bg py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              className="font-serif text-4xl font-semibold mb-3"
            >
              The Hidden Crisis in Your Workforce
            </motion.h2>
            <motion.p
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              className="text-base text-muted font-light max-w-xl mx-auto"
            >
              Only 24% of employers recognize that caregiving affects performance. The data tells a different story.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {crisisStats.map((s, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="text-center h-full">
                  <div className="w-12 h-12 rounded-xl bg-bg flex items-center justify-center mx-auto mb-4">
                    <s.icon size={22} className={s.color} />
                  </div>
                  <p className="text-3xl font-bold text-dark mb-1">{s.v}</p>
                  <p className="text-xs text-muted font-light m-0">{s.l}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={4}
            className="mt-8 text-center"
          >
            <p className="text-xs text-light">
              Sources: AARP 2025, Harvard Business School, National Alliance for Caregiving, Caregiver.org
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 6 Differentiators ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <Badge variant="sage" className="mb-4"><Sparkles size={12} /> Why Juni</Badge>
          </motion.div>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="font-serif text-4xl font-semibold mb-3"
          >
            Not Just Companionship. Measurable Impact.
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
            className="text-base text-muted font-light max-w-lg mx-auto"
          >
            Juni goes beyond task-based care with clinical-grade outcomes, financial ROI, and legacy preservation.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {employerB2BDifferentiators.map((d, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card hover className="h-full">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-serif text-lg font-semibold text-dark">{d.title}</h3>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xl font-bold text-sage m-0">{d.stat}</p>
                    <p className="text-[10px] text-muted m-0">{d.statLabel}</p>
                  </div>
                </div>
                <p className="text-sm text-mid font-light leading-relaxed m-0">{d.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ROI Section ── */}
      <section id="roi" className="bg-bg py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <Badge variant="blue" className="mb-4"><DollarSign size={12} /> Proven ROI</Badge>
            </motion.div>
            <motion.h2
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              className="font-serif text-4xl font-semibold mb-3"
            >
              The Numbers Speak for Themselves
            </motion.h2>
          </div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
          >
            <Card className="!bg-gradient-to-br !from-dark !to-[#2d2d2d] text-white mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { v: "4.2x", l: "Average ROI", sub: "Year 1" },
                  { v: "48%", l: "Turnover Reduction", sub: "Caregiver employees" },
                  { v: "50%", l: "Absenteeism Drop", sub: "First 12 months" },
                  { v: "$1.2M", l: "Annual Savings", sub: "Per 4,000 employees" },
                ].map((s, i) => (
                  <div key={i}>
                    <p className="text-3xl font-bold text-white m-0">{s.v}</p>
                    <p className="text-xs text-white/70 mt-1 m-0">{s.l}</p>
                    <p className="text-[10px] text-white/40 mt-0.5 m-0">{s.sub}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: TrendingDown, color: "text-sage", bg: "bg-sage-bg", title: "Reduce Turnover", desc: "Caregiver employees are 70% more likely to quit. Juni cuts caregiver-related turnover by nearly half.", before: "18%", after: "9.4%", label: "Turnover Rate" },
              { icon: BarChart3, color: "text-blue", bg: "bg-blue-bg", title: "Cut Absenteeism", desc: "Working caregivers miss an average of 6.6 days more per year. Juni gives them back their focus.", before: "8.2 days", after: "4.1 days", label: "Days Absent/Year" },
              { icon: Brain, color: "text-gold", bg: "bg-gold-bg", title: "Lift Productivity", desc: "When your employees aren't worrying about Mom, they're 22.5 extra hours more productive per quarter.", before: "Distracted", after: "+22.5 hrs/qtr", label: "Productivity Gain" },
            ].map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card hover className="h-full">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                    <item.icon size={20} className={item.color} />
                  </div>
                  <h3 className="font-serif text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-mid font-light leading-relaxed mb-4">{item.desc}</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-border">
                    <div className="flex-1 text-center">
                      <p className="text-xs text-danger font-semibold m-0">{item.before}</p>
                      <p className="text-[10px] text-muted m-0">Before</p>
                    </div>
                    <ChevronRight size={14} className="text-sage" />
                    <div className="flex-1 text-center">
                      <p className="text-xs text-sage font-semibold m-0">{item.after}</p>
                      <p className="text-[10px] text-muted m-0">With Juni</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="font-serif text-4xl font-semibold mb-3"
          >
            Juni vs. the Competition
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-base text-muted font-light"
          >
            Side-by-side: why leading employers choose Juni.
          </motion.p>
        </div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
        >
          <Card className="!p-0 overflow-hidden">
            <div className="grid grid-cols-3 bg-bg px-6 py-3 border-b border-border">
              <p className="text-xs text-muted font-semibold uppercase tracking-wider m-0">Feature</p>
              <p className="text-xs text-sage font-bold uppercase tracking-wider m-0 text-center">Juni</p>
              <p className="text-xs text-muted font-semibold uppercase tracking-wider m-0 text-center">Others</p>
            </div>
            {juniVsPapa.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-6 py-3.5 items-center ${i % 2 === 0 ? "" : "bg-bg/30"} ${i < juniVsPapa.length - 1 ? "border-b border-border/50" : ""}`}>
                <p className="text-sm text-dark font-medium m-0">{row.feature}</p>
                <div className="flex items-center justify-center gap-1.5">
                  <Check size={12} className="text-sage shrink-0" />
                  <p className="text-xs text-sage font-medium m-0">{row.juni}</p>
                </div>
                <p className="text-xs text-muted text-center m-0">{row.papa}</p>
              </div>
            ))}
          </Card>
        </motion.div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-bg py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              className="font-serif text-4xl font-semibold mb-3"
            >
              Trusted by Leading Employers
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {employerTestimonials.map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card hover className="h-full">
                  <Quote size={20} className="text-sage/30 mb-3" />
                  <p className="text-sm text-mid font-light leading-relaxed italic mb-5">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage to-sage-soft flex items-center justify-center text-white text-xs font-bold">
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dark m-0">{t.name}</p>
                      <p className="text-[11px] text-muted m-0">{t.title}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Safety Section ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <Badge variant="blue" className="mb-4"><ShieldCheck size={12} /> Enterprise-Grade Safety</Badge>
          </motion.div>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="font-serif text-4xl font-semibold mb-3"
          >
            Your Employees&apos; Parents Deserve the Best Protection
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
            className="text-base text-muted font-light max-w-lg mx-auto"
          >
            Every Fellow undergoes the most comprehensive background screening in elder care. Period.
          </motion.p>
        </div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3}
        >
          <Card className="!bg-gradient-to-br !from-dark !to-[#2d2d2d] text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-6">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/10">
              {Object.entries(safetyFramework).map(([key, phase]) => (
                <div key={key}>
                  <h4 className="font-serif text-sm font-semibold text-white mb-2">{phase.title}</h4>
                  <ul className="flex flex-col gap-1.5 m-0 p-0 list-none">
                    {phase.items.slice(0, 3).map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <Check size={10} className="text-sage shrink-0 mt-0.5" />
                        <span className="text-[11px] text-white/60 leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-white/30 mt-6 m-0 text-center">
              HIPAA Compliant · SOC 2 Type II · FCRA Compliant · Checkr Certified Partner
            </p>
          </Card>
        </motion.div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="bg-bg py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              className="font-serif text-4xl font-semibold mb-3"
            >
              Simple Per-Employee Pricing
            </motion.h2>
            <motion.p
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              className="text-base text-muted font-light"
            >
              PEPM pricing. No hidden fees. No long-term contracts required.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {employerPlans.map((p) => (
              <motion.div
                key={p.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              >
                <div
                  className={`rounded-2xl p-8 relative h-full flex flex-col ${
                    p.popular
                      ? "bg-gradient-to-b from-[#2a2520] to-[#3d352d] text-white shadow-2xl shadow-dark/20 scale-[1.02] z-10"
                      : "bg-warm-white border border-border"
                  }`}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-sage rounded-full text-[11px] font-bold text-white tracking-wide">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="font-serif text-2xl font-semibold mb-1">{p.name}</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-3xl font-bold">{p.pepm}</span>
                      {p.pepm !== "Custom" && <span className={`text-sm font-light ${p.popular ? "text-white/60" : "text-muted"}`}>/employee/month</span>}
                    </div>
                    <p className={`text-xs font-light m-0 ${p.popular ? "text-white/60" : "text-muted"}`}>
                      {p.desc}
                    </p>
                    <Badge variant={p.popular ? "sage" : "muted"} className="mt-3 !text-[10px]">{p.employees} employees</Badge>
                  </div>

                  <div className="flex flex-col gap-2.5 mb-6 flex-1">
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <Check size={14} className={p.popular ? "text-sage-soft shrink-0 mt-0.5" : "text-sage shrink-0 mt-0.5"} />
                        <span className={`text-sm font-light ${p.popular ? "text-white/85" : "text-mid"}`}>{f}</span>
                      </div>
                    ))}
                    {p.excluded.map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5 opacity-40">
                        <Minus size={14} className="shrink-0" />
                        <span className="text-sm font-light">{f}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant={p.popular ? "primary" : "secondary"}
                    className="w-full"
                    onClick={() => navigate("/employer")}
                  >
                    {p.pepm === "Custom" ? "Contact Sales" : "Get Started"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
        >
          <h2 className="font-serif text-4xl font-semibold mb-4">
            Ready to Transform Your Caregiver Benefit?
          </h2>
          <p className="text-base text-muted font-light mb-8 max-w-lg mx-auto">
            See why leading employers choose Juni over Papa and other gig-economy companion services.
            Your employees — and their parents — deserve better.
          </p>
          <div className="flex gap-3 justify-center flex-wrap mb-6">
            <Button variant="blue" size="lg" onClick={() => navigate("/employer")}>
              Explore the Dashboard <ArrowRight size={16} />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
              View Pricing
            </Button>
          </div>
          <p className="text-xs text-light flex items-center justify-center gap-1.5">
            <Lock size={11} /> HIPAA Compliant · SOC 2 Type II · No long-term contracts
          </p>
        </motion.div>
      </section>

      <div className="text-center py-12 border-t border-border mx-6">
        <p className="text-xs text-faint font-serif">Juni · Social Health, Beautifully Measured</p>
      </div>
    </PageWrapper>
  );
}
