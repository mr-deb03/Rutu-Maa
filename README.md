# 🌸 Rutu-Maa — Next.js edition

The Rutu-Maa period & hygiene companion rebuilt on **Next.js (App Router)** with **Route Handlers as the backend**. Same features as before — cycle tracking, **Claude AI dietary plans**, a **PCOD corner**, hygiene guidance, and **Web Push reminders** — now as one cohesive Next.js application.

> The original Express version still lives in the parent folder (`../`). This `nextjs/` folder is the Next.js rebuild.

## Quick start

```bash
npm install
cp .env.example .env        # (Windows: copy .env.example .env)
npm run dev                 # → http://localhost:3001
```

Production:

```bash
npm run build && npm start  # → http://localhost:3001
```

### Optional integrations
- **AI diet plans:** set `OPENAI_API_KEY` in `.env` (default model `gpt-4o-mini`). Without it, the **Diet** page uses the on-device engine.
- **Background push:** `npm run genkeys` → paste `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `NEXT_PUBLIC_VAPID_PUBLIC_KEY` into `.env`, then restart.

## Architecture

```
app/
  layout.jsx            Root layout: providers, 3D background, nav, fonts
  globals.css           Design system (CSS variables)
  page.jsx              Landing
  auth/ dashboard/ tracker/ diet/ pcod/ hygiene/ reminders/ profile/
                        One App-Router page per view (client components)
  api/                  Route Handlers = the backend (Node runtime)
    config/  auth/{register,login,logout}/  me/  periods/[start]/
    diet/{,save}/  reminders/  pad/  push/{subscribe,test}/
components/
  AppProviders.jsx      Auth + toast context, REST client, push subscribe
  Chrome.jsx            Top nav + bottom nav + install banner
  ThreeBackground.jsx   Interactive three.js background
  ui.jsx                Shared presentational bits (Ring, PlanCard, …)
lib/
  db.js                 Postgres (pg) in prod / embedded PGlite locally — same SQL
  auth.js  session.js   scrypt hashing, cookie sessions (httpOnly)
  ai.js                 Claude Messages API (fetch + structured JSON output)
  push.js  scheduler.js Web Push + 60s background reminder scheduler
  cycle.js  engine.js   cycle math (server) + client engine & diet fallback
  content.js            PCOD / hygiene / food knowledge base
instrumentation.js      Starts the push scheduler when the server boots
```

### Backend notes
- **Auth:** session token in an **httpOnly cookie** (`rm_token`); passwords hashed with Node `scrypt`.
- **DB:** **Postgres** via `pg` (set `DATABASE_URL`). With no `DATABASE_URL`, local dev uses an embedded **PGlite** Postgres at `./data/pgdata` — identical SQL, zero setup.
- **AI:** `app/api/diet` calls OpenAI Chat Completions with Structured Outputs (`response_format: json_schema`) → validated plan; falls back gracefully to the on-device engine when no key.
- **Push / reminders:** locally, `instrumentation.js` runs a 60s in-process scheduler. On Vercel, **Vercel Cron** hits `/api/cron/reminders` (see `vercel.json`) since serverless has no long-lived process.

## Deploying to Vercel
See **[DEPLOY.md](./DEPLOY.md)** — create a Postgres DB (Neon/Supabase/Vercel Postgres), import the repo with **Root Directory = `nextjs`**, set env vars, deploy. Schema auto-creates on first request.

Educational guidance only — not a medical device.
