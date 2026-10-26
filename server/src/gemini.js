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
 * The SDK throws errors whose `.message` is often the raw JSON error body
 * from the API itself, e.g.
 *   '{"error":{"code":503,"message":"The model is overloaded...","status":"UNAVAILABLE"}}'
 * This pulls the real HTTP status, API status string, and human message out
 * of that (or out of `.status`/`.message` directly, if the SDK already
 * parsed it), so retry logic and user-facing errors never have to deal with
 * raw JSON text.
 */
function extractGeminiErrorInfo(err) {
  let httpStatus = typeof err?.status === "number" ? err.status : undefined;
  let apiStatus;
  let message = err?.message;

  if (typeof message === "string") {
    const trimmed = message.trim();
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        const inner = parsed.error ?? parsed;
        if (typeof inner.code === "number") httpStatus = httpStatus ?? inner.code;
        if (typeof inner.status === "string") apiStatus = inner.status;
        if (typeof inner.message === "string") message = inner.message;
      } catch {
        // Wasn't actually JSON, leave message as-is.
      }
    }
  }

  return { httpStatus, apiStatus, message };
}

const TRANSIENT_HTTP_STATUSES = new Set([429, 500, 503, 504]);
const TRANSIENT_API_STATUSES = new Set(["UNAVAILABLE", "RESOURCE_EXHAUSTED", "INTERNAL", "DEADLINE_EXCEEDED"]);

function isTransientGeminiError(err) {
  const { httpStatus, apiStatus } = extractGeminiErrorInfo(err);
  return TRANSIENT_HTTP_STATUSES.has(httpStatus) || TRANSIENT_API_STATUSES.has(apiStatus);
}

/**
 * Retries a transient Gemini failure (overload, rate limit, internal error)
 * with exponential backoff and jitter. Anything non-transient (bad request,
 * auth, safety block) rethrows immediately on the first try.
 */
async function withRetry(fn, { retries = 2, baseDelayMs = 1000 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === retries || !isTransientGeminiError(err)) throw err;
      const delay = Math.round(baseDelayMs * 2 ** attempt + Math.random() * 300);
      const { httpStatus, apiStatus } = extractGeminiErrorInfo(err);
      console.warn(
        `[gemini] transient error (${apiStatus || httpStatus || "unknown"}), retrying in ${delay}ms ` +
          `(attempt ${attempt + 1}/${retries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastErr;
}

/**
 * Turns any error from a Gemini call into something safe to show a user,
 * instead of the raw API error body (which can be a JSON blob with internal
 * status codes). Routes should use this in their catch blocks rather than
 * `err.message` directly.
 */
export function friendlyErrorMessage(err) {
  const { httpStatus, apiStatus, message } = extractGeminiErrorInfo(err);

  if (apiStatus === "UNAVAILABLE" || httpStatus === 503) {
    return "Gemini is overloaded right now. Please wait a few seconds and try again.";
  }
  if (apiStatus === "RESOURCE_EXHAUSTED" || httpStatus === 429) {
    return "We've hit Gemini's rate limit. Please wait a moment and try again.";
  }
  if (apiStatus === "DEADLINE_EXCEEDED" || httpStatus === 504) {
    return "Gemini took too long to respond. Please try again.";
  }
  if (apiStatus === "INTERNAL" || httpStatus === 500) {
    return "Gemini hit a temporary internal error. Please try again.";
  }
  // A plain, non-JSON message from the SDK is usually already readable
  // (e.g. our own extraction/validation errors); pass it through. Otherwise
  // don't risk leaking a raw error body to the client.
  if (message && !message.trim().startsWith("{")) return message;
  return "Something went wrong talking to Gemini. Please try again.";
}

/**
 * Thin, retrying wrapper around `ai.models.generateContent`. Every Gemini
 * call in the app (structured or grounded) should go through this instead
 * of calling `ai.models.generateContent` directly, so transient overload
 * and rate-limit errors get a few automatic retries before surfacing.
 */
export async function generateContent(params) {
  return withRetry(() => ai.models.generateContent(params));
}

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

  const response = await generateContent({
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
