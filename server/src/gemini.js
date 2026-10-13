import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "[gemini] GEMINI_API_KEY is not set. Requests to /api/* will fail until you add it to server/.env"
  );
}

// Single shared client. Picks up GEMINI_API_KEY from the environment automatically,
// matching the working baseline template (`new GoogleGenAI()`).
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const MODELS = {
  // Deep reasoning: resume interpretation, career-path judgement, grounded research.
  REASONING: process.env.GEMINI_MODEL_REASONING || "gemini-3.1-pro-preview",
  // Cheap and fast: roadmap formatting, query generation, anything high volume.
  FAST: process.env.GEMINI_MODEL_FAST || "gemini-3.5-flash-lite",
};

/**
 * Strips ```json ... ``` fences some models still wrap around structured
 * output, and recovers the first top-level {...} or [...] block if the
 * model added stray prose despite the schema. Defensive parsing so a
 * slightly chatty response never 500s the whole request.
 */
function safeParseJSON(raw) {
  if (raw == null) throw new Error("Empty response from Gemini");
  let text = String(raw).trim();
  text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(text);
  } catch (err) {
    const start = Math.min(
      ...["{", "["].map((c) => {
        const i = text.indexOf(c);
        return i === -1 ? Infinity : i;
      })
    );
    const end = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
    if (start !== Infinity && end !== -1 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw err;
  }
}

/**
 * Structured, schema-constrained generation. Use for anything the frontend
 * needs to render as data (profiles, blueprints, roadmaps).
 *
 * @param {object} opts
 * @param {string} opts.model
 * @param {string} opts.system - system instruction
 * @param {Array}  opts.parts  - genai `parts` array (text and/or inlineData)
 * @param {object} opts.schema - JSON schema for responseSchema
 * @param {"LOW"|"MEDIUM"|"HIGH"} [opts.thinking]
 * @param {boolean} [opts.grounded] - enable Google Search grounding tool
 */
export async function generateStructured({
  model,
  system,
  parts,
  schema,
  thinking = "HIGH",
  grounded = false,
}) {
  const config = {
    systemInstruction: system,
    thinkingConfig: { thinkingLevel: thinking },
  };

  if (grounded) {
    // Grounding and forced JSON mime type are mutually exclusive in the API,
    // so grounded calls ask for JSON-in-prose via the system instruction and
    // we parse it defensively below.
    config.tools = [{ googleSearch: {} }];
  } else {
    config.responseMimeType = "application/json";
    config.responseSchema = schema;
  }

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts }],
    config,
  });

  const text = response.text ?? response.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
  const groundingChunks =
    response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c) => c.web).filter(Boolean) ?? [];

  return { data: safeParseJSON(text), sources: groundingChunks, raw: text };
}

export function textPart(text) {
  return { text };
}

export function pdfPart(base64Data) {
  return { inlineData: { mimeType: "application/pdf", data: base64Data } };
}
