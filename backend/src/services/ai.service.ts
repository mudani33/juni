import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export interface DailyBloom {
  sentiment: number;         // 0–1
  mood: string;              // e.g. "Joyful", "Reflective", "Calm"
  summary: string;           // 2–3 sentence narrative summary
  highlights: string[];      // 2–4 clinical/behavioral highlights
  topics: string[];          // 2–4 conversation topics
}

export const AIService = {
  /**
   * Generate the Daily Bloom — an AI-authored narrative summary of a visit.
   * Input: companion's raw visit notes + senior profile context.
   * Output: structured Bloom object for the family portal.
   */
  async generateDailyBloom(params: {
    seniorName: string;
    seniorNickname?: string | null;
    companionName: string;
    visitDate: string;
    visitType: string;
    activities: string[];
    rawNotes: string;
    seniorInterests: string[];
    seniorConditions: string[];
  }): Promise<DailyBloom> {
    const name = params.seniorNickname ?? params.seniorName;

    const prompt = `You are Juni's AI, generating a Daily Bloom — a warm, human, clinically-informed summary of a companionship visit for a family.

Visit details:
- Senior: ${name} (${params.seniorName})
- Companion: ${params.companionName}
- Date: ${params.visitDate}
- Visit type: ${params.visitType}
- Activities during visit: ${params.activities.join(", ") || "General conversation"}
- Senior's interests: ${params.seniorInterests.join(", ")}
- Health considerations: ${params.seniorConditions.join(", ") || "None noted"}

Companion's raw visit notes:
"""
${params.rawNotes}
"""

Generate a Daily Bloom JSON object with exactly these fields:
{
  "sentiment": <float 0.0–1.0, where 1.0 is most positive>,
  "mood": "<one of: Joyful, Warm, Nostalgic, Reflective, Calm, Energetic, Tired, Anxious>",
  "summary": "<2–3 sentences. Warm, personal, written for a loving family member. Reference specific moments. Do NOT use clinical jargon.>",
  "highlights": ["<2–4 specific behavioral or emotional observations, written concisely, e.g. 'Strong episodic memory recall'>"],
  "topics": ["<2–4 conversation topics mentioned in the notes>"]
}

Rules:
- Be warm and human, not clinical
- Reference specific details from the notes
- If notes are sparse, focus on the positive interactions observed
- Never fabricate specific facts not in the notes
- Write "highlights" as brief phrases, not full sentences
- The summary should make a family member smile and feel reassured

Return ONLY valid JSON, no markdown, no explanation.`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content[0]?.type === "text" ? response.content[0].text : "";
      const bloom = JSON.parse(text) as DailyBloom;

      logger.info("Daily Bloom generated", {
        seniorName: params.seniorName,
        mood: bloom.mood,
        sentiment: bloom.sentiment,
      });

      return bloom;
    } catch (err) {
      logger.error("AI Bloom generation failed", { error: err });
      // Return a graceful fallback so the visit isn't lost
      return {
        sentiment: 0.75,
        mood: "Calm",
        summary: `${params.companionName} had a meaningful visit with ${name} today. They spent time together on ${params.activities[0] ?? "companionship activities"}.`,
        highlights: ["Visit completed successfully"],
        topics: params.activities.slice(0, 3),
      };
    }
  },

  /**
   * Generate AI-powered visit preparation insights for a companion.
   * Helps companions show up informed about the senior they're visiting.
   */
  async generateVisitPrep(params: {
    seniorName: string;
    seniorNickname?: string | null;
    seniorAge?: number | null;
    interests: string[];
    personality?: string | null;
    routines?: string | null;
    communicationStyle?: string | null;
    recentTopics?: string[];
    lifeChanges?: string[];
    sensitiveTopics?: string | null;
    lastVisitMood?: string | null;
  }): Promise<{
    conversationStarters: string[];
    activitiesIdeas: string[];
    thingsToAvoid: string[];
    moodContext: string;
  }> {
    const name = params.seniorNickname ?? params.seniorName;

    const prompt = `You are Juni's AI, helping a companion prepare for a visit. Generate practical, specific guidance.

Senior profile:
- Name: ${name}, age ${params.seniorAge ?? "unknown"}
- Interests: ${params.interests.join(", ")}
- Personality: ${params.personality ?? "Unknown"}
- Daily routines: ${params.routines ?? "Not specified"}
- Communication style: ${params.communicationStyle ?? "Not specified"}
- Recent conversation topics: ${params.recentTopics?.join(", ") ?? "None recorded"}
- Recent life changes: ${params.lifeChanges?.join(", ") ?? "None noted"}
- Sensitive topics to avoid: ${params.sensitiveTopics ?? "None specified"}
- Mood at last visit: ${params.lastVisitMood ?? "Not recorded"}

Generate a JSON object:
{
  "conversationStarters": ["<3 specific, natural conversation openers based on their interests and recent topics>"],
  "activitiesIdeas": ["<3 activity suggestions that match their interests and mobility>"],
  "thingsToAvoid": ["<1–2 things to be mindful of based on sensitive topics or life changes, phrased gently>"],
  "moodContext": "<1 sentence about what emotional state they may be in based on recent events and last mood>"
}

Be specific, warm, and practical. Return ONLY valid JSON.`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",  // Use faster/cheaper model for prep hints
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content[0]?.type === "text" ? response.content[0].text : "";
      return JSON.parse(text) as {
        conversationStarters: string[];
        activitiesIdeas: string[];
        thingsToAvoid: string[];
        moodContext: string;
      };
    } catch (err) {
      logger.error("AI visit prep generation failed", { error: err });
      return {
        conversationStarters: [
          `Ask ${name} about their favorite memory from this time of year`,
          "What was the highlight of their week?",
          `Ask about their interest in ${params.interests[0] ?? "their hobbies"}`,
        ],
        activitiesIdeas: [
          "Look through old photos together",
          "Listen to music from their favorite era",
          "Go for a short walk if weather permits",
        ],
        thingsToAvoid: [],
        moodContext: `Check in gently on how ${name} is feeling today before diving into activities.`,
      };
    }
  },

  /**
   * Analyze a series of Bloom reports to generate 30-day trend insights.
   * Used in the family portal's Health & Insights section.
   */
  async generateTrendInsights(params: {
    seniorName: string;
    blooms: Array<{ date: string; sentiment: number; mood: string; topics: string[] }>;
  }): Promise<{
    overallTrend: "improving" | "stable" | "declining";
    keyInsight: string;
    alerts: Array<{ type: "positive" | "attention" | "info"; message: string }>;
  }> {
    if (params.blooms.length < 2) {
      return {
        overallTrend: "stable",
        keyInsight: "More visits needed to identify trends.",
        alerts: [],
      };
    }

    const recentSentiments = params.blooms.map((b) => b.sentiment);
    const avg = recentSentiments.reduce((a, b) => a + b, 0) / recentSentiments.length;
    const trend =
      recentSentiments[0]! > (recentSentiments[recentSentiments.length - 1] ?? 0) + 0.05
        ? "declining"
        : avg > 0.75
          ? "improving"
          : "stable";

    const prompt = `Analyze these visit Bloom data points for ${params.seniorName} and return trend insights.

Blooms (most recent first):
${params.blooms.map((b) => `- ${b.date}: mood=${b.mood}, sentiment=${b.sentiment.toFixed(2)}, topics=[${b.topics.join(", ")}]`).join("\n")}

Return JSON:
{
  "overallTrend": "${trend}",
  "keyInsight": "<1 sentence insight about the most notable pattern>",
  "alerts": [
    {"type": "positive|attention|info", "message": "<specific observation>"}
  ]
}

alerts should include 1–3 items. Be specific and actionable. Return ONLY valid JSON.`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content[0]?.type === "text" ? response.content[0].text : "";
      return JSON.parse(text) as {
        overallTrend: "improving" | "stable" | "declining";
        keyInsight: string;
        alerts: Array<{ type: "positive" | "attention" | "info"; message: string }>;
      };
    } catch (err) {
      logger.error("AI trend analysis failed", { error: err });
      return {
        overallTrend: trend,
        keyInsight: `${params.seniorName} has had ${params.blooms.length} recorded visits.`,
        alerts: [],
      };
    }
  },
};
