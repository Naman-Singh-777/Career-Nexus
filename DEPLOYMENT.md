# Going live

The frontend and backend deploy separately, straight from this repo on every push to `main`, the same push-to-deploy practice as a GitHub Pages portfolio site. The frontend is static, so it goes on GitHub Pages. The backend holds the Gemini key, so it needs an actual server, which goes on Render's free tier, also wired to this repo.

Both pieces are already set up in code. Two one-time clicks are left, neither of which I can do from here since they need your own GitHub and Render logins.

## 1. Turn on GitHub Pages

In the repo on github.com: **Settings, Pages, Build and deployment, Source**, set it to **GitHub Actions**. That's the whole step. The workflow in `.github/workflows/deploy-pages.yml` already runs on every push to `main` and builds `client/` with Vite.

Once that's on, the site will build on the next push, but it will be calling an API that doesn't exist yet, so do step 2 first if you want it working right away rather than just deployed.

## 2. Deploy the backend to Render

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. **New, Blueprint**, pick this repo. Render reads `render.yaml` at the root and proposes one web service, `career-nexus-api`.
3. It will ask for `GEMINI_API_KEY`. Paste your key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey). This is the only place the key lives: Render's environment, never in the repo, never shipped to the browser.
4. Deploy. Render gives the service a URL, something like `https://career-nexus-api.onrender.com`.
5. Back in the repo: **Settings, Secrets and variables, Actions, Variables, New repository variable**. Name it `VITE_API_BASE_URL`, value is that Render URL, no trailing slash.
6. Push anything to `main` (or re-run the Pages workflow from the Actions tab) so the frontend rebuilds pointing at the live backend.

After that, every push to `main` redeploys both sides on its own.

## Why two services instead of one

The app currently also runs as a single Express process that serves the built React app itself, which is how it runs locally (`npm start`). That still works and hasn't changed. GitHub Pages only serves static files though, it cannot run the Node server that holds your API key, so the live version splits into a static frontend (Pages) and a small API-only backend (Render), talking to each other over `VITE_API_BASE_URL` and CORS.

## Free tier note

Render's free web services sleep after a period with no traffic and take a few seconds to wake on the next request. The first resume upload after a quiet stretch may hang briefly before it responds. This is a Render limit, not a bug in the app.
