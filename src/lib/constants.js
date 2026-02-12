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

// ── Background Check Tool Definitions (Multi-Layer Verification) ──
// Goes beyond industry standard: 1,300+ databases, manual human review,
// TSA-grade identity verification, continuous post-approval monitoring.
export const bgCheckTools = [
  { id: "identity", name: "Identity Verification", desc: "TSA-grade ID validation: driver's license matched against live selfie, SSN trace, and address history across 1,300+ databases", provider: "Checkr Verified + IDScan.net", required: true, estimatedDays: "1-2 days", category: "identity" },
  { id: "criminal", name: "Criminal Background Check", desc: "Federal, state, and county criminal records search with manual human review of non-digitized courthouse records", provider: "Checkr National + Manual Review", required: true, estimatedDays: "3-5 days", category: "criminal" },
  { id: "sex_offender", name: "Sex Offender Registry", desc: "National Sex Offender Public Website (NSOPW) comprehensive search across all 50 states and territories", provider: "NSOPW Direct", required: true, estimatedDays: "1-2 days", category: "criminal" },
  { id: "elder_abuse", name: "Elder Abuse Registry", desc: "State elder abuse, neglect, and exploitation registry check — critical for senior safety", provider: "State Registry API", required: true, estimatedDays: "3-7 days", category: "criminal" },
  { id: "watchlist", name: "Global Watchlist", desc: "OIG exclusion list, global sanctions, and terrorism watchlist screening per CMS requirements", provider: "Checkr Global", required: true, estimatedDays: "1-2 days", category: "criminal" },
  { id: "driving", name: "Motor Vehicle Records", desc: "Complete driving record check for transportation-eligible Fellows, including violation history", provider: "DMV Connect", required: false, estimatedDays: "1-3 days", category: "records" },
  { id: "references", name: "Professional References", desc: "Minimum 3 professional references verified via phone and email — family members excluded", provider: "Internal Review Team", required: true, estimatedDays: "5-7 days", category: "verification" },
  { id: "education", name: "Education & Certification", desc: "Degree, certification, and relevant training validation through National Student Clearinghouse", provider: "National Student Clearinghouse", required: false, estimatedDays: "2-4 days", category: "verification" },
  { id: "drug_screen", name: "Drug Screening", desc: "10-panel drug test at authorized Quest Diagnostics lab, including opioids and synthetic drugs", provider: "Quest Diagnostics", required: true, estimatedDays: "2-3 days", category: "health" },
];

// ── Onboarding Step Definitions (8-Step Enhanced Flow) ──
export const onboardingSteps = [
  { id: "consent", title: "Authorization & Consent", desc: "Review disclosures and authorize comprehensive background screening", icon: "shield" },
  { id: "identity_verify", title: "Identity Verification", desc: "TSA-grade identity confirmation with photo ID and live verification", icon: "scan" },
  { id: "identity_info", title: "Personal Information", desc: "Provide identity details for federal, state, and county records search", icon: "user" },
  { id: "documents", title: "Document Upload", desc: "Upload government-issued ID, proof of address, and certifications", icon: "upload" },
  { id: "references_input", title: "Reference Submission", desc: "Provide at least 3 professional references for verification", icon: "users" },
  { id: "screening", title: "Drug Screening", desc: "Schedule 10-panel drug screening at an authorized lab", icon: "flask" },
  { id: "training", title: "Safety Training", desc: "Complete mandatory orientation and compliance modules", icon: "graduation" },
  { id: "review", title: "Background Check Status", desc: "Real-time tracking of all screening results via Checkr", icon: "check-circle" },
];

