import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  Heart,
  User,
  Home,
  Sun,
  Clock,
  Shield,
  Star,
} from "lucide-react";
import Button from "../ui/Button";
import { Input, Select, TextArea } from "../ui/Input";
import PageWrapper from "../layout/PageWrapper";

/* ───────────────────────── Step Definitions ───────────────────────── */

const steps = [
  {
    id: "about",
    title: "Tell Us About Your Parent",
    sub: "We want to know them as a person — not a patient. Start with the basics.",
    icon: User,
    kind: "form",
    fields: [
      { key: "parentName", label: "Their first name", placeholder: "e.g. Margaret", type: "text" },
      { key: "nickname", label: "What do they like to be called?", placeholder: "e.g. Maggie, Mom, Nana", type: "text" },
      { key: "age", label: "Their age", placeholder: "e.g. 78", type: "number" },
      {
        key: "relationship",
        label: "Your relationship to them",
        type: "select",
        options: ["My mother", "My father", "My grandmother", "My grandfather", "My spouse", "Other family member"],
      },
      {
        key: "livingSituation",
        label: "Where do they live?",
        type: "select",
        options: ["Alone at home", "With a spouse or partner", "With family", "Assisted living community", "Memory care facility", "Independent living community"],
      },
      { key: "location", label: "City and state", placeholder: "e.g. Austin, TX", type: "text" },
      {
        key: "languages",
        label: "Languages they speak",
        placeholder: "e.g. English, Spanish",
        type: "text",
      },
    ],
  },
  {
    id: "personality",
    title: "Who They Are at Heart",
    sub: "Think about how they are in a room with people. How do they show up?",
    icon: Star,
    kind: "grid",
    opts: [
      { l: "The Storyteller", e: "📖", d: "Loves sharing memories and life lessons" },
      { l: "The Listener", e: "👂", d: "Prefers hearing about your world" },
      { l: "The Entertainer", e: "🎭", d: "Always has a joke or a song ready" },
      { l: "The Teacher", e: "🎓", d: "Loves explaining how things work" },
      { l: "The Quiet One", e: "🌿", d: "Peaceful presence, speaks when it matters" },
      { l: "The Debater", e: "💬", d: "Loves a good back-and-forth conversation" },
    ],
  },
  {
    id: "social",
    title: "Their Social World",
    sub: "How do they connect with people? This helps us find a Fellow whose energy matches theirs.",
    icon: Heart,
    kind: "multi",
    opts: [
      "Warms up slowly — needs time to trust",
      "Instantly friendly with everyone",
      "Prefers one-on-one over groups",
      "Loves being around lots of people",
      "More talkative in the morning",
      "Opens up over a shared activity",
      "Enjoys comfortable silence",
      "Needs gentle encouragement to engage",
      "Lights up around children or young people",
      "Fiercely independent — hates being \"helped\"",
    ],
  },
  {
    id: "interests",
    title: "What Lights Them Up",
    sub: "What makes their eyes brighten? Select everything that fits — past or present. The more we know, the richer the match.",
    icon: Sun,
    kind: "multi",
    opts: [
      "Cooking or baking",
      "Gardening",
      "Music or singing",
      "Reading or audiobooks",
      "Puzzles, crosswords, or brain games",
      "Card games or board games",
      "Sports (watching or discussing)",
      "Walking or gentle exercise",
      "Travel stories",
      "Faith or spirituality",
      "Art, drawing, or crafts",
      "Photography",
      "Current events or politics",
      "History or documentaries",
      "Animals or pets",
      "Technology (wants to learn)",
      "Movies or classic TV shows",
      "Nature or birdwatching",
      "Grandchildren stories",
      "Writing or journaling",
    ],
  },
  {
    id: "era",
    title: "Their Favorite Era",
    sub: "Music, fashion, memories — what decade shaped who they are?",
    icon: Sparkles,
    kind: "grid",
    opts: [
      { l: "The 40s", e: "🎺", d: "Big band and wartime spirit" },
      { l: "The 50s", e: "🎵", d: "Jukebox melodies and milkshakes" },
      { l: "The 60s", e: "🌸", d: "Flower power and Motown" },
      { l: "The 70s", e: "🕺", d: "Disco nights and soul" },
      { l: "The 80s", e: "📻", d: "Boombox era and MTV" },
      { l: "The 90s", e: "📺", d: "Golden age of television" },
    ],
  },
  {
    id: "daily",
    title: "A Day in Their Life",
    sub: "Help us understand their world so visits feel natural — not like an appointment.",
    icon: Clock,
    kind: "needs",
    conditions: [
      "Uses a walker, cane, or wheelchair",
      "Has hearing aids or hearing difficulty",
      "Has vision challenges",
      "Memory lapses (occasional forgetfulness)",
      "Diagnosed memory condition (dementia, Alzheimer's)",
      "Limited mobility — mostly homebound",
      "Dietary restrictions or swallowing difficulty",
      "Chronic pain or fatigue",
      "Needs help with technology",
      "Recently hospitalized or recovering",
    ],
    formFields: [
      {
        key: "visitTimes",
        label: "Best time for visits",
        type: "select",
        options: ["Morning (8am–12pm)", "Afternoon (12pm–4pm)", "Evening (4pm–7pm)", "Flexible — any time works", "Weekends only"],
      },
      {
        key: "visitFrequency",
        label: "How often would you like visits?",
        type: "select",
        options: ["Once a week", "Twice a week", "Three times a week", "Daily", "We're not sure yet"],
      },
      {
        key: "visitLength",
        label: "Ideal visit length",
        type: "select",
        options: ["1 hour", "1.5 hours", "2 hours", "2–3 hours", "Flexible"],
      },
    ],
  },
  {
    id: "heart",
    title: "The Heart of It",
    sub: "You know your parent better than anyone. These answers help us understand where they are emotionally — so their Fellow can meet them with exactly the right energy.",
    icon: Shield,
    kind: "emotional",
    changes: [
      "Lost a spouse or partner",
      "Moved from their long-time home",
      "New health diagnosis",
      "Lost the ability to drive",
      "Friends or peers passing away",
      "Recently retired",
      "Family moved far away",
      "Reduced independence",
      "Became a full-time caregiver themselves",
      "None of these — they're doing well",
    ],
    textPrompts: [
      {
        key: "bringsJoy",
        label: "What still brings them real joy?",
        placeholder: "Maybe it's a morning cup of coffee on the porch, hearing from grandkids, tending to their tomato plants…",
      },
      {
        key: "struggles",
        label: "What are they struggling with the most right now?",
        placeholder: "Loneliness, boredom, feeling like a burden, losing their routine, grief…",
      },
      {
        key: "sensitiveTopics",
        label: "Anything a Fellow should approach with care?",
        placeholder: "e.g. Don't bring up their late husband Harold, avoid discussing the move from their house…",
      },
    ],
  },
  {
    id: "hopes",
    title: "What You're Hoping For",
    sub: "There's no wrong answer here. We just want to understand what success looks like through your eyes.",
    icon: Heart,
    kind: "hopes",
    goals: [
      "Someone to keep them company so they're less lonely",
      "Help them stay mentally sharp and engaged",
      "A friend who shares their interests",
      "Someone to get them out of the house",
      "Peace of mind — knowing someone is checking on them",
      "Help them capture and preserve their stories",
      "Support their independence as long as possible",
      "A bridge between visits — I can't be there enough",
      "Emotional support during a tough transition",
      "Gentle cognitive stimulation and memory support",
    ],
    textPrompts: [
      {
        key: "wish",
        label: "If you could give your parent one thing right now, what would it be?",
        placeholder: "In your own words — there's no wrong answer…",
      },
      {
        key: "legacy",
        label: "What's one story from their life you'd want your own children to know?",
        placeholder: "A moment, a lesson, a piece of who they are that shouldn't be lost…",
      },
    ],
  },
  {
    id: "fellow",
    title: "The Perfect Fellow",
    sub: "If you could design the ideal companion for your parent, what qualities would matter most?",
    icon: Star,
    kind: "match",
    qualities: [
      "Patient and gentle",
      "Warm and energetic",
      "Shared cultural background",
      "Bilingual or multilingual",
      "Musical — can sing or play",
      "Good cook — can cook together",
      "Tech-savvy — can help with devices",
      "Comfortable around pets",
      "Experience with memory care",
      "Active and outdoorsy",
      "Creative or artistic",
      "Good with structure and routine",
      "Great sense of humor",
      "Calm and grounding presence",
    ],
    preferences: [
      {
        key: "genderPref",
        label: "Gender preference for Fellow",
        type: "select",
        options: ["No preference", "Female", "Male"],
      },
      {
        key: "agePref",
        label: "Age range preference",
        type: "select",
        options: ["No preference", "20s–30s", "30s–40s", "40s–50s", "50s+"],
      },
      {
        key: "anythingElse",
        label: "Anything else that would make the perfect match?",
        placeholder: "e.g. Someone who speaks Italian, a veteran, someone who loves dogs…",
        type: "text",
      },
    ],
  },
];

