import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, BookOpen, MessageCircle, Sparkles, ArrowLeft, Heart, Send, Clock, Star,
  Brain, Lightbulb, Music, Coffee, MapPin, TrendingUp, AlertTriangle, Check,
  CreditCard, Calendar, CheckCircle2, Smile,
} from "lucide-react";
import { Card, TabNav, Badge, Avatar, Stat, ProgressBar, VitalsChart } from "../ui";
import Button from "../ui/Button";
import { TextArea } from "../ui/Input";
import PageWrapper from "../layout/PageWrapper";
import Footer from "../layout/Footer";
import { fellowSeniors, training, fStats, posts, MONTHS } from "../../lib/constants";
import CompanionBilling from "./CompanionBilling";
import CompanionSchedule from "./CompanionSchedule";

const tabs = [
  { id: "seniors", label: "My Seniors", icon: "\uD83D\uDC65" },
  { id: "training", label: "Training", icon: "\uD83D\uDCDA" },
  { id: "community", label: "Community", icon: "\uD83D\uDCAC" },
  { id: "impact", label: "Impact", icon: "\u2728" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const moodColors = { Joyful: "sage", Calm: "blue", Reflective: "purple" };

/* ── Mood options for the visit log ── */
const moodOptions = [
  { value: "amazing", emoji: "😄", label: "Amazing", color: "border-sage bg-sage-bg text-sage" },
  { value: "good", emoji: "😊", label: "Good", color: "border-blue bg-blue-bg text-blue" },
  { value: "decent", emoji: "🙂", label: "Decent", color: "border-purple bg-purple-bg text-purple" },
  { value: "quiet", emoji: "😐", label: "Quiet", color: "border-gold bg-gold-bg text-gold" },
  { value: "difficult", emoji: "😔", label: "Difficult", color: "border-amber-300 bg-amber-50 text-amber-600" },
];

const inactiveMood = "border-border bg-warm-white text-muted hover:bg-bg";

/* ── AI visit prep suggestions per senior ── */
const aiVisitPrep = {
  1: {
    seniorName: "Maggie",
    predictedMood: "Warm & Talkative",
    moodConfidence: 89,
    suggestions: [
      { icon: Music, label: "Conversation Starter", text: "Ask about the Florence train she missed in '72 — she mentioned wanting to tell the full story last visit." },
      { icon: Coffee, label: "Activity Idea", text: "She mentioned making homemade pasta. Bring a simple recipe card and offer to help." },
      { icon: Lightbulb, label: "Memory Exercise", text: "Show photos from the 1970s and ask her to name restaurants she visited in Italy." },
    ],
    alerts: [
      { type: "info", text: "Harold's birthday is March 8. She may become more reflective this week." },
    ],
  },
  2: {
    seniorName: "Bob",
    predictedMood: "Calm & Focused",
    moodConfidence: 82,
    suggestions: [
      { icon: Music, label: "Conversation Starter", text: "Bob mentioned a Miles Davis album last time. Play 'Kind of Blue' during your visit." },
      { icon: Coffee, label: "Activity Idea", text: "Continue the chess game you started. He's been thinking about his next move all week." },
      { icon: Lightbulb, label: "Memory Exercise", text: "Ask about his time in the service — he lights up when discussing the friendships he made." },
    ],
    alerts: [],
  },
  3: {
    seniorName: "Ellie",
    predictedMood: "Quiet & Reflective",
    moodConfidence: 76,
    suggestions: [
      { icon: Music, label: "Conversation Starter", text: "Read her a short poem — she responded beautifully to Emily Dickinson last time." },
      { icon: Coffee, label: "Activity Idea", text: "Bring a birdwatching field guide. She spotted a cardinal last week and was thrilled." },
      { icon: Lightbulb, label: "Memory Exercise", text: "Ask about her quilting patterns — she can describe them in incredible detail." },
    ],
    alerts: [
      { type: "watch", text: "Ellie has been quieter than usual the past two visits. Gently check in about how she's feeling." },
    ],
  },
};

const visitActivities = [
  "Cooking together", "Looking at photos", "Music & singing", "Reading aloud",
  "Board games / cards", "Walking outdoors", "Crafts & art", "Life story recording",
];

export default function CompanionPortal() {
  const [tab, setTab] = useState("seniors");
  const [view, setView] = useState("dash"); // "dash" | "billing" | "schedule"
  const [loggingFor, setLoggingFor] = useState(null); // senior id
  const [submitted, setSubmitted] = useState(false);
  const [notes, setNotes] = useState({ highlight: "", talked: "", memories: "", nextTime: "", concern: "" });
  const [moodStart, setMoodStart] = useState(null);
  const [moodEnd, setMoodEnd] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [expandedSenior, setExpandedSenior] = useState(1);
  const [postText, setPostText] = useState("");

  const toggleActivity = (a) =>
    setSelectedActivities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const resetLog = () => {
    setLoggingFor(null);
    setSubmitted(false);
    setNotes({ highlight: "", talked: "", memories: "", nextTime: "", concern: "" });
    setMoodStart(null);
    setMoodEnd(null);
    setSelectedActivities([]);
  };

  const loggingSenior = fellowSeniors.find(s => s.id === loggingFor);

  // ── Routing ──
  if (view === "billing") return <CompanionBilling onBack={() => setView("dash")} />;
  if (view === "schedule") return <CompanionSchedule onBack={() => setView("dash")} />;

  // ── Visit submitted success screen ──
  if (loggingFor && submitted) {
    const endMood = moodOptions.find(m => m.value === moodEnd);
    return (
      <PageWrapper className="max-w-xl mx-auto px-6 pt-12">
        <Card className="text-center !py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-full bg-blue/10 flex items-center justify-center mx-auto mb-5"
          >
            <Sparkles size={28} className="text-blue" />
          </motion.div>
          <h2 className="font-serif text-2xl font-semibold text-dark mb-3 m-0">Visit Logged</h2>
          <p className="text-[15px] text-mid font-light leading-relaxed mb-6 m-0 max-w-sm mx-auto">
            Notes for <strong>{loggingSenior?.name.split(" ")[0]}</strong> are being processed.
            {loggingFor === 1 && " Their family will see an updated Daily Bloom within 30 minutes."}
          </p>
          {endMood && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-bg rounded-full mb-6">
              <span className="text-xl">{endMood.emoji}</span>
              <span className="text-sm text-mid">Ended the visit feeling <strong className="text-dark">{endMood.label}</strong></span>
            </div>
          )}
          <Button variant="blue" onClick={resetLog}>
            Return to Dashboard
          </Button>
        </Card>
      </PageWrapper>
    );
  }

  // ── Visit logging form ──
  if (loggingFor) {
    const senior = loggingSenior;
    return (
      <PageWrapper className="max-w-xl mx-auto px-6 pt-6 pb-16">
        <Button variant="ghost" size="sm" onClick={resetLog} className="mb-6 !text-blue">
          <ArrowLeft size={14} /> Back
        </Button>
        <h2 className="font-serif text-2xl font-semibold mb-1 m-0">
          Log Visit with {senior?.name.split(" ")[0]}
        </h2>
        <p className="text-sm text-muted mb-7 m-0">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="flex flex-col gap-6">

          {/* ── Mood: How did they arrive? ── */}
          <div>
            <p className="text-sm font-semibold text-dark mb-3 m-0">
              How was {senior?.name.split(" ")[0]}'s mood at the <em>start</em> of the visit?
            </p>
            <div className="flex gap-2 flex-wrap">
              {moodOptions.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMoodStart(m.value)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all font-sans min-w-[72px] ${
                    moodStart === m.value ? m.color : inactiveMood
                  }`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-[11px] font-semibold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Mood: How did they leave? ── */}
          <div>
            <p className="text-sm font-semibold text-dark mb-3 m-0">
              How was {senior?.name.split(" ")[0]}'s mood at the <em>end</em>?
            </p>
            <div className="flex gap-2 flex-wrap">
              {moodOptions.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMoodEnd(m.value)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all font-sans min-w-[72px] ${
                    moodEnd === m.value ? m.color : inactiveMood
                  }`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-[11px] font-semibold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Activities ── */}
          <div>
            <p className="text-sm font-semibold text-dark mb-3 m-0">What did you do together? <span className="text-muted font-normal">(select all that apply)</span></p>
            <div className="flex flex-wrap gap-2">
              {visitActivities.map(a => (
                <button
                  key={a}
                  onClick={() => toggleActivity(a)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border cursor-pointer transition-all font-sans ${
                    selectedActivities.includes(a)
                      ? "bg-blue text-white border-blue shadow-sm"
                      : "bg-warm-white text-mid border-border hover:bg-bg"
                  }`}
                >
                  {selectedActivities.includes(a) && <Check size={10} className="inline mr-1" />}
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* ── Highlight ── */}
          <TextArea
            label="What was the highlight of the visit?"
            placeholder={`e.g. ${senior?.name.split(" ")[0]} sang along to a song they hadn't recalled in months…`}
            value={notes.highlight}
            onChange={e => setNotes({ ...notes, highlight: e.target.value })}
          />

          {/* ── Conversation ── */}
          <TextArea
            label="What did you talk about?"
            placeholder="Stories shared, topics that came up, memories they recalled…"
            value={notes.talked}
            onChange={e => setNotes({ ...notes, talked: e.target.value })}
          />

          {/* ── Memories ── */}
          <TextArea
            label="Any vivid memories or stories they shared?"
            placeholder="Specific people, places, or events they described in detail…"
            value={notes.memories}
            onChange={e => setNotes({ ...notes, memories: e.target.value })}
          />

          {/* ── Next time ── */}
          <TextArea
            label="Anything they mentioned wanting to do next time?"
            placeholder="Ideas, wishes, or things they're looking forward to…"
            value={notes.nextTime}
            onChange={e => setNotes({ ...notes, nextTime: e.target.value })}
          />

          {/* ── Concerns ── */}
          <TextArea
            label="Any concerns or health observations?"
            placeholder="Physical wellbeing, energy level, any worrying changes… (or 'None')"
            value={notes.concern}
            onChange={e => setNotes({ ...notes, concern: e.target.value })}
          />

          <Button
            variant="blue"
            size="lg"
            disabled={!moodEnd}
            onClick={() => {
              // Save to localStorage so Family portal can read it
              const visitRecord = {
                seniorId: loggingFor,
                seniorName: senior?.name.split(" ")[0],
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                moodStart,
                moodEnd,
                activities: selectedActivities,
                notes,
              };
              localStorage.setItem("juni_latest_visit", JSON.stringify(visitRecord));
              setSubmitted(true);
            }}
            className="mt-2"
          >
            <Send size={16} /> Submit Visit Notes
          </Button>
          {!moodEnd && (
            <p className="text-xs text-muted text-center -mt-3 m-0">Select an end mood to submit</p>
          )}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="max-w-5xl mx-auto px-6 pt-6 pb-16">
      {/* Welcome card */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <Card className="mb-4">
          <div className="flex justify-between items-center flex-wrap gap-5">
            <div className="flex items-center gap-4">
              <Avatar initials="SC" size="lg" color="blue" className="!font-sans" />
              <div>
                <h1 className="font-serif text-2xl font-semibold text-dark m-0">Welcome back, Sarah</h1>
                <div className="flex gap-2 mt-1.5">
                  <Badge variant="blue">{fStats.tier}</Badge>
                  <Badge variant="gold">{fStats.seniors} Seniors</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-7">
              <Stat label="Total Hours" value={fStats.hours} />
              <Stat label="Legacy Stories" value={fStats.stories} />
              <Stat label="Rating" value={`${fStats.rating}/5`} color="sage" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick actions */}
      <div className="flex gap-2 mb-6">
        {[
          { label: "Schedule", icon: Calendar, action: () => setView("schedule") },
          { label: "Earnings", icon: CreditCard, action: () => setView("billing") },
        ].map(({ label, icon: Icon, action }) => (
          <button key={label} onClick={action}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-warm-white text-xs font-medium text-mid hover:bg-bg hover:text-dark transition-all cursor-pointer font-sans">
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      <TabNav tabs={tabs} active={tab} onChange={setTab} />

      {/* ══════════ Seniors ══════════ */}
      {tab === "seniors" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col gap-4">
          {fellowSeniors.map(s => {
            const prep = aiVisitPrep[s.id];
            const isExpanded = expandedSenior === s.id;
            return (
              <Card key={s.id} hover>
                <div
                  className="flex justify-between items-center flex-wrap gap-4 cursor-pointer"
                  onClick={() => setExpandedSenior(isExpanded ? null : s.id)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar initials={s.name[0]} size="md" color="brown" />
                    <div>
                      <p className="font-serif text-lg font-semibold text-dark m-0">{s.name}</p>
                      <p className="text-[13px] text-muted mt-1 m-0">Age {s.age} · Next: {s.next}</p>
                      <div className="flex gap-1.5 mt-2">
                        {s.tags.map((t, i) => (
                          <span key={i} className="px-2.5 py-0.5 bg-bg rounded-full text-[11px] text-brown">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-5 items-center">
                    <div className="text-center">
                      <p className="text-[11px] text-light m-0">Streak</p>
                      <p className="text-xl font-bold text-blue mt-0.5 m-0">{s.streak}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] text-light m-0">Kindred</p>
                      <p className="text-xl font-bold text-sage mt-0.5 m-0">{s.kindred}</p>
                    </div>
                    <Badge variant={moodColors[s.mood] || "sage"}>{s.mood}</Badge>
                    <Button
                      variant="blue"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); setLoggingFor(s.id); }}
                    >
                      <Clock size={12} /> Log Visit
                    </Button>
                  </div>
                </div>

                {/* AI Visit Prep (expanded) */}
                {isExpanded && prep && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-5 pt-5 border-t border-bg"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Brain size={16} className="text-blue" />
                      <p className="text-xs text-blue font-semibold uppercase tracking-wider m-0">
                        AI Visit Prep for {prep.seniorName}
                      </p>
                      <Badge variant="blue" className="!text-[9px] ml-auto">
                        Predicted mood: {prep.predictedMood} ({prep.moodConfidence}%)
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      {prep.suggestions.map((sug, i) => (
                        <div key={i} className="p-4 bg-blue-bg/50 rounded-xl border border-blue/10">
                          <div className="flex items-center gap-2 mb-2">
                            <sug.icon size={14} className="text-blue" />
                            <p className="text-[10px] text-blue font-semibold uppercase tracking-wider m-0">{sug.label}</p>
                          </div>
                          <p className="text-sm text-mid font-light leading-relaxed m-0">{sug.text}</p>
                        </div>
                      ))}
                    </div>

                    {prep.alerts.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {prep.alerts.map((alert, i) => (
                          <div key={i} className={`flex items-start gap-2 px-4 py-3 rounded-lg ${
                            alert.type === "watch" ? "bg-gold-bg border border-gold/15" : "bg-purple-bg border border-purple/15"
                          }`}>
                            <AlertTriangle size={13} className={alert.type === "watch" ? "text-gold" : "text-purple"} />
                            <p className="text-xs text-mid leading-relaxed m-0">{alert.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </Card>
            );
          })}
        </motion.div>
      )}

      {/* ══════════ Training ══════════ */}
      {tab === "training" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col gap-4">
          <Card className="!bg-gradient-to-r !from-blue/5 !to-sage/3">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl font-semibold m-0">Development Path</h3>
              <Badge variant="blue">Senior Companion</Badge>
            </div>
            <p className="text-[13px] text-muted mt-2 m-0">Complete all core modules + 2 specialties to advance to Lead Companion</p>
          </Card>
          {training.map(c => (
            <Card key={c.id} hover>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-serif text-base font-semibold m-0">{c.title}</p>
                  <p className="text-xs text-muted mt-1 m-0">{c.cat} · {c.hrs}h</p>
                </div>
                <span className={`text-sm font-bold ${
                  c.pct === 100 ? "text-sage" : c.pct > 0 ? "text-blue" : "text-light"
                }`}>
                  {c.pct === 100 ? "\u2713 Complete" : c.pct > 0 ? `${c.pct}%` : "Not Started"}
                </span>
              </div>
              <ProgressBar value={c.pct} color={c.pct === 100 ? "sage" : "blue"} />
            </Card>
          ))}
        </motion.div>
      )}

      {/* ══════════ Community ══════════ */}
      {tab === "community" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col gap-4">
          <Card className="!bg-blue-bg !border-blue/20">
            <textarea
              value={postText}
              onChange={e => setPostText(e.target.value)}
              placeholder="Share a moment, ask a question, or celebrate a win\u2026"
              className="w-full min-h-[60px] p-0 border-none bg-transparent font-sans text-sm leading-relaxed text-dark resize-none outline-none placeholder:text-blue/40"
            />
            <div className="flex justify-end mt-2">
              <Button
                variant="blue"
                size="sm"
                disabled={!postText.trim()}
                onClick={() => setPostText("")}
              >
                <Send size={12} /> Post
              </Button>
            </div>
          </Card>
          {posts.map(p => (
            <Card key={p.id}>
              <div className="flex gap-3">
                <Avatar initials={p.av} size="md" color="bg" className="!font-sans !text-xs" />
                <div className="flex-1">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-semibold text-dark">{p.who}</span>
                    <span className="text-xs text-light">{p.time}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-mid font-light m-0">{p.txt}</p>
                  <div className="flex gap-4 mt-3">
                    <span className="text-[13px] text-muted cursor-pointer hover:text-sage transition-colors flex items-center gap-1">
                      <Heart size={13} /> {p.likes}
                    </span>
                    {p.replies && (
                      <span className="text-[13px] text-muted cursor-pointer hover:text-blue transition-colors flex items-center gap-1">
                        <MessageCircle size={13} /> {p.replies} replies
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      {/* ══════════ Impact ══════════ */}
      {tab === "impact" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { l: "Total Hours", v: fStats.hours, c: "text-blue", s: "of companionship" },
              { l: "Legacy Stories", v: fStats.stories, c: "text-gold", s: "created for families" },
              { l: "Satisfaction", v: `${fStats.rating}/5.0`, c: "text-sage", s: "average rating" },
              { l: "Seniors", v: fStats.seniors, c: "text-purple", s: "active relationships" },
            ].map((x, i) => (
              <Card key={i} className="text-center !py-7">
                <p className="text-[11px] text-light uppercase tracking-widest mb-2 m-0">{x.l}</p>
                <p className={`text-3xl font-bold ${x.c} m-0`}>{x.v}</p>
                <p className="text-xs text-muted mt-1 m-0">{x.s}</p>
              </Card>
            ))}
          </div>
          <Card>
            <h3 className="font-serif text-lg font-semibold mb-4 m-0">Monthly Hours</h3>
            <VitalsChart data={fStats.monthly} labels={MONTHS} color="blue" label="Hours Delivered" />
          </Card>

          {/* AI-powered impact insights */}
          <Card className="!border-blue/15 !bg-gradient-to-r !from-blue-bg/50 !to-transparent">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={18} className="text-blue" />
              <h3 className="font-serif text-lg font-semibold m-0">AI Impact Analysis</h3>
              <Badge variant="blue" className="!text-[10px] ml-auto">Updated weekly</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Your Strongest Skill", value: "Reminiscence Therapy", detail: "Seniors in your care show 23% higher memory recall than average. Your storytelling technique is working.", icon: Star, color: "text-gold" },
                { label: "Growth Opportunity", value: "Music Integration", detail: "Seniors who hear music during visits show 18% higher engagement. Consider adding background music.", icon: Music, color: "text-blue" },
                { label: "Family Feedback", value: "4.9/5 Average", detail: "Families consistently praise your patience and the detail in your visit notes. Keep it up.", icon: Heart, color: "text-sage" },
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

          <Card className="!bg-gradient-to-br !from-[#2a2520] !to-[#3d352d] text-white">
            <div className="flex items-center gap-2 mb-3">
              <Star size={18} className="text-gold" />
              <h3 className="font-serif text-xl font-semibold m-0">Your Impact Statement</h3>
            </div>
            <p className="text-[15px] leading-relaxed font-light text-white/80 m-0">
              In your time as a Juni Companion, you have delivered {fStats.hours} hours of meaningful companionship to {fStats.seniors} seniors,
              helping create {fStats.stories} legacy stories that will be treasured by families for generations.
            </p>
          </Card>
        </motion.div>
      )}

      <Footer />
    </PageWrapper>
  );
}
