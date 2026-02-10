// ── Design Tokens ──
export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Background Check Status Enum ──
export const BG_CHECK_STATUS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  PASSED: "Passed",
  FAILED: "Failed",
  EXPIRED: "Expired",
  WAIVER: "Waiver Required",
};

// ── Background Check Tool Definitions ──
export const bgCheckTools = [
  { id: "identity", name: "Identity Verification", desc: "Government-issued ID validation and address history", provider: "Checkr Verified", required: true, estimatedDays: "1-2 days" },
  { id: "criminal", name: "Criminal Background Check", desc: "Federal, state, and county criminal records search", provider: "Checkr National", required: true, estimatedDays: "3-5 days" },
  { id: "sex_offender", name: "Sex Offender Registry", desc: "National Sex Offender Public Website (NSOPW) search", provider: "NSOPW Direct", required: true, estimatedDays: "1-2 days" },
  { id: "elder_abuse", name: "Elder Abuse Registry", desc: "State elder abuse and neglect registry check", provider: "State Registry API", required: true, estimatedDays: "3-7 days" },
  { id: "driving", name: "Motor Vehicle Records", desc: "Driving record check for transportation-eligible Fellows", provider: "DMV Connect", required: false, estimatedDays: "1-3 days" },
  { id: "references", name: "Professional References", desc: "Minimum 3 professional references verified via phone/email", provider: "Internal Review", required: true, estimatedDays: "5-7 days" },
  { id: "education", name: "Education Verification", desc: "Degree and certification validation", provider: "National Student Clearinghouse", required: false, estimatedDays: "2-4 days" },
  { id: "drug_screen", name: "Drug Screening", desc: "10-panel drug test at authorized lab", provider: "Quest Diagnostics", required: true, estimatedDays: "2-3 days" },
];

// ── Onboarding Step Definitions ──
export const onboardingSteps = [
  { id: "consent", title: "Authorization & Consent", desc: "Review and sign background check authorization" },
  { id: "identity_info", title: "Personal Information", desc: "Verify your identity and provide required details" },
  { id: "documents", title: "Document Upload", desc: "Upload government-issued ID and supporting documents" },
  { id: "references_input", title: "Reference Submission", desc: "Provide professional and personal references" },
  { id: "screening", title: "Screening Appointment", desc: "Schedule drug screening and any required in-person checks" },
  { id: "review", title: "Review & Status", desc: "Track the progress of all background checks" },
];

// ── Mock Data: Seniors ──
export const seniorData = {
  name: "Margaret", nick: "Maggie", age: 78, fellow: "Sarah Chen",
  plan: "Premium", nextVisit: "Tomorrow, 2:00 PM", since: "August 2024",
  hours: 186, kindred: 94,
  personality: { Openness: 82, Conscientiousness: 71, Extraversion: 55, Agreeableness: 88, Neuroticism: 34 },
  interests: ["Italian cooking", "Travel stories", "Photography", "Classical music", "Gardening", "Family genealogy"],
  routines: "Prefers morning visits. Loves tea with honey. Enjoys sitting on the porch when weather permits.",
  commStyle: "Contemplative storyteller. Appreciates quiet pauses. Responds well to open-ended questions.",
};

export const bloom = {
  date: "February 8, 2026", sentiment: 0.87, mood: "Joyful",
  summary: "Maggie was in wonderful spirits today. She and Sarah spent the morning looking through old photo albums from her trip to Florence in 1972. She recalled the names of three restaurants she visited\u2014unprompted\u2014and laughed recounting a story about missing her train to Venice. She mentioned wanting to try making homemade pasta again soon.",
  highlights: ["Strong episodic memory recall", "Expressed future-oriented desire", "Sustained engagement for 2+ hours"],
  topics: ["Travel memories", "Italian cooking", "Family stories"],
};

export const vitals = {
  engagement: [62, 65, 71, 68, 74, 79, 82, 78, 85, 81, 88, 87],
  memory: [45, 48, 44, 50, 52, 49, 55, 58, 56, 60, 63, 61],
  mood: [55, 58, 60, 62, 65, 68, 70, 72, 71, 75, 78, 80],
};

export const legacy = [
  { id: 1, type: "audio", title: "The Night I Met Your Father", date: "Feb 6, 2026", meta: "4:32", mood: "Nostalgic" },
  { id: 2, type: "story", title: "Growing Up in Brooklyn", date: "Feb 3, 2026", meta: "1,240 words", mood: "Vivid" },
  { id: 3, type: "photo", title: "Florence, Summer of '72", date: "Feb 8, 2026", meta: "3 photos", mood: "Joyful" },
  { id: 4, type: "lesson", title: "On Patience & Persistence", date: "Jan 28, 2026", meta: "Life lesson", mood: "Reflective" },
  { id: 5, type: "audio", title: "Mama's Pasta Sauce Recipe", date: "Jan 22, 2026", meta: "6:18", mood: "Warm" },
  { id: 6, type: "story", title: "My First Day Teaching", date: "Jan 15, 2026", meta: "890 words", mood: "Proud" },
];