/* ───────────────────────── Animation Variants ───────────────────────── */

const stepVariants = {
  enter: (d) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (d) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
};

/* ───────────────────────── Component ───────────────────────── */

export default function VibeCheck() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const [direction, setDirection] = useState(1);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showComplete, setShowComplete] = useState(false);

  const cur = steps[step];

  const setField = useCallback(
    (key, val) => setAns((prev) => ({ ...prev, [key]: val })),
    [],
  );

  const toggleMulti = useCallback(
    (key, val) =>
      setAns((prev) => {
        const arr = prev[key] || [];
        return { ...prev, [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] };
      }),
    [],
  );

  const goNext = () => {
    if (step < steps.length - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      // Save all answers to localStorage for the family portal
      localStorage.setItem("juni_vibe_check", JSON.stringify(ans));
      setShowComplete(true);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  /* ───── Pill selector (reusable) ───── */
  const PillSelect = ({ items, stateKey }) => (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item) => {
        const selected = (ans[stateKey] || []).includes(item);
        return (
          <motion.div
            key={item}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggleMulti(stateKey, item)}
            className={`px-4 py-2.5 rounded-full text-sm font-medium cursor-pointer border-2 transition-all duration-200 ${
              selected
                ? "border-sage bg-sage-bg text-sage"
                : "border-border bg-warm-white text-mid hover:border-sage/30"
            }`}
          >
            {selected && <Check size={12} className="inline mr-1.5 -mt-0.5" />}
            {item}
          </motion.div>
        );
      })}
    </div>
  );

  /* ───── Welcome Screen ───── */
  if (showWelcome) {
    return (
      <PageWrapper className="max-w-lg mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-20 h-20 rounded-3xl bg-sage-bg flex items-center justify-center mx-auto mb-8"
        >
          <Heart className="text-sage" size={36} />
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
          className="text-base text-mid font-light leading-relaxed mb-4 max-w-md mx-auto"
        >
          We know this isn't easy. Searching for someone to spend time with your parent means
          you care deeply — and that matters.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-base text-mid font-light leading-relaxed mb-10 max-w-md mx-auto"
        >
          This short questionnaire helps us understand your parent as a <em>person</em> — their personality,
          their passions, their world — so we can match them with a Fellow who'll genuinely connect,
          not just show up.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button size="lg" onClick={() => setShowWelcome(false)}>
            Let's Find Their Person
            <ArrowRight size={16} />
          </Button>
          <p className="text-xs text-light mt-4">Takes about 5 minutes · Everything is private</p>
        </motion.div>

        {/* What we'll cover */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mt-12 text-left max-w-sm mx-auto"
        >
          <p className="text-xs text-sage font-semibold tracking-widest uppercase mb-4">What we'll cover</p>
          <div className="flex flex-col gap-3">
            {[
              { icon: User, text: "Who your parent is" },
              { icon: Sun, text: "What they love and what lights them up" },
              { icon: Clock, text: "Their daily life and care needs" },
              { icon: Heart, text: "Where they are emotionally" },
              { icon: Star, text: "What you're hoping for in a Fellow" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-mid">
                <div className="w-8 h-8 rounded-lg bg-sage-bg flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-sage" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </motion.div>
      </PageWrapper>
    );
  }

  /* ───── Completion Screen ───── */
  if (showComplete) {
    const parentName = ans.parentName || "your parent";
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
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-serif text-3xl font-semibold text-dark mb-4"
        >
          We've Got the Picture
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-base text-mid font-light leading-relaxed mb-3 max-w-sm mx-auto"
        >
          Thank you for sharing so much about {parentName}. What you've told us isn't just data — it's
          the roadmap to finding someone who'll truly <em>get</em> them.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-base text-mid font-light leading-relaxed mb-10 max-w-sm mx-auto"
        >
          We're matching {parentName} with a Fellow now. You'll be able to review the match, see
          their profile, and schedule a meet-and-greet — all from your dashboard.
        </motion.p>

        {/* What happens next */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-sage-bg rounded-2xl p-6 text-left max-w-sm mx-auto mb-10"
        >
          <p className="text-xs text-sage font-semibold tracking-widest uppercase mb-3">What happens next</p>
          <div className="flex flex-col gap-2.5">
            {[
              "Our matching algorithm finds Fellows who fit",
              "You'll review your top match within 24 hours",
              "Schedule a video or in-person meet-and-greet",
              "First visit — we check in after to make sure it's right",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-dark">
                <span className="w-5 h-5 rounded-full bg-sage text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {text}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Button size="lg" onClick={() => navigate("/family")}>
            Go to Your Dashboard
            <ArrowRight size={16} />
          </Button>
        </motion.div>
      </PageWrapper>
    );
  }

  /* ───── Step Content ───── */
  const StepIcon = cur.icon;

  return (
    <PageWrapper className="max-w-xl mx-auto px-6 py-10">
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-8">
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
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-md bg-sage-bg flex items-center justify-center">
          <StepIcon size={12} className="text-sage" />
        </div>
        <p className="text-xs text-sage font-semibold tracking-widest uppercase">
          Step {step + 1} of {steps.length}
        </p>
      </div>

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
          <p className="text-sm text-mid font-light leading-relaxed mb-8">{cur.sub}</p>

          {/* ─── Form fields (Step 1: About) ─── */}
          {cur.kind === "form" && (
            <div className="flex flex-col gap-4">
              {cur.fields.map((f) =>
                f.type === "select" ? (
                  <Select
                    key={f.key}
                    label={f.label}
                    value={ans[f.key] || ""}
                    onChange={(e) => setField(f.key, e.target.value)}
                  >
                    <option value="">Select…</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    key={f.key}
                    label={f.label}
                    placeholder={f.placeholder}
                    type={f.type}
                    value={ans[f.key] || ""}
                    onChange={(e) => setField(f.key, e.target.value)}
                  />
                ),
              )}
            </div>
          )}

          {/* ─── Grid selection (Personality, Era) ─── */}
          {cur.kind === "grid" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {cur.opts.map((o, i) => {
                const sel = ans[cur.id] === i;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setField(cur.id, i)}
                    className={`py-5 px-4 rounded-2xl border-2 cursor-pointer text-center transition-all duration-200 ${
                      sel
                        ? "border-sage bg-sage-bg shadow-sm"
                        : "border-border bg-warm-white hover:border-sage/30"
                    }`}
                  >
                    <div className="text-3xl mb-2">{o.e}</div>
                    <p className="font-serif text-sm font-semibold text-dark m-0">{o.l}</p>
                    <p className="text-xs text-muted mt-1 m-0 leading-snug">{o.d}</p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ─── Multi-select pills (Social, Interests) ─── */}
          {cur.kind === "multi" && <PillSelect items={cur.opts} stateKey={cur.id} />}

          {/* ─── Needs + Schedule (Daily Life) ─── */}
          {cur.kind === "needs" && (
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-xs text-sage font-semibold tracking-widest uppercase mb-3">
                  Health & mobility considerations
                </p>
                <p className="text-xs text-light mb-4">Select any that apply — it's okay if none do.</p>
                <PillSelect items={cur.conditions} stateKey="conditions" />
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-xs text-sage font-semibold tracking-widest uppercase mb-1">
                  Visit preferences
                </p>
                {cur.formFields.map((f) => (
                  <Select
                    key={f.key}
                    label={f.label}
                    value={ans[f.key] || ""}
                    onChange={(e) => setField(f.key, e.target.value)}
                  >
                    <option value="">Select…</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                ))}
              </div>
            </div>
          )}

          {/* ─── Emotional landscape (Heart of It) ─── */}
          {cur.kind === "emotional" && (
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-xs text-sage font-semibold tracking-widest uppercase mb-3">
                  Recent life changes
                </p>
                <p className="text-xs text-light mb-4">Has anything shifted in their world recently?</p>
                <PillSelect items={cur.changes} stateKey="lifeChanges" />
              </div>
              <div className="flex flex-col gap-5">
                {cur.textPrompts.map((t) => (
                  <TextArea
                    key={t.key}
                    label={t.label}
                    placeholder={t.placeholder}
                    value={ans[t.key] || ""}
                    onChange={(e) => setField(t.key, e.target.value)}
                    className="min-h-[100px]"
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─── Hopes & Legacy (What You're Hoping For) ─── */}
          {cur.kind === "hopes" && (
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-xs text-sage font-semibold tracking-widest uppercase mb-3">
                  What matters most to you?
                </p>
                <p className="text-xs text-light mb-4">Select all that resonate.</p>
                <PillSelect items={cur.goals} stateKey="goals" />
              </div>
              <div className="flex flex-col gap-5">
                {cur.textPrompts.map((t) => (
                  <TextArea
                    key={t.key}
                    label={t.label}
                    placeholder={t.placeholder}
                    value={ans[t.key] || ""}
                    onChange={(e) => setField(t.key, e.target.value)}
                    className="min-h-[100px]"
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─── Fellow preferences (The Perfect Fellow) ─── */}
          {cur.kind === "match" && (
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-xs text-sage font-semibold tracking-widest uppercase mb-3">
                  Ideal qualities
                </p>
                <p className="text-xs text-light mb-4">Select all that would matter for your parent.</p>
                <PillSelect items={cur.qualities} stateKey="fellowQualities" />
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-xs text-sage font-semibold tracking-widest uppercase mb-1">
                  Preferences
                </p>
                {cur.preferences.map((f) =>
                  f.type === "select" ? (
                    <Select
                      key={f.key}
                      label={f.label}
                      value={ans[f.key] || ""}
                      onChange={(e) => setField(f.key, e.target.value)}
                    >
                      <option value="">Select…</option>
                      {f.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      key={f.key}
                      label={f.label}
                      placeholder={f.placeholder}
                      value={ans[f.key] || ""}
                      onChange={(e) => setField(f.key, e.target.value)}
                    />
                  ),
                )}
              </div>
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
          {step < steps.length - 1 ? "Continue" : "Find Their Fellow"}
          <ArrowRight size={14} />
        </Button>
      </div>
    </PageWrapper>
  );
}
