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
wildly.`;

router.post("/", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No resume file uploaded." });
    const persona = req.body.persona || "unspecified";

    const base64 = req.file.buffer.toString("base64");

    const { data } = await generateStructured({
      model: MODELS.REASONING,
      system: SYSTEM,
      schema: PROFILE_SCHEMA,
      thinking: "HIGH",
      parts: [
        textPart(
          `The person identifies as: "${persona}". Parse the attached resume PDF into the ` +
            `structured profile schema. Infer careerStage from persona + evidence in the ` +
            `document (a "student"/"fresher" persona with no full-time roles should map to ` +
            `careerStage "student" or "fresher" even if internships are present).`
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
