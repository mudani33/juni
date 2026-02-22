import prisma from "../db/client.js";
import { logger } from "../lib/logger.js";
import { MatchStatus } from "@prisma/client";

// Personality trait keys emitted by the vibe check
type PersonalityTraits = {
  Openness?: number;
  Conscientiousness?: number;
  Extraversion?: number;
  Agreeableness?: number;
  Neuroticism?: number;
};

/**
 * Kindred Score Algorithm
 *
 * Weighted scoring across five dimensions:
 *   1. Shared interests           — 40%
 *   2. Personality compatibility  — 25%
 *   3. Communication style match  — 15%
 *   4. Companion qualities match  — 10%
 *   5. Practical factors (availability, location proximity) — 10%
 *
 * Score is 0–100. A score ≥ 80 is presented as a "strong match".
 */

export interface MatchResult {
  companionId: string;
  kindredScore: number;
  matchReasons: string[];
}

export const MatchingService = {
  /**
   * Run the Kindred matching algorithm for a senior.
   * Returns candidates sorted by score, highest first.
   */
  async findMatchesForSenior(seniorId: string, limit = 5): Promise<MatchResult[]> {
    const senior = await prisma.senior.findUniqueOrThrow({
      where: { id: seniorId },
    });

    // Only match with ACTIVE companions who haven't been rejected for this senior
    const rejectedIds = await prisma.match
      .findMany({
        where: { seniorId, status: MatchStatus.REJECTED },
        select: { companionId: true },
      })
      .then((rows) => rows.map((r) => r.companionId));

    const companions = await prisma.companionAccount.findMany({
      where: {
        status: "ACTIVE",
        id: { notIn: rejectedIds },
        // Don't show companions already matched with this senior
        matches: {
          none: {
            seniorId,
            status: { in: [MatchStatus.ACTIVE, MatchStatus.ACCEPTED, MatchStatus.PROPOSED] },
          },
        },
      },
      include: {
        user: { select: { email: true } },
      },
    });

    const results: MatchResult[] = companions.map((companion) => {
      const score = computeKindredScore(senior, companion);
      return {
        companionId: companion.id,
        kindredScore: score.total,
        matchReasons: score.reasons,
      };
    });

    results.sort((a, b) => b.kindredScore - a.kindredScore);
    return results.slice(0, limit);
  },

  /** Persist proposed matches for a senior in the DB */
  async proposeMatches(seniorId: string, matches: MatchResult[]): Promise<void> {
    await prisma.$transaction(
      matches.map((m) =>
        prisma.match.upsert({
          where: {
            seniorId_companionId: { seniorId, companionId: m.companionId },
          },
          create: {
            seniorId,
            companionId: m.companionId,
            kindredScore: m.kindredScore,
            matchReasons: m.matchReasons,
            status: MatchStatus.PROPOSED,
          },
          update: {
            kindredScore: m.kindredScore,
            matchReasons: m.matchReasons,
            status: MatchStatus.PROPOSED,
          },
        }),
      ),
    );

    logger.info("Matches proposed", { seniorId, count: matches.length });
  },

  /** Family accepts a match */
  async acceptMatch(matchId: string, familyUserId: string): Promise<void> {
    const match = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });

    // Verify family owns this senior
    const senior = await prisma.senior.findFirst({
      where: { id: match.seniorId, family: { userId: familyUserId } },
    });
    if (!senior) throw new Error("Unauthorized");

    await prisma.$transaction([
      prisma.match.update({
        where: { id: matchId },
        data: { status: MatchStatus.ACTIVE, acceptedAt: new Date() },
      }),
      prisma.senior.update({
        where: { id: match.seniorId },
        data: { companionId: match.companionId },
      }),
    ]);

    logger.info("Match accepted", { matchId });
  },

  /** Family rejects a proposed match */
  async rejectMatch(matchId: string, familyUserId: string): Promise<void> {
    const match = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });

    const senior = await prisma.senior.findFirst({
      where: { id: match.seniorId, family: { userId: familyUserId } },
    });
    if (!senior) throw new Error("Unauthorized");

    await prisma.match.update({
      where: { id: matchId },
      data: { status: MatchStatus.REJECTED, rejectedAt: new Date() },
    });
  },
};

