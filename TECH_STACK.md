# Career Nexus, tech stack

This is what the app is actually built on: an Express API and a React single-page frontend, with Gemini doing the reasoning (resume parsing, ATS scoring, career research, roadmap generation) that the original version did with a Python script, spaCy, TF-IDF, and a small MLP.

```
career-nexus/
├── server/    Express API. Holds the Gemini key, never sent to the browser.
└── client/    React, Vite, Tailwind, and Framer Motion frontend.
```

## Backend

- Node.js, ES modules (`"type": "module"`)
- Express 4 for routing and static file serving
- `@google/genai` (the official Gemini SDK) for every model call
- Multer for the resume PDF upload, kept in memory rather than written to disk
- dotenv for the API key and model names
- cors

`server/src/gemini.js` is the one file that talks to Gemini directly. It wraps `ai.models.generateContent`, exposes `MODELS.REASONING` and `MODELS.FAST` (both overridable through `.env`), and a `generateStructured()` helper that forces a JSON `responseSchema` so every response comes back in a guaranteed shape instead of being parsed out of free text.

Three routes:

- `POST /api/resume`, parses the uploaded PDF into a structured profile and, in the same call, an ATS-style read of the resume as a document (keyword clarity, section structure, quantified impact, formatting risk)
- `POST /api/careers`, a two-step call: first a grounded research pass using Gemini's Google Search tool, then a schema-constrained pass that turns that research into the blueprint cards the UI renders
- `POST /api/roadmap`, turns a chosen blueprint into an ordered set of learning stages, each topic paired with a YouTube search URL

## Frontend

- React 18
- Vite 6 for the dev server and the production build
- Tailwind CSS 3, with a custom fluid type scale and its own color tokens rather than Tailwind's defaults
- Framer Motion for the stage transitions and hover interactions
- lucide-react for icons
- Hand-written CSS for the glass panel surfaces, the grain overlay (an SVG `feTurbulence` filter), and a canvas particle field that reacts to pointer movement

All navigation runs through one hook, `useJourney`, a small state machine (`STAGES`) that moves the app through: hero, resume upload, ATS score, persona question, direction question (skipped for students and freshers), a synthesis loading screen, the blueprint board, and the roadmap.

The two charts on the blueprint board, the skill radar and the compatibility bars, are real SVG built from Gemini's structured numbers. Gemini never generates an image for these.

## AI layer

- Reasoning model: `gemini-3.5-flash` by default (resume parsing, ATS scoring, grounded career research), set through `GEMINI_MODEL_REASONING`
- Fast model: `gemini-3.5-flash-lite` by default (roadmap formatting, a structuring task rather than a reasoning one), set through `GEMINI_MODEL_FAST`
- Structured output everywhere through `responseSchema` (`server/src/schemas.js`), so the profile, blueprint, and roadmap shapes are enforced by the API call itself
- Google Search grounding (`tools: [{ googleSearch: {} }]`) on the career-blueprint research step, so salary ranges and demand signals come from live search results rather than being invented
- YouTube links are generated search URLs (`youtube.com/results?search_query=...`, built with `encodeURIComponent`), never a fabricated video title or ID

## Tooling and running it

- An npm workspaces-style monorepo: root, `server/`, `client/`, with a `postinstall` hook that cascades `npm install` into both
- `concurrently` to run the Express dev server and the Vite dev server together with one command
- Production mode builds the client to static files and serves them from the same Express process as the API, one origin, one port
- Source is on GitHub at `Naman-Singh-777/Career-Nexus`
