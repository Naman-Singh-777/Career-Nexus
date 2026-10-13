import { Router } from "express";
import { MODELS, generateStructured, textPart } from "../gemini.js";
import { ROADMAP_SCHEMA } from "../schemas.js";
import { buildYoutubeSearchUrl } from "../youtube.js";

const router = Router();

const SYSTEM = `You are a principal learning-path designer. Given a chosen career blueprint
and the candidate's current profile, design a progression of learning stages
that closes the specific skill gaps listed for THIS candidate, not a generic
curriculum. Order stages from foundational concepts, through hands-on/core
practice projects and problems, through advanced topics, ending in a final
interview-and-test-prep stage (system design / behavioral / role-specific
technical interview practice, as appropriate to the role). For every topic,
write a natural YouTube search phrase a real learner would type, specific
enough to surface real, relevant tutorials, never a fabricated video title.`;

router.post("/", async (req, res) => {
  try {
    const { profile, blueprint } = req.body;
    if (!profile || !blueprint) return res.status(400).json({ error: "Missing profile or blueprint." });

    const { data } = await generateStructured({
      model: MODELS.FAST,
      system: SYSTEM,
      schema: ROADMAP_SCHEMA,
      thinking: "MEDIUM",
      parts: [
        textPart(
          `Candidate profile (JSON): ${JSON.stringify(profile)}\n\n` +
            `Chosen blueprint (JSON): ${JSON.stringify(blueprint)}\n\n` +
            `Design 4 stages: Foundations, Core Practice, Advanced, Interview & Test Prep. ` +
            `2-4 topics per stage, prioritized to close this candidate's specific skillGap ` +
            `entries first.`
        ),
      ],
    });

    const stages = [...data.stages]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((stage) => ({
        ...stage,
        topics: stage.topics.map((t) => ({
          ...t,
          youtubeUrl: buildYoutubeSearchUrl(t.youtubeQuery),
        })),
      }));

    res.json({ ...data, stages });
  } catch (err) {
    console.error("[roadmap]", err);
    res.status(500).json({ error: err.message || "Failed to generate roadmap." });
  }
});

export default router;