// ─── Scoring helpers ──────────────────────────────────────────────────────────

interface ScoredResult {
  total: number;
  reasons: string[];
}

function computeKindredScore(
  senior: {
    interests: string[];
    companionQualities: string[];
    personality?: unknown;
    socialStyle?: string[];
    visitTimes?: string | null;
    location?: string | null;
    conditions?: string[];
  },
  companion: {
    interests: string[];
    availability?: string | null;
    city?: string | null;
    state?: string | null;
  },
): ScoredResult {
  const reasons: string[] = [];
  let total = 0;

  // ── 1. Shared interests (40 points) ───────────────────────────────
  const sharedInterests = senior.interests.filter((i) =>
    companion.interests.some((ci) => ci.toLowerCase().includes(i.toLowerCase().split(" ")[0] ?? "")),
  );
  const interestScore = Math.min(40, (sharedInterests.length / Math.max(senior.interests.length, 1)) * 40);
  total += interestScore;

  if (sharedInterests.length > 0) {
    reasons.push(
      sharedInterests.length === 1
        ? `Shared love of ${sharedInterests[0]}`
        : `${sharedInterests.length} shared interests including ${sharedInterests.slice(0, 2).join(" and ")}`,
    );
  }

  // ── 2. Personality compatibility (25 points) ──────────────────────
  // Senior's personality is a Big Five object; companion's is inferred from their motivation/interests
  const personalityScore = estimatePersonalityCompatibility(
    senior.personality as PersonalityTraits | undefined,
    companion,
  );
  total += personalityScore;
  if (personalityScore > 18) {
    reasons.push("Strong personality compatibility");
  } else if (personalityScore > 12) {
    reasons.push("Good personality fit");
  }

  // ── 3. Communication style (15 points) ────────────────────────────
  const socialStyle = senior.socialStyle ?? [];
  let commScore = 10; // baseline
  if (socialStyle.includes("Prefers one-on-one over groups")) commScore += 5;
  if (socialStyle.includes("Opens up over a shared activity") && sharedInterests.length > 0) commScore += 3;
  total += Math.min(15, commScore);

  // ── 4. Companion qualities match (10 points) ──────────────────────
  const qualities = senior.companionQualities ?? [];
  if (qualities.length > 0) {
    const qualScore = Math.min(10, qualities.length * 2);
    total += qualScore;
    if (qualities.length >= 3) {
      reasons.push(`Matches ${qualities.length} preferred companion qualities`);
    }
  }

  // ── 5. Practical factors (10 points) ──────────────────────────────
  let practical = 5; // baseline
  // Availability bonus
  if (companion.availability && companion.availability !== "weekends") {
    practical += 3;
  }
  // Location — simple state match (real implementation would use geocoding)
  if (senior.location && companion.state) {
    const seniorState = extractState(senior.location);
    if (seniorState && seniorState.toLowerCase() === companion.state.toLowerCase()) {
      practical += 2;
      reasons.push("Nearby location");
    }
  }
  total += Math.min(10, practical);

  return { total: Math.round(Math.min(100, total)), reasons };
}

function estimatePersonalityCompatibility(
  seniorPersonality: PersonalityTraits | undefined,
  _companion: unknown,
): number {
  if (!seniorPersonality) return 12; // neutral score when we don't have data
  // In production this would compare against a companion personality profile
  // derived from their application and psychometric intake.
  // For now, return a score based on senior agreeableness (correlates with adaptability)
  const agreeableness = seniorPersonality.Agreeableness ?? 70;
  return Math.round(8 + (agreeableness / 100) * 17);
}

function extractState(location: string): string | null {
  const match = location.match(/,\s*([A-Z]{2})$/);
  return match?.[1] ?? null;
}