// ── Safety Framework (Prevent · Support · Act) ──
export const safetyFramework = {
  prevent: {
    title: "Prevent",
    desc: "Pre-visit vetting",
    items: [
      "TSA-grade identity verification",
      "Multi-layer background checks across 1,300+ databases",
      "Manual human review of non-digitized records",
      "Elder abuse & sex offender registry screening",
      "10-panel drug testing at certified labs",
      "3+ professional reference verification",
      "Mandatory safety & compliance training",
    ],
  },
  support: {
    title: "Support",
    desc: "During-visit safety",
    items: [
      "Digital Fellow ID badge verified by families",
      "Masked phone numbers protect personal info",
      "GPS-verified visit check-in and check-out",
      "Real-time visit monitoring dashboard",
      "One-tap emergency support button",
      "Visit notes reviewed by AI for safety signals",
    ],
  },
  act: {
    title: "Act",
    desc: "Post-incident response",
    items: [
      "Immediate Fellow suspension upon any safety concern",
      "Dedicated Trust & Safety investigation team",
      "Annual full background re-screening",
      "Continuous criminal record monitoring",
      "Monthly OIG exclusion list screening",
      "Zero-tolerance policy — no exceptions",
    ],
  },
};

// ── Continuous Monitoring (Post-Approval) ──
export const continuousMonitoring = [
  { name: "Annual Full Re-Check", desc: "Complete background check repeated every 12 months for all active Fellows", frequency: "Annually" },
  { name: "Continuous Criminal Monitoring", desc: "Real-time alerts triggered by any new criminal records across all jurisdictions", frequency: "Continuous" },
  { name: "Motor Vehicle Monitoring", desc: "Any driving flag triggers an immediate full MVR re-screen", frequency: "Continuous" },
  { name: "OIG Exclusion Screening", desc: "Monthly check against the OIG List of Excluded Individuals/Entities", frequency: "Monthly" },
  { name: "Reference Re-Verification", desc: "Annual re-contact of professional references to confirm ongoing suitability", frequency: "Annually" },
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

// ── Mock Data: Employer B2B ──
export const employerProfile = {
  company: "Meridian Health Systems",
  industry: "Healthcare",
  employees: 4200,
  enrolled: 186,
  since: "September 2025",
  plan: "Enterprise",
  admin: "Rebecca Torres",
  adminTitle: "VP, People & Culture",
};

export const employerStats = {
  enrolled: 186,
  activeParents: 142,
  utilization: 76,
  avgSatisfaction: 4.9,
  monthlyEnrollment: [28, 42, 58, 74, 92, 108, 122, 134, 148, 156, 172, 186],
};

export const employerROI = {
  caregiverPct: 34,
  avgBurdenBefore: 7.2,
  avgBurdenAfter: 3.8,
  burdenReduction: 47,
  absenteeismBefore: 8.2,
  absenteeismAfter: 4.1,
  absenteeismReduction: 50,
  turnoverBefore: 18,
  turnoverAfter: 9.4,
  turnoverReduction: 48,
  productivityGain: 22.5,
  annualSavings: 1240000,
  roiMultiple: 4.2,
  monthlyBurden: [7.2, 6.9, 6.5, 6.1, 5.6, 5.2, 4.8, 4.5, 4.2, 4.0, 3.9, 3.8],
  monthlyAbsenteeism: [8.2, 7.8, 7.2, 6.8, 6.2, 5.7, 5.3, 4.9, 4.6, 4.4, 4.2, 4.1],
  monthlyTurnover: [18.0, 17.2, 16.1, 15.0, 14.2, 13.1, 12.0, 11.2, 10.4, 10.0, 9.6, 9.4],
};

export const caregiverBurdenIndex = {
  dimensions: [
    { name: "Time & Schedule Disruption", before: 8.1, after: 4.2, weight: 0.25 },
    { name: "Emotional Stress", before: 7.8, after: 4.5, weight: 0.2 },
    { name: "Financial Strain", before: 6.9, after: 3.8, weight: 0.2 },
    { name: "Work Productivity Impact", before: 7.4, after: 3.2, weight: 0.2 },
    { name: "Physical Health Effects", before: 5.8, after: 3.1, weight: 0.15 },
  ],
  scale: "1-10 (10 = highest burden)",
  methodology: "Validated Zarit Burden Interview (ZBI-12) adapted for workplace context",
};

export const employerClinicalOutcomes = {
  engagement: { current: 87, trend: "+12%", desc: "Average senior engagement score across all enrolled parents" },
  memory: { current: 68, trend: "+8%", desc: "Memory recall stability over 6+ month enrollment period" },
  mood: { current: 82, trend: "+15%", desc: "Sustained mood improvement measured per-visit" },
  isolation: { current: 71, trend: "-34%", desc: "Reduction in social isolation indicators" },
  hospitalization: { current: 28, trend: "-28%", desc: "Reduction in unnecessary ER visits and hospitalizations" },
};

export const employerDepartments = [
  { name: "Engineering", employees: 820, enrolled: 48, utilization: 82, satisfaction: 4.9, burden: 3.4 },
  { name: "Sales & Marketing", employees: 640, enrolled: 32, utilization: 74, satisfaction: 4.8, burden: 4.1 },
  { name: "Operations", employees: 580, enrolled: 28, utilization: 71, satisfaction: 4.7, burden: 4.4 },
  { name: "Finance & Legal", employees: 420, enrolled: 22, utilization: 78, satisfaction: 4.9, burden: 3.6 },
  { name: "Human Resources", employees: 180, enrolled: 14, utilization: 86, satisfaction: 5.0, burden: 3.2 },
  { name: "Clinical Staff", employees: 960, enrolled: 31, utilization: 68, satisfaction: 4.8, burden: 4.8 },
  { name: "Administration", employees: 600, enrolled: 11, utilization: 64, satisfaction: 4.7, burden: 5.1 },
];

export const employerEmployees = [
  { id: 1, name: "Amanda Chen", dept: "Engineering", parent: "Ruth Chen", age: 81, status: "Active", enrolled: "Sep 2025", kindred: 96, fellow: "Sarah Chen", visits: 24, mood: "Joyful", legacy: 8 },
  { id: 2, name: "Marcus Williams", dept: "Sales & Marketing", parent: "Dorothy Williams", age: 76, status: "Active", enrolled: "Oct 2025", kindred: 91, fellow: "James Kim", visits: 18, mood: "Calm", legacy: 5 },
  { id: 3, name: "Dr. Priya Patel", dept: "Clinical Staff", parent: "Rajesh Patel", age: 84, status: "Active", enrolled: "Sep 2025", kindred: 88, fellow: "Maya Rodriguez", visits: 22, mood: "Reflective", legacy: 12 },
  { id: 4, name: "David Thompson", dept: "Finance & Legal", parent: "Margaret Thompson", age: 79, status: "Active", enrolled: "Nov 2025", kindred: 93, fellow: "Sarah Chen", visits: 14, mood: "Warm", legacy: 6 },
  { id: 5, name: "Lisa Rodriguez", dept: "Operations", parent: "Carmen Rodriguez", age: 88, status: "Active", enrolled: "Oct 2025", kindred: 85, fellow: "Aisha Johnson", visits: 20, mood: "Nostalgic", legacy: 9 },
  { id: 6, name: "Robert Kim", dept: "Engineering", parent: "Soon-Yi Kim", age: 82, status: "Onboarding", enrolled: "Feb 2026", kindred: 0, fellow: "Pending", visits: 0, mood: "\u2014", legacy: 0 },
];

export const employerPlans = [
  {
    name: "Starter",
    pepm: "$8",
    desc: "For companies beginning their caregiver support journey",
    features: [
      "Up to 8 hours/month per parent",
      "Standard Fellow matching",
      "Monthly utilization report",
      "Employee self-service onboarding",
      "Basic caregiver burden assessment",
    ],
    excluded: ["Clinical outcomes dashboard", "HRIS integration", "Dedicated CSM"],
    employees: "50-500",
  },
  {
    name: "Growth",
    pepm: "$14",
    popular: true,
    desc: "Most popular for mid-market employers serious about retention",
    features: [
      "Up to 16 hours/month per parent",
      "Priority Kindred matching",
      "Weekly analytics dashboard",
      "Full Caregiver Burden Index",
      "Clinical outcomes tracking",
      "ROI calculator & reports",
      "Legacy Vault for all families",
    ],
    excluded: ["HRIS integration", "Custom SLA"],
    employees: "500-5,000",
  },
  {
    name: "Enterprise",
    pepm: "Custom",
    desc: "White-glove support for large organizations with complex needs",
    features: [
      "Unlimited hours per parent",
      "Concierge Fellow matching",
      "Real-time analytics & predictive alerts",
      "Full Caregiver Burden Index + benchmarking",
      "Clinical outcomes + hospitalization tracking",
      "ROI dashboard with board-ready reports",
      "Full Legacy Vault + family portal access",
      "HRIS integration (Workday, BambooHR, ADP)",
      "Dedicated Customer Success Manager",
      "Custom SLA & compliance reporting",
    ],
    excluded: [],
    employees: "5,000+",
  },
];

export const employerB2BDifferentiators = [
  { title: "Anti-Gig Model", desc: "Dedicated Fellows build real relationships with your employees' parents \u2014 no rotating strangers.", stat: "94%", statLabel: "Avg Kindred Match" },
  { title: "Clinical-Grade Outcomes", desc: "Track engagement, memory recall, and mood with clinical rigor \u2014 not just satisfaction surveys.", stat: "87%", statLabel: "Engagement Score" },
  { title: "Caregiver Burden Index", desc: "Proprietary workplace-adapted ZBI that measures and reduces the hidden cost of caregiving.", stat: "47%", statLabel: "Burden Reduction" },
  { title: "Legacy Vault", desc: "Every visit creates a digital heirloom \u2014 stories, voice recordings, and life lessons preserved forever.", stat: "1,200+", statLabel: "Stories Captured" },
  { title: "ROI Dashboard", desc: "Real-time financial impact: reduced absenteeism, lower turnover, productivity gains \u2014 board-ready.", stat: "4.2x", statLabel: "Avg ROI" },
  { title: "Industry-Leading Safety", desc: "1,300+ database screening, TSA-grade verification, continuous monitoring. Zero tolerance.", stat: "9", statLabel: "Screening Layers" },
];

export const employerTestimonials = [
  { name: "Sarah Mitchell", title: "CHRO, Apex Financial Group", quote: "Juni reduced caregiver-related turnover by 52% in our first year. The ROI dashboard made it easy to justify to our board.", employees: "3,200" },
  { name: "Dr. James Park", title: "VP People, Cascade Health", quote: "The clinical outcomes data is unlike anything we\u2019ve seen. We can actually measure the impact on our employees\u2019 parents' wellbeing.", employees: "8,400" },
  { name: "Maria Gonzalez", title: "Benefits Director, TechForward", quote: "Our employees cry when they see the Legacy Vault recordings. It\u2019s the most meaningful benefit we\u2019ve ever offered.", employees: "1,800" },
];

// ── Mock Background Check Results ──
export const mockBgCheckResults = {
  identity: { status: BG_CHECK_STATUS.PASSED, completedDate: "Feb 1, 2026", details: "TSA-grade identity confirmed: driver's license matched to live selfie, SSN trace verified across 1,300+ databases." },
  criminal: { status: BG_CHECK_STATUS.PASSED, completedDate: "Feb 4, 2026", details: "No records found across federal, state, and county databases. Manual courthouse review completed for non-digitized jurisdictions." },
  sex_offender: { status: BG_CHECK_STATUS.PASSED, completedDate: "Feb 1, 2026", details: "No matches found in NSOPW database across all 50 states and territories." },
  elder_abuse: { status: BG_CHECK_STATUS.IN_PROGRESS, completedDate: null, details: "Awaiting response from state elder abuse and neglect registry. Estimated completion: Feb 10." },
  watchlist: { status: BG_CHECK_STATUS.PASSED, completedDate: "Feb 1, 2026", details: "Cleared against OIG exclusion list, global sanctions, and terrorism watchlist databases." },
  driving: { status: BG_CHECK_STATUS.PENDING, completedDate: null, details: "Not yet initiated. Optional for non-transport Fellows." },
  references: { status: BG_CHECK_STATUS.IN_PROGRESS, completedDate: null, details: "2 of 3 professional references verified via phone and email. Awaiting response from third contact." },
  education: { status: BG_CHECK_STATUS.PASSED, completedDate: "Feb 3, 2026", details: "B.S. in Social Work confirmed, University of Michigan, 2022." },
  drug_screen: { status: BG_CHECK_STATUS.PASSED, completedDate: "Feb 2, 2026", details: "10-panel screen completed at Quest Diagnostics. All results negative." },
};
