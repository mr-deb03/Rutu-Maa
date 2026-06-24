# 🚀 Deploying Rutu-Maa to Vercel (with Postgres)

The app runs on Postgres in production and is built for Vercel. The database
schema is created automatically on first request (lazy `CREATE TABLE IF NOT EXISTS`),
so there is **no separate migration step**.

---

## 1. Create a Postgres database
Pick any Postgres provider and copy its connection string:
- **Neon** (recommended, free): https://neon.tech → use the **pooled** connection string.
- **Supabase**: Project → Settings → Database → Connection string (URI).
- **Vercel Postgres**: Storage tab → create → it sets `DATABASE_URL` for you.

The string looks like:
```
postgres://USER:PASSWORD@HOST/DB?sslmode=require
```

## 2. Generate Web Push (VAPID) keys
```bash
cd nextjs
npm install
npm run genkeys      # prints VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / NEXT_PUBLIC_VAPID_PUBLIC_KEY
```

## 3. Push this repo to GitHub
Commit the project (the `nextjs/` folder is what gets deployed).

## 4. Import into Vercel
1. https://vercel.com/new → import your GitHub repo.
2. **Set “Root Directory” to `nextjs`.** ← important (the repo also contains the older Express version at the root).
3. Framework preset: **Next.js** (auto-detected). Leave build/output settings default.

## 5. Add Environment Variables (Vercel → Settings → Environment Variables)
| Variable | Required | Value |
|---|---|---|
| `DATABASE_URL` | ✅ | your Postgres connection string |
| `OPENAI_API_KEY` | optional | enables OpenAI AI diet plans |
| `OPENAI_MODEL` | optional | defaults to `gpt-4o-mini` |
| `VAPID_PUBLIC_KEY` | optional | from `npm run genkeys` |
| `VAPID_PRIVATE_KEY` | optional | from `npm run genkeys` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | optional | same as `VAPID_PUBLIC_KEY` (browser-exposed) |
| `VAPID_SUBJECT` | optional | `mailto:you@example.com` |
| `CRON_SECRET` | recommended | any long random string — secures the cron endpoint |

## 6. Deploy
Click **Deploy**. Done — your app is live at `https://<project>.vercel.app`.

### CLI alternative
```bash
npm i -g vercel
cd nextjs
vercel            # first deploy (preview) — set Root Directory when prompted
vercel --prod     # production
```

---

## Reminders / Cron
`vercel.json` registers a cron that calls **`/api/cron/reminders`** to send push
reminders (pad-change, upcoming period, PCOD nudges):

```json
{ "crons": [ { "path": "/api/cron/reminders", "schedule": "* * * * *" } ] }
```

- On **Vercel Pro/Enterprise**, this runs every minute.
- On the **Hobby (free) plan, cron runs at most once per day** — fine for the
  "period is near" alert, but pad-change timing won't be minute-accurate. For
  minute-level reminders on Hobby, point an external scheduler (e.g.
  [cron-job.org](https://cron-job.org)) at
  `https://<your-app>/api/cron/reminders` every minute, sending the header
  `Authorization: Bearer <CRON_SECRET>`.
- When `CRON_SECRET` is set, Vercel automatically sends that header; the endpoint
  rejects unauthenticated calls.

## Local development
No Postgres needed locally — with `DATABASE_URL` unset the app uses an **embedded
Postgres (PGlite)** persisted to `./data/pgdata`, and an in-process scheduler runs
reminders every 60s. Set `DATABASE_URL` locally to test against real Postgres.

```bash
cd nextjs && npm install && npm run dev    # http://localhost:3001
```

## Notes & limits
- Use a **pooled** connection string (Neon/Supabase pooler) — serverless functions
  open many short-lived connections.
- Vercel functions are stateless; all persistence is in Postgres.
- Educational guidance only — not a medical device.