export const alertsData = [
  { id: 1, type: "positive", msg: "Memory recall scores have improved 12% over the past 6 weeks.", date: "Feb 8" },
  { id: 2, type: "info", msg: "Maggie expressed interest in attending a local concert. Sarah is exploring options.", date: "Feb 7" },
  { id: 3, type: "attention", msg: "Mentions of \u2018missing Harold\u2019 increased this week. Consider a family call.", date: "Feb 5" },
];

export const partners = [
  { name: "Dr. Patel \u2014 Primary Care", type: "Medical", sync: "Feb 1" },
  { name: "Greenfield Estate Law", type: "Legal", sync: "Jan 15" },
  { name: "Meridian Wealth Advisors", type: "Financial", sync: "Jan 20" },
];

// ── Mock Data: Fellows ──
export const fellowSeniors = [
  { id: 1, name: "Margaret (Maggie)", age: 78, next: "Tomorrow, 2:00 PM", streak: 24, kindred: 94, mood: "Joyful", tags: ["Italian cooking", "Travel", "Photography"] },
  { id: 2, name: "Robert (Bob)", age: 83, next: "Wed, 10:00 AM", streak: 18, kindred: 88, mood: "Calm", tags: ["Jazz", "Chess", "Military history"] },
  { id: 3, name: "Eleanor (Ellie)", age: 91, next: "Thu, 1:00 PM", streak: 11, kindred: 91, mood: "Reflective", tags: ["Poetry", "Birdwatching", "Quilting"] },
];

export const training = [
  { id: 1, title: "Empathetic Communication", pct: 100, cat: "Core", hrs: 4 },
  { id: 2, title: "Dementia Awareness", pct: 100, cat: "Core", hrs: 6 },
  { id: 3, title: "Legacy Storytelling Techniques", pct: 72, cat: "Specialty", hrs: 3 },
  { id: 4, title: "De-escalation & Emotional Regulation", pct: 45, cat: "Core", hrs: 5 },
  { id: 5, title: "Advanced Reminiscence Therapy", pct: 0, cat: "Specialty", hrs: 4 },
];

export const fStats = { hours: 486, stories: 67, rating: 4.8, seniors: 3, tier: "Senior Fellow", monthly: [32, 35, 38, 40, 42, 44, 46, 44, 48, 46, 50, 52] };

export const posts = [
  { id: 1, who: "Maya R.", av: "MR", txt: "Breakthrough moment today \u2014 Mr. Torres sang along to a song he hadn\u2019t remembered in months. The power of music never ceases to amaze.", likes: 24, time: "2h ago" },
  { id: 2, who: "James K.", av: "JK", txt: "Anyone have tips for when a Senior doesn\u2019t want to engage? Eleanor was really quiet today and I want to respect her space while still being present.", likes: 18, time: "5h ago", replies: 7 },
  { id: 3, who: "Priya S.", av: "PS", txt: "Just completed my Dementia Awareness certification! The module on sundowning was incredibly eye-opening.", likes: 31, time: "1d ago" },
];

// ── Mock Data: Partners ──
export const pStats = {
  refs: 47, active: 38, eng: 84, conv: "81%",
  funnel: { clicks: 312, starts: 189, done: 58, live: 47 },
  outcomes: { engUp: 85, memOk: 72, moodUp: 91 },
};

export const pClients = [
  { id: 1, family: "Robertson", senior: "Margaret", status: "Active", eng: 94, mo: 18, plan: "Premium" },
  { id: 2, family: "Chen", senior: "William", status: "Active", eng: 87, mo: 12, plan: "Legacy" },
  { id: 3, family: "Okafor", senior: "Grace", status: "Active", eng: 79, mo: 8, plan: "Essentials" },
  { id: 4, family: "Martinez", senior: "Antonio", status: "Active", eng: 91, mo: 15, plan: "Premium" },
  { id: 5, family: "Kim", senior: "Soon-Yi", status: "Onboarding", eng: 0, mo: 0, plan: "Premium" },
];

// ── Mock Background Check Results ──
export const mockBgCheckResults = {
  identity: { status: BG_CHECK_STATUS.PASSED, completedDate: "Feb 1, 2026", details: "Identity confirmed via state-issued driver's license." },
  criminal: { status: BG_CHECK_STATUS.PASSED, completedDate: "Feb 4, 2026", details: "No records found across federal, state, and county databases." },
  sex_offender: { status: BG_CHECK_STATUS.PASSED, completedDate: "Feb 1, 2026", details: "No matches found in NSOPW database." },
  elder_abuse: { status: BG_CHECK_STATUS.IN_PROGRESS, completedDate: null, details: "Awaiting response from state registry. Estimated completion: Feb 10." },
  driving: { status: BG_CHECK_STATUS.PENDING, completedDate: null, details: "Not yet initiated. Optional for non-transport Fellows." },
  references: { status: BG_CHECK_STATUS.IN_PROGRESS, completedDate: null, details: "2 of 3 references verified. Awaiting response from third contact." },
  education: { status: BG_CHECK_STATUS.PASSED, completedDate: "Feb 3, 2026", details: "B.S. in Social Work confirmed, University of Michigan, 2022." },
  drug_screen: { status: BG_CHECK_STATUS.PASSED, completedDate: "Feb 2, 2026", details: "10-panel screen completed. All results negative." },
};
