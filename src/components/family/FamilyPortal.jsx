import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Flower2, BarChart3, BookOpen, Bell, User, Calendar, CreditCard, Mic, Pencil,
  Camera, Lightbulb, TrendingUp, Brain, Sparkles, ShieldAlert, ArrowUpRight,
  ArrowDownRight, Minus, AlertTriangle, Heart, Activity, MessageCircle, ClipboardList,
} from "lucide-react";
import { Card, TabNav, Badge, Avatar, SentimentArc, VitalsChart, Stat, ProgressBar } from "../ui";
import PageWrapper from "../layout/PageWrapper";
import Footer from "../layout/Footer";
import { seniorData, bloom, vitals, legacy, alertsData, partners, MONTHS } from "../../lib/constants";
import FamilyProfile from "./FamilyProfile";
import FamilySchedule from "./FamilySchedule";
import FamilyBilling from "./FamilyBilling";
import FamilyFeedback from "./FamilyFeedback";

const legacyIcons = { audio: Mic, story: Pencil, photo: Camera, lesson: Lightbulb };

const tabs = [
  { id: "bloom", label: "Daily Bloom", icon: "\uD83C\uDF38" },
  { id: "health", label: "Health & Insights", icon: "\uD83E\uDDE0" },
  { id: "legacy", label: "Legacy Vault", icon: "\uD83D\uDCDA" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

/* ── AI-generated predictions (mock) ── */
const aiPredictions = [
  {
    type: "positive",
    icon: TrendingUp,
    title: "Memory Recall Trending Up",
    detail: "Based on the past 6 weeks, Maggie's episodic memory recall has improved 12%. If this trend continues, she may reach her 6-month high by mid-March.",
    confidence: 87,
    action: "Continue structured reminiscence activities with Sarah — they're working.",
  },
  {
    type: "watch",
    icon: AlertTriangle,
    title: "Potential Mood Dip Expected",
    detail: "Maggie's mood scores historically drop 15-20% around Harold's birthday (March 8). Early intervention recommended.",
    confidence: 74,
    action: "Plan an uplifting activity for March 7-9. Sarah is already aware and preparing a photo album session.",
  },
  {
    type: "opportunity",
    icon: Sparkles,
    title: "Social Engagement Opportunity",
    detail: "Maggie mentioned wanting to attend a local concert 3 times in the past 2 weeks. This is a strong interest signal our AI hasn't seen before.",
    confidence: 92,
    action: "Sarah is exploring local jazz concerts within 15 minutes of Maggie's home.",
  },
];

const predictionColors = {
  positive: { bg: "bg-sage-bg", border: "border-l-sage", icon: "text-sage", badge: "sage" },
  watch: { bg: "bg-gold-bg", border: "border-l-gold", icon: "text-gold", badge: "gold" },
  opportunity: { bg: "bg-blue-bg", border: "border-l-blue", icon: "text-blue", badge: "blue" },
};

/* ── Health score computation ── */
const latestEngagement = vitals.engagement[vitals.engagement.length - 1];
const latestMemory = vitals.memory[vitals.memory.length - 1];
const latestMood = vitals.mood[vitals.mood.length - 1];
const overallHealth = Math.round((latestEngagement * 0.4 + latestMemory * 0.3 + latestMood * 0.3));

const vitalsMeta = [
  { k: "engagement", l: "Engagement", c: "sage", d: vitals.engagement, latest: latestEngagement, prev: vitals.engagement[vitals.engagement.length - 2], weight: "40%" },
  { k: "memory", l: "Memory Recall", c: "gold", d: vitals.memory, latest: latestMemory, prev: vitals.memory[vitals.memory.length - 2], weight: "30%" },
  { k: "mood", l: "Mood", c: "purple", d: vitals.mood, latest: latestMood, prev: vitals.mood[vitals.mood.length - 2], weight: "30%" },
];

const moodOptions = {
  amazing: { emoji: "😄", label: "Amazing" },
  good: { emoji: "😊", label: "Good" },
  decent: { emoji: "🙂", label: "Decent" },
  quiet: { emoji: "😐", label: "Quiet" },
  difficult: { emoji: "😔", label: "Difficult" },
};

export default function FamilyPortal() {
  const [tab, setTab] = useState("bloom");
  const [expLeg, setExpLeg] = useState(null);
  const [view, setView] = useState("dash");
  const [expandedPrediction, setExpandedPrediction] = useState(0);
  const [latestVisit, setLatestVisit] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("juni_latest_visit");
    if (stored) {
      try { setLatestVisit(JSON.parse(stored)); } catch (_) {}
    }
  }, []);

  if (view === "profile") return <FamilyProfile onBack={() => setView("dash")} />;
  if (view === "schedule") return <FamilySchedule onBack={() => setView("dash")} />;
  if (view === "billing") return <FamilyBilling onBack={() => setView("dash")} />;
  if (view === "feedback") return <FamilyFeedback onBack={() => setView("dash")} />;

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
                <p className="text-[11px] text-light uppercase tracking-widest m-0">Companion</p>
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
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { label: "Profile", icon: User, action: () => setView("profile") },
          { label: "Schedule", icon: Calendar, action: () => setView("schedule") },
          { label: "Billing", icon: CreditCard, action: () => setView("billing") },
          { label: "Message", icon: MessageCircle, action: () => setView("feedback") },
        ].map(({ label, icon: Icon, action }) => (
          <button key={label} onClick={action}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-warm-white text-xs font-medium text-mid hover:bg-bg hover:text-dark transition-all cursor-pointer font-sans">
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      <TabNav tabs={tabs} active={tab} onChange={setTab} />

      {/* ══════════ Daily Bloom ══════════ */}
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

          {/* Latest visit note from Companion */}
          {latestVisit && (
            <Card className="!border-sage/20 !bg-gradient-to-r !from-sage-bg/60 !to-transparent">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList size={17} className="text-sage" />
                <h3 className="font-serif text-lg font-semibold m-0">Latest Visit Note</h3>
                <Badge variant="sage" className="!text-[10px] ml-auto">From {seniorData.fellow}</Badge>
                <span className="text-xs text-muted">{latestVisit.date}</span>
              </div>

              {/* Mood arc */}
              {latestVisit.moodStart && latestVisit.moodEnd && (
                <div className="flex items-center gap-3 mb-4 p-3 bg-warm-white rounded-xl border border-border w-fit">
                  <span className="text-xl">{moodOptions[latestVisit.moodStart]?.emoji}</span>
                  <span className="text-xs text-muted">arrived</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <div className="w-1 h-1 rounded-full bg-border" />
                  </div>
                  <span className="text-xs text-muted">left</span>
                  <span className="text-xl">{moodOptions[latestVisit.moodEnd]?.emoji}</span>
                  <span className="text-xs font-semibold text-dark">
                    {moodOptions[latestVisit.moodEnd]?.label}
                  </span>
                </div>
              )}

              {/* Activities */}
              {latestVisit.activities?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {latestVisit.activities.map((a, i) => (
                    <span key={i} className="px-3 py-1 bg-bg rounded-full text-xs text-brown font-medium">{a}</span>
                  ))}
                </div>
              )}

              {/* Note highlights */}
              <div className="flex flex-col gap-2">
                {latestVisit.notes?.highlight && (
                  <div className="flex gap-2.5 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-sage mt-1.5 shrink-0" />
                    <p className="text-sm text-txt leading-relaxed m-0">
                      <strong>Highlight:</strong> {latestVisit.notes.highlight}
                    </p>
                  </div>
                )}
                {latestVisit.notes?.talked && (
                  <div className="flex gap-2.5 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-sage mt-1.5 shrink-0" />
                    <p className="text-sm text-txt leading-relaxed m-0">
                      <strong>Conversation:</strong> {latestVisit.notes.talked}
                    </p>
                  </div>
                )}
                {latestVisit.notes?.memories && (
                  <div className="flex gap-2.5 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-sage mt-1.5 shrink-0" />
                    <p className="text-sm text-txt leading-relaxed m-0">
                      <strong>Memories shared:</strong> {latestVisit.notes.memories}
                    </p>
                  </div>
                )}
                {latestVisit.notes?.nextTime && (
                  <div className="flex gap-2.5 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue mt-1.5 shrink-0" />
                    <p className="text-sm text-txt leading-relaxed m-0">
                      <strong>Next time:</strong> {latestVisit.notes.nextTime}
                    </p>
                  </div>
                )}
                {latestVisit.notes?.concern && latestVisit.notes.concern.toLowerCase() !== "none" && (
                  <div className="flex gap-2.5 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                    <p className="text-sm text-txt leading-relaxed m-0">
                      <strong>Observation:</strong> {latestVisit.notes.concern}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* AI Next-Visit Prediction */}
          <Card className="!border-blue/15 !bg-gradient-to-r !from-blue-bg/50 !to-transparent">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={18} className="text-blue" />
              <h3 className="font-serif text-lg font-semibold m-0">AI Visit Forecast</h3>
              <Badge variant="blue" className="!text-[10px] ml-auto">Powered by Juni AI</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Predicted Mood", value: "Warm & Talkative", icon: Heart, color: "text-sage", detail: "Based on post-visit momentum and weather forecast (sunny, 62\u00B0F)" },
                { label: "Suggested Activity", value: "Photo Album + Pasta", icon: Camera, color: "text-gold", detail: "She mentioned wanting to cook — combine with Florence photos for engagement" },
                { label: "Memory Focus", value: "Florence Trip, 1972", icon: Sparkles, color: "text-blue", detail: "High recall confidence for this period — reinforce while strong" },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-warm-white rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon size={14} className={item.color} />
                    <p className="text-[10px] text-muted uppercase tracking-wider font-semibold m-0">{item.label}</p>
                  </div>
                  <p className="text-sm font-semibold text-dark m-0 mb-1">{item.value}</p>
                  <p className="text-xs text-muted font-light leading-relaxed m-0">{item.detail}</p>
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

      {/* ══════════ Health & Insights (merged) ══════════ */}
      {tab === "health" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col gap-5">
          {/* Overall Health Score */}
          <Card className="!bg-gradient-to-r !from-sage/5 !to-blue/3">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-sage flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{overallHealth}</span>
                </div>
                <div>
                  <h2 className="font-serif text-xl font-semibold text-dark m-0">Social Health Score</h2>
                  <p className="text-sm text-muted font-light mt-1 m-0">
                    Composite of engagement ({vitalsMeta[0].weight}), memory ({vitalsMeta[1].weight}), and mood ({vitalsMeta[2].weight})
                  </p>
                </div>
              </div>
              <Badge variant="sage" className="!px-4 !py-2 !text-sm">
                <TrendingUp size={14} /> +8% this month
              </Badge>
            </div>
          </Card>

          {/* Vitals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vitalsMeta.map(v => {
              const delta = v.latest - v.prev;
              const isUp = delta > 0;
              return (
                <Card key={v.k}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted uppercase tracking-wider font-semibold m-0">{v.l}</p>
                    <div className={`flex items-center gap-1 text-xs font-bold ${isUp ? "text-sage" : delta < 0 ? "text-gold" : "text-muted"}`}>
                      {isUp ? <ArrowUpRight size={12} /> : delta < 0 ? <ArrowDownRight size={12} /> : <Minus size={12} />}
                      {isUp ? "+" : ""}{delta}
                    </div>
                  </div>
                  <VitalsChart data={v.d} labels={MONTHS} color={v.c} label={v.l} />
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-bg">
                    <span className="text-xs text-muted">Current</span>
                    <span className="text-lg font-bold text-dark">{v.latest}</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* AI Predictive Insights */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Brain size={18} className="text-blue" />
              <h3 className="font-serif text-xl font-semibold m-0">AI Predictive Insights</h3>
              <Badge variant="blue" className="!text-[10px] ml-auto">3 Active</Badge>
            </div>

            <div className="flex flex-col gap-3">
              {aiPredictions.map((pred, i) => {
                const pc = predictionColors[pred.type];
                const isExpanded = expandedPrediction === i;
                return (
                  <div
                    key={i}
                    onClick={() => setExpandedPrediction(isExpanded ? -1 : i)}
                    className={`${pc.bg} rounded-xl border-l-[3px] ${pc.border} cursor-pointer transition-all duration-200 hover:shadow-sm`}
                  >
                    <div className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <pred.icon size={16} className={`${pc.icon} shrink-0 mt-0.5`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-dark m-0">{pred.title}</p>
                            <Badge variant={pc.badge} className="!text-[9px]">{pred.confidence}% confidence</Badge>
                          </div>
                          <p className="text-sm text-mid font-light leading-relaxed m-0">{pred.detail}</p>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-3 pt-3 border-t border-black/5"
                            >
                              <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1 m-0">Recommended Action</p>
                              <p className="text-sm text-dark font-light leading-relaxed m-0">{pred.action}</p>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Active Alerts */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Bell size={18} className="text-sage" />
              <h3 className="font-serif text-lg font-semibold m-0">Recent Observations</h3>
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

          {/* Connected Trust Partners */}
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

      {/* ══════════ Legacy Vault ══════════ */}
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

      <Footer />
    </PageWrapper>
  );
}
