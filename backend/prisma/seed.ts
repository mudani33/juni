/**
 * Database seed — creates demo data for local development.
 * Run with: npm run db:seed
 */
import { PrismaClient, UserRole, CompanionStatus, CheckrStatus, PlanName, VisitStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Demo family user ─────────────────────────────────────────────────────
  const familyPasswordHash = await bcrypt.hash("Demo1234!", 12);
  const familyUser = await prisma.user.upsert({
    where: { email: "family@demo.juni.care" },
    update: {},
    create: {
      email: "family@demo.juni.care",
      passwordHash: familyPasswordHash,
      role: UserRole.FAMILY,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      family: {
        create: {
          firstName: "Rebecca",
          lastName: "Robertson",
          phone: "+15551234567",
          seniors: {
            create: {
              firstName: "Margaret",
              nickname: "Maggie",
              age: 78,
              relationship: "My mother",
              livingSituation: "Alone at home",
              location: "Austin, TX",
              languages: ["English"],
              personality: {
                Openness: 82,
                Conscientiousness: 71,
                Extraversion: 55,
                Agreeableness: 88,
                Neuroticism: 34,
              },
              interests: ["Italian cooking", "Travel stories", "Photography", "Classical music", "Gardening", "Family genealogy"],
              socialStyle: ["Prefers one-on-one over groups", "Warms up slowly — needs time to trust"],
              conditions: [],
              visitTimes: "Morning (8am–12pm)",
              visitFrequency: "Twice a week",
              visitLength: "2 hours",
              lifeChanges: ["Lost a spouse or partner"],
              bringsJoy: "Morning tea on the porch, hearing from grandkids, tending to her tomato plants",
              struggles: "Loneliness since Harold passed. Misses her old routines.",
              sensitiveTopics: "Don't bring up the move from their house — still raw.",
              goals: ["Someone to keep them company so they're less lonely", "Help them capture and preserve their stories"],
              companionQualities: ["Patient and gentle", "Good cook — can cook together", "Musical — can sing or play"],
            },
          },
        },
      },
    },
    include: { family: { include: { seniors: true } } },
  });

  // ── Demo companion user ──────────────────────────────────────────────────
  const companionPasswordHash = await bcrypt.hash("Demo1234!", 12);
  const companionUser = await prisma.user.upsert({
    where: { email: "companion@demo.juni.care" },
    update: {},
    create: {
      email: "companion@demo.juni.care",
      passwordHash: companionPasswordHash,
      role: UserRole.COMPANION,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      companion: {
        create: {
          firstName: "Sarah",
          lastName: "Chen",
          phone: "+15559876543",
          dob: new Date("1990-04-15"),
          zipcode: "78701",
          city: "Austin",
          state: "TX",
          motivation: "My grandmother struggled with loneliness in her final years and I was the only grandchild nearby. That experience showed me how transformative genuine companionship can be.",
          availability: "part-time",
          interests: ["Italian cooking", "Music & Arts", "Travel Stories", "Photography", "Gardening"],
          hearAbout: "social-media",
          status: CompanionStatus.ACTIVE,
          checkrStatus: CheckrStatus.PASSED,
          bgCheckResults: {
            identity: { status: "Passed", completedDate: "Feb 1, 2026" },
            criminal: { status: "Passed", completedDate: "Feb 4, 2026" },
            sex_offender: { status: "Passed", completedDate: "Feb 1, 2026" },
            watchlist: { status: "Passed", completedDate: "Feb 1, 2026" },
            education: { status: "Passed", completedDate: "Feb 3, 2026" },
            drug_screen: { status: "Passed", completedDate: "Feb 2, 2026" },
          },
          trainingProgress: {
            empathetic_communication: 100,
            dementia_awareness: 100,
            legacy_storytelling: 72,
            de_escalation: 45,
            advanced_reminiscence: 0,
          },
        },
      },
    },
    include: { companion: true },
  });

  // ── Admin user ────────────────────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash("Admin1234!", 12);
  await prisma.user.upsert({
    where: { email: "admin@juni.care" },
    update: {},
    create: {
      email: "admin@juni.care",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  // ── Link companion to senior ──────────────────────────────────────────────
  const senior = familyUser.family?.seniors[0];
  const companion = companionUser.companion;

  if (senior && companion) {
    // Create match
    await prisma.match.upsert({
      where: { seniorId_companionId: { seniorId: senior.id, companionId: companion.id } },
      update: {},
      create: {
        seniorId: senior.id,
        companionId: companion.id,
        kindredScore: 94,
        matchReasons: [
          "Shared love of Italian cooking",
          "Musical background aligns",
          "Both enjoy travel stories",
          "Photography as a shared interest",
        ],
        status: "ACTIVE",
        acceptedAt: new Date("2024-08-15"),
      },
    });

    // Link companion to senior
    await prisma.senior.update({
      where: { id: senior.id },
      data: { companionId: companion.id },
    });

    // ── Demo visits with blooms ───────────────────────────────────────────
    const now = new Date();
    const completedVisit = await prisma.visit.create({
      data: {
        seniorId: senior.id,
        companionId: companion.id,
        scheduledAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        durationMin: 120,
        visitType: "Regular visit",
        status: VisitStatus.COMPLETED,
        checkInAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        checkOutAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        actualMinutes: 120,
        mood: "Joyful",
        activities: ["Looking at old photos", "Talking about Florence", "Making tea"],
        notes: "Maggie was in wonderful spirits today. We spent the morning looking through old photo albums from her trip to Florence in 1972. She recalled the names of three restaurants she visited unprompted and laughed recounting a story about missing her train to Venice. She mentioned wanting to try making homemade pasta again soon.",
        bloom: {
          sentiment: 0.87,
          mood: "Joyful",
          summary: "Maggie was in wonderful spirits today. She and Sarah spent the morning looking through old photo albums from her trip to Florence in 1972. She recalled the names of three restaurants she visited — unprompted — and laughed recounting a story about missing her train to Venice. She mentioned wanting to try making homemade pasta again soon.",
          highlights: ["Strong episodic memory recall", "Expressed future-oriented desire", "Sustained engagement for 2+ hours"],
          topics: ["Travel memories", "Italian cooking", "Family stories"],
        },
        bloomGeneratedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        billedHours: 2.0,
      },
    });

    // Upcoming visit
    await prisma.visit.create({
      data: {
        seniorId: senior.id,
        companionId: companion.id,
        scheduledAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        durationMin: 120,
        visitType: "Regular visit",
        status: VisitStatus.SCHEDULED,
      },
    });

    // ── Demo subscription ─────────────────────────────────────────────────
    const family = familyUser.family!;
    await prisma.subscription.create({
      data: {
        familyId: family.id,
        stripeCustomerId: "cus_demo_robertson",
        stripeSubId: "sub_demo_robertson",
        plan: PlanName.PREMIUM,
        status: "active",
        currentPeriodStart: new Date("2026-02-01"),
        currentPeriodEnd: new Date("2026-03-01"),
      },
    });

    // ── Demo payout ───────────────────────────────────────────────────────
    const payout = await prisma.payout.create({
      data: {
        companionId: companion.id,
        period: "Feb 1–15, 2026",
        periodStart: new Date("2026-02-01"),
        periodEnd: new Date("2026-02-15"),
        grossAmountCents: 31200,   // $312
        platformFeeCents: 3120,    // $31.20 (10%)
        netAmountCents: 28080,     // $280.80
        status: "PAID",
        paidAt: new Date("2026-02-17"),
      },
    });

    await prisma.visit.update({
      where: { id: completedVisit.id },
      data: { payoutId: payout.id },
    });
  }

  console.log("✅ Seed complete!");
  console.log("");
  console.log("Demo accounts:");
  console.log("  Family:    family@demo.juni.care    / Demo1234!");
  console.log("  Companion: companion@demo.juni.care / Demo1234!");
  console.log("  Admin:     admin@juni.care          / Admin1234!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error("❌ Seed failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
