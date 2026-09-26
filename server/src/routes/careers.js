import { Router } from "express";
import { ai, MODELS, generateStructured, textPart } from "../gemini.js";
import { BLUEPRINTS_SCHEMA } from "../schemas.js";

const router = Router();

const GROUNDED_RESEARCH_SYSTEM = `You are a labor-market research analyst. Given a candidate profile, use
Google Search to find CURRENT, REAL evidence about job openings, in-demand
skills, and typical compensation for the candidate's plausible next roles.
Write a concise, factual research brief (plain text, not JSON) covering, per
candidate-relevant role: typical required skills seen in current job
postings, approximate salary ranges you found, and demand/growth signals.
Cite what you find in prose (you do not need a References section, inline
mentions are fine). Be specific and current; do not pad with generic advice.`;

const BLUEPRINT_SYSTEM = `You are a principal career architect delivering an inspiring, deeply
analytical career blueprint board. You are given (a) a structured candidate
profile and (b) a grounded research brief containing real, current market
data. Turn this into blueprints that follow the requested schema exactly.
Compatibility scores and salary ranges must be derived from the research
brief, not invented. Narratives should be motivating and human, never
generic corporate filler. Write like you actually believe in this person's
potential and can point to specific evidence from their background.`;

router.post("/", async (req, res) => {
  try {
    const { profile, direction } = req.body;
    if (!profile) return res.status(400).json({ error: "Missing profile." });

    const wantsNewPaths =
      direction === "transition" || profile.careerStage === "student" || profile.careerStage === "fresher";

    const pathCount = wantsNewPaths ? 3 : 2;
    const trackWord = wantsNewPaths ? "transition" : "advancement";

    // Step 1: ground the request in real, current data via Google Search.
    const researchPrompt = wantsNewPaths
      ? `Candidate profile (JSON): ${JSON.stringify(profile)}\n\nFind ${pathCount} realistic, ` +
        `distinct career paths this person could transition into given their actual skills ` +
        `and experience (not a generic "top careers" list, but grounded in what current job ` +
        `postings ask for that overlaps with what they already have). For each, research ` +
        `real current requirements, salary ranges, and demand.`
      : `Candidate profile (JSON): ${JSON.stringify(profile)}\n\nThis person wants to grow ` +
        `WITHIN their current profile ("${profile.currentRole || "their current role"}") rather ` +
        `than switch careers. Research ${pathCount} realistic next-level specializations or ` +
        `seniority tracks for this exact role today, with real current requirements, salary ` +
        `ranges, and demand signals.`;

    const researchResponse = await ai.models.generateContent({
      model: MODELS.REASONING,
      contents: [{ role: "user", parts: [{ text: researchPrompt }] }],
      config: {
        systemInstruction: GROUNDED_RESEARCH_SYSTEM,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingLevel: "HIGH" },
      },
    });

    const researchBrief =
      researchResponse.text ??
      researchResponse.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ??
      "";
    const sources =
      researchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((c) => c.web)
        .filter(Boolean) ?? [];

    // Step 2: turn the grounded brief into the strict UI schema.
    const { data } = await generateStructured({
      model: MODELS.REASONING,
      system: BLUEPRINT_SYSTEM,
      schema: BLUEPRINTS_SCHEMA,
      thinking: "HIGH",
      parts: [
        textPart(
          `Candidate profile (JSON): ${JSON.stringify(profile)}\n\n` +
            `Grounded research brief:\n${researchBrief}\n\n` +
            `Produce exactly ${pathCount} blueprints, all with track "${trackWord}". ` +
            `skillGap entries must reference skills that appear (or are clearly implied) in ` +
            `the candidate profile for userLevel, and realistic role expectations for ` +
            `requiredLevel.`
        ),
      ],
    });

    res.json({ blueprints: data.blueprints, sources });
  } catch (err) {
    console.error("[careers]", err);
    res.status(500).json({ error: err.message || "Failed to generate career blueprints." });
  }
});

export default router;
