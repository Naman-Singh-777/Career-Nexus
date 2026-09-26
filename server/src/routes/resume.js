import { Router } from "express";
import multer from "multer";
import { generateStructured, MODELS, textPart, pdfPart } from "../gemini.js";
import { PROFILE_SCHEMA } from "../schemas.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF resumes are supported right now."));
    }
    cb(null, true);
  },
});

const router = Router();

const SYSTEM = `You are a principal career architect at Career Nexus. You read a resume
carefully, including skills implied by project or work descriptions and not
just skills explicitly listed, and produce a precise, honest structured profile.
Estimate proficiency (0-100) conservatively from evidence in the document.
Do not invent employers, dates, or credentials that are not present or
reasonably implied. If information is missing, omit it rather than guessing
wildly. Infer careerStage from the evidence itself: graduation dates, whether
any role is full-time versus an internship, and total years of experience.

You also produce an ATS compatibility read of the document itself: how a
typical applicant tracking system would parse and rank this exact file, not
a match against any specific job posting. Score keyword clarity, section
structure, quantified impact, and formatting risk (tables, columns, or images
that confuse parsers), each 0 to 100 with a short note, plus one overall score.`;

router.post("/", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No resume file uploaded." });

    const base64 = req.file.buffer.toString("base64");

    const { data } = await generateStructured({
      model: MODELS.REASONING,
      system: SYSTEM,
      schema: PROFILE_SCHEMA,
      thinking: "HIGH",
      parts: [
        textPart(
          "Parse the attached resume PDF into the structured profile schema, including " +
            "the ATS compatibility read."
        ),
        pdfPart(base64),
      ],
    });

    res.json({ profile: data });
  } catch (err) {
    console.error("[resume]", err);
    res.status(500).json({ error: err.message || "Failed to analyze resume." });
  }
});

export default router;
export { upload };
