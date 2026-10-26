import path from "node:path";
import { Router } from "express";
import multer from "multer";
import mammoth from "mammoth";
import WordExtractor from "word-extractor";
import { generateStructured, MODELS, textPart, pdfPart } from "../gemini.js";
import { PROFILE_SCHEMA } from "../schemas.js";

// Browsers are inconsistent about what mimetype they report for .doc and
// .txt (some send application/octet-stream for anything they don't
// recognize), so the extension is the reliable signal and the mimetype is
// just a second opinion when it happens to be useful.
const ACCEPTED_EXTENSIONS = new Set([".pdf", ".docx", ".doc", ".txt"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (!ACCEPTED_EXTENSIONS.has(ext)) {
      return cb(new Error("Resumes can be PDF, DOCX, DOC, or TXT right now."));
    }
    cb(null, true);
  },
});

const router = Router();

/**
 * Turns the uploaded file into Gemini `parts`. PDFs go in as inline binary
 * data since Gemini reads those natively and does better with the original
 * layout. Everything else gets its text pulled out here first, since Gemini
 * has no native reader for .docx/.doc and a plain .txt needs no extraction
 * at all.
 */
async function extractParts(file) {
  const ext = path.extname(file.originalname || "").toLowerCase();

  if (ext === ".pdf") {
    return [pdfPart(file.buffer.toString("base64"))];
  }

  if (ext === ".docx") {
    const { value: text } = await mammoth.extractRawText({ buffer: file.buffer });
    if (!text.trim()) throw new Error("Could not find any text in that DOCX file.");
    return [textPart(`Resume text, extracted from a DOCX file:\n\n${text}`)];
  }

  if (ext === ".doc") {
    const extractor = new WordExtractor();
    const doc = await extractor.extract(file.buffer);
    const text = doc.getBody();
    if (!text.trim()) throw new Error("Could not find any text in that DOC file.");
    return [textPart(`Resume text, extracted from a DOC file:\n\n${text}`)];
  }

  // .txt, and anything else that slipped past the filter
  const text = file.buffer.toString("utf-8");
  if (!text.trim()) throw new Error("That file looked empty.");
  return [textPart(`Resume text:\n\n${text}`)];
}

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

    let fileParts;
    try {
      fileParts = await extractParts(req.file);
    } catch (err) {
      return res.status(400).json({ error: err.message || "Could not read that file." });
    }

    const { data } = await generateStructured({
      model: MODELS.REASONING,
      system: SYSTEM,
      schema: PROFILE_SCHEMA,
      thinking: "HIGH",
      parts: [
        textPart(
          "Parse the attached resume into the structured profile schema, including " +
            "the ATS compatibility read."
        ),
        ...fileParts,
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
