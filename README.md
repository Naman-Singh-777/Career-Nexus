# Career Nexus v2: Gemini Reasoning Engine

The original Career Nexus ran as a one-shot Python script: PyPDF2 for text extraction, spaCy for skill parsing, TF-IDF plus a small Sequential MLP for matching. This version rebuilds it as a real web app and hands that reasoning to Gemini instead: resume parsing, skill-gap scoring, career-path research grounded in live search rather than the old synthetic 100-row CSV, and a learning roadmap.

```
career-nexus/
├── server/    Express API. Holds your Gemini key, never sent to the browser.
└── client/    React, Vite, Tailwind, and Framer Motion frontend.
```

## 1. Get a free Gemini API key

1. Go to https://aistudio.google.com/apikey and sign in.
2. Click **Create API key** (no billing or credit card needed for the free tier).
3. Copy the key.

The free tier comfortably covers personal use of this app. The Flash and Flash-Lite models this project defaults to are rate-limited per minute and per day, not metered per dollar. See the pricing page linked in `server/.env.example` if you ever need higher limits.

## 2. Configure

```bash
cd server
cp .env.example .env
# open .env and paste your key into GEMINI_API_KEY=
```

## 3. Install and run (development)

From the repo root:

```bash
npm run install:all
npm run dev
```

This starts the Express API on `:8787` and the Vite dev server on `:5173`, which proxies `/api/*` to Express. Open **http://localhost:5173**.

## 4. Run as one server (production style)

```bash
npm run build   # builds the React app into client/dist
npm start        # Express serves the API and the built frontend on :8787
```

Open **http://localhost:8787**. Single origin, single process.

## What actually calls Gemini, and why

| Step | Model | Why |
|---|---|---|
| Resume to structured profile (`server/src/routes/resume.js`) | `gemini-3.1-pro-preview` (`GEMINI_MODEL_REASONING`) | Needs real document understanding (the PDF is sent as `inlineData`) plus judgment about implicit skills. A cheaper model tends to under-read resumes. |
| Career blueprints (`routes/careers.js`) | same model, with Google Search grounding | Two steps. First, a grounded research pass (`tools: [{ googleSearch: {} }]`) pulls real current job-posting and salary signal. Then a second, schema-constrained pass turns that research into the strict JSON the UI renders. Scores and salary ranges come from the research step, not invention. |
| Learning roadmap (`routes/roadmap.js`) | `gemini-3.5-flash-lite` (`GEMINI_MODEL_FAST`) | Structuring an ordered topic list is a formatting task, not a reasoning task, so a cheap, fast model is enough. |

**On the charts:** Gemini never draws pixels. For every visualization (skill radar, industry-compatibility bars, roadmap timeline), Gemini returns the numbers through a strict `responseSchema` (see `server/src/schemas.js`), and the React components (`client/src/components/Charts.jsx`, `RoadmapView.jsx`) draw real SVG from that data. That is what "graphs made using Gemini's thinking" means here: the thinking produces the data, and the app renders it faithfully instead of asking a model to hallucinate an image.

**On the YouTube recommendations:** Gemini is never asked to name a specific video, because it cannot guarantee one exists. For each topic it writes a precise search phrase, and `server/src/youtube.js` turns that into a real, safe `youtube.com/results?search_query=...` link. You always land on real YouTube search results, ordered by the app from foundational, to core practice, to advanced, to interview and test prep.

## Swapping models

Free-tier rate limits shift between Flash and Flash-Lite generations faster than this file will stay current. If you hit `429`s, edit `server/.env`:

```
GEMINI_MODEL_REASONING=gemini-3.5-flash
GEMINI_MODEL_FAST=gemini-3.1-flash-lite
```

## If the `@google/genai` API has moved on

Everything that talks to Gemini is isolated in `server/src/gemini.js` (`generateStructured`, the `ai` client, the `MODELS` constants). It is built around the exact `ai.models.generateContent` plus `config.thinkingConfig` pattern from your own verified `gemini_test.mjs`. If Google changes the SDK's call shape, this is the one file to update. Every route imports from here instead of calling the SDK directly.

## Extending

The onboarding persona logic lives in `client/src/state/useJourney.js`. The student, fresher, and professional branching, along with the transition-versus-stay question, are both handled there in one place.

To use the real YouTube Data API instead of search links, swap `server/src/youtube.js`'s `buildYoutubeSearchUrl` for an actual `youtube.googleapis.com/search` call. The roadmap route already isolates that concern to one function, so the change stays local to that file.
