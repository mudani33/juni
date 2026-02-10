import { useState } from "react";
import { motion } from "framer-motion";
import { Flower2, BarChart3, BookOpen, Bell, User, Calendar, CreditCard, Mic, Pencil, Camera, Lightbulb, TrendingUp } from "lucide-react";
import { Card, TabNav, Badge, Avatar, SentimentArc, VitalsChart, Stat, ProgressBar } from "../ui";
import PageWrapper from "../layout/PageWrapper";
import Footer from "../layout/Footer";
import { seniorData, bloom, vitals, legacy, alertsData, partners, MONTHS } from "../../lib/constants";
import FamilyProfile from "./FamilyProfile";
import FamilySchedule from "./FamilySchedule";
import FamilyBilling from "./FamilyBilling";

const legacyIcons = { audio: Mic, story: Pencil, photo: Camera, lesson: Lightbulb };

const tabs = [
  { id: "bloom", label: "Daily Bloom", icon: "\uD83C\uDF38" },
  { id: "vitals", label: "Social Vitals", icon: "\uD83D\uDCCA" },
  { id: "legacy", label: "Legacy Vault", icon: "\uD83D\uDCDA" },
  { id: "alerts", label: "Insights", icon: "\uD83D\uDD14" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function FamilyPortal() {
  const [tab, setTab] = useState("bloom");
  const [vital, setVital] = useState("engagement");
  const [expLeg, setExpLeg] = useState(null);
  const [view, setView] = useState("dash");

  if (view === "profile") return <FamilyProfile onBack={() => setView("dash")} />;
  if (view === "schedule") return <FamilySchedule onBack={() => setView("dash")} />;
  if (view === "billing") return <FamilyBilling onBack={() => setView("dash")} />;

  return (
    <PageWrapper className="max-w-5xl mx-auto px-6 pt-6 pb-16">
      {/* Profile Card */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <Card className="mb-6">
          <div className="flex justify-between items-center flex-wrap gap-5">
            <div className="flex items-center gap-5">
              <Avatar initials="M" size="lg" color="brown" onClick={() => setView("profile")} />
              <div>
                <h1 className="font-serif text-2xl font-semibold text-dark m-0 tracking-tight cursor-pointer hover:text-sage transition-colors"
                  onClick={() => setView("profile")}>
                  {seniorData.nick}
                </h1>
                <p className="text-sm text-muted mt-1 m-0">{seniorData.name}, {seniorData.age} · Since {seniorData.since}</p>
              </div>
            </div>
            <div className="flex gap-7 flex-wrap">
              <div>
                <p className="text-[11px] text-light uppercase tracking-widest m-0">Fellow</p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar initials="SC" size="sm" color="sage" />
                  <span className="text-sm font-medium text-dark">{seniorData.fellow}</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-light uppercase tracking-widest m-0">Next Visit</p>
                <p className="text-sm font-medium text-dark mt-1 m-0 cursor-pointer hover:text-sage transition-colors"
                  onClick={() => setView("schedule")}>{seniorData.nextVisit}</p>
              </div>
              <Stat label="Total Hours" value={`${seniorData.hours} hrs`} />
              <Stat label="Kindred Score" value={`${seniorData.kindred}/100`} color="sage" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick actions */}
      <div className="flex gap-2 mb-6">
        {[
          { label: "Profile", icon: User, action: () => setView("profile") },
          { label: "Schedule", icon: Calendar, action: () => setView("schedule") },
          { label: "Billing", icon: CreditCard, action: () => setView("billing") },
        ].map(({ label, icon: Icon, action }) => (
          <button key={label} onClick={action}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-warm-white text-xs font-medium text-mid hover:bg-bg hover:text-dark transition-all cursor-pointer font-sans">
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      <TabNav tabs={tabs} active={tab} onChange={setTab} />

      {/* Daily Bloom */}
      {tab === "bloom" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col gap-5">
          <Card>
            <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
              <div>
                <h2 className="font-serif text-xl font-semibold text-dark m-0 flex items-center gap-2">
                  <Flower2 size={20} className="text-sage" /> Today&apos;s Bloom
                </h2>
                <p className="text-[13px] text-light mt-1 m-0">{bloom.date}</p>
              </div>
              <div className="text-center">
                <SentimentArc value={bloom.sentiment} />
                <p className="text-[11px] text-muted mt-1 m-0">Sentiment</p>
              </div>
            </div>
            <p className="text-[15px] leading-relaxed text-txt font-light mb-6 m-0">{bloom.summary}</p>
            <div className="flex gap-2 flex-wrap mb-5">
              {bloom.topics.map((t, i) => (
                <span key={i} className="px-3.5 py-1.5 bg-bg rounded-full text-xs text-brown font-medium">{t}</span>
              ))}
            </div>
            <div className="border-t border-bg pt-5">
              <p className="text-xs text-light uppercase tracking-widest mb-3">Key Observations</p>
              {bloom.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
                  <span className="text-sm text-mid">{h}</span>
                </div>
              ))}
            </div>
          </Card>
          <div className="bg-gradient-to-r from-sage/5 to-tan/10 rounded-2xl px-7 py-5 flex items-center justify-between border border-border">
            <div>
              <p className="text-xs text-muted m-0">Overall Mood</p>
              <p className="font-serif text-xl font-semibold text-dark mt-1 m-0">{bloom.mood}</p>
            </div>
            <Flower2 size={32} className="text-sage/40" />
          </div>
        </motion.div>
      )}

      {/* Social Vitals */}
      {tab === "vitals" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { k: "engagement", l: "Engagement Level", c: "sage", d: vitals.engagement },
              { k: "memory", l: "Memory Recall", c: "gold", d: vitals.memory },
              { k: "mood", l: "Mood Elevation", c: "purple", d: vitals.mood },
            ].map(v => (
              <Card key={v.k} onClick={() => setVital(v.k)}
                className={`cursor-pointer ${vital === v.k ? "!ring-2 !ring-sage/30" : ""}`}>
                <VitalsChart data={v.d} labels={MONTHS} color={v.c} label={v.l} />
              </Card>
            ))}
          </div>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-sage" />
              <h3 className="font-serif text-lg font-semibold m-0">6-Month Trend Analysis</h3>
            </div>
            <p className="text-sm leading-relaxed text-mid font-light m-0">
              Maggie&apos;s overall social health has shown consistent improvement since beginning her journey with Juni.
              Engagement levels have risen 40% since her first month, with particularly strong gains during the holiday period
              when Sarah organized video storytelling sessions. Memory recall metrics show a steady upward trend, likely
              correlated with the structured reminiscence activities. The data suggests that consistent, meaningful social
              interaction is having a measurably positive effect on her cognitive engagement.
            </p>
          </Card>
        </motion.div>
      )}

      {/* Legacy Vault */}
      {tab === "legacy" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col gap-4">
          <div className="bg-gradient-to-br from-[#2a2520] to-[#3d352d] rounded-2xl p-8 text-white">
            <h2 className="font-serif text-2xl font-semibold m-0">Maggie&apos;s Legacy Vault</h2>
            <p className="text-sm text-white/50 mt-2 font-light m-0">
              {legacy.length} captured moments · Every story is a gift to the next generation
            </p>
            <div className="flex gap-8 mt-6">
              {[
                { Icon: Mic, n: 2, l: "Audio" },
                { Icon: Pencil, n: 2, l: "Stories" },
                { Icon: Camera, n: 1, l: "Photos" },
                { Icon: Lightbulb, n: 1, l: "Lessons" },
              ].map((s, idx) => (
                <div key={idx} className="text-center">
                  <s.Icon size={18} className="mx-auto mb-1 text-white/70" />
                  <div className="text-xl font-bold">{s.n}</div>
                  <div className="text-[11px] text-white/40">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          {legacy.map(item => {
            const Icon = legacyIcons[item.type];
            return (
              <Card key={item.id} hover onClick={() => setExpLeg(expLeg === item.id ? null : item.id)} padding="p-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-bg flex items-center justify-center">
                      <Icon size={18} className="text-brown" />
                    </div>
                    <div>
                      <p className="font-serif text-base font-semibold text-dark m-0">{item.title}</p>
                      <p className="text-xs text-light mt-0.5 m-0">{item.date} · {item.meta}</p>
                    </div>
                  </div>
                  <Badge variant="brown">{item.mood}</Badge>
                </div>
                {expLeg === item.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-bg flex gap-3"
                  >
                    <button className="px-5 py-2 bg-dark text-white border-none rounded-lg text-[13px] font-medium cursor-pointer font-sans">
                      {item.type === "audio" ? "Play Recording" : "View Full"}
                    </button>
                    <button className="px-5 py-2 bg-transparent text-muted border border-border rounded-lg text-[13px] font-medium cursor-pointer font-sans hover:bg-bg">
                      Share with Family
                    </button>
                  </motion.div>
                )}
              </Card>
            );
          })}
        </motion.div>
      )}

      {/* Insights */}
      {tab === "alerts" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col gap-5">
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Bell size={18} className="text-sage" />
              <h3 className="font-serif text-xl font-semibold m-0">Predictive Insights</h3>
            </div>
            {alertsData.map(a => {
              const colors = {
                positive: { bg: "bg-sage-bg", border: "border-l-sage", dot: "bg-sage" },
                info: { bg: "bg-purple-bg", border: "border-l-purple", dot: "bg-purple" },
                attention: { bg: "bg-gold-bg", border: "border-l-gold", dot: "bg-gold" },
              };
              const c = colors[a.type];
              return (
                <div key={a.id} className={`px-5 py-4 ${c.bg} rounded-xl border-l-[3px] ${c.border} mb-3 last:mb-0`}>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-start">
                      <div className={`w-2 h-2 rounded-full ${c.dot} mt-1.5 shrink-0`} />
                      <p className="text-sm text-txt leading-relaxed m-0">{a.msg}</p>
                    </div>
                    <span className="text-xs text-light ml-4 whitespace-nowrap">{a.date}</span>
                  </div>
                </div>
              );
            })}
          </Card>
          <Card>
            <h3 className="font-serif text-lg font-semibold mb-5 m-0">Connected Trust Partners</h3>
            {partners.map((p, i) => (
              <div key={i} className={`flex justify-between items-center py-3.5 ${i < partners.length - 1 ? "border-b border-bg" : ""}`}>
                <div>
                  <p className="text-sm font-medium text-dark m-0">{p.name}</p>
                  <p className="text-xs text-light mt-0.5 m-0">{p.type} · Last synced {p.sync}</p>
                </div>
                <Badge variant="sage">Connected</Badge>
              </div>
            ))}
          </Card>
        </motion.div>
      )}

      <Footer />
    </PageWrapper>
  );
}
