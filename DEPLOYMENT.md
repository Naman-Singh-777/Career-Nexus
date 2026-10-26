# Going live

The frontend and backend deploy separately, straight from this repo on every push to `main`, the same push-to-deploy practice as a GitHub Pages portfolio site. The frontend is static, so it goes on GitHub Pages. The backend holds the Gemini key, so it needs an actual server, which goes on Render's free tier, also wired to this repo.

## 1. GitHub Pages, done

Pages is on, source is set to GitHub Actions, and the site is live at:

**https://naman-singh-777.github.io/Career-Nexus/**

The workflow in `.github/workflows/deploy-pages.yml` runs on every push to `main` and builds `client/` with Vite.

## 2. Backend on Render, deployed, one step left

The `career-nexus-api` web service exists on Render now, connected to this repo, auto-deploying on push to `main`:

**https://career-nexus-api-hcfs.onrender.com**

`GEMINI_MODEL_REASONING`, `GEMINI_MODEL_FAST`, and `ALLOWED_ORIGIN` are already set on it. `VITE_API_BASE_URL` is also already set in the repo's Actions variables and the Pages site has rebuilt against it, so the frontend is pointed at this backend.

The one thing left, and the only step that has to happen from your own accounts: open the service in the [Render dashboard](https://dashboard.render.com/web/srv-dbfb0m8m7kps738do320), go to **Environment**, and add `GEMINI_API_KEY` with your key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Render redeploys automatically once you save it. This is the only place the key lives: Render's environment, never in the repo, never shipped to the browser.

After that, every push to `main` redeploys both sides on its own.

## Why two services instead of one

The app currently also runs as a single Express process that serves the built React app itself, which is how it runs locally (`npm start`). That still works and hasn't changed. GitHub Pages only serves static files though, it cannot run the Node server that holds your API key, so the live version splits into a static frontend (Pages) and a small API-only backend (Render), talking to each other over `VITE_API_BASE_URL` and CORS.

## Free tier note

Render's free web services sleep after a period with no traffic and take a few seconds to wake on the next request. The first resume upload after a quiet stretch may hang briefly before it responds. This is a Render limit, not a bug in the app.
