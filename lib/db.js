/* =========================================================
   Rutu-Maa — Postgres data layer (async).
   - Production / Vercel: real Postgres via `pg` using DATABASE_URL
     (Neon, Supabase, Vercel Postgres, Railway, local Postgres…).
   - Local dev with no DATABASE_URL: embedded Postgres via PGlite
     (zero setup, persisted to ./data/pgdata).
   Both expose the same query(text, $params) → { rows } API, so the
   identical SQL runs in either environment.
   ========================================================= */

const g = globalThis;

// Find the Postgres connection string. Prefer DATABASE_URL, but Vercel/Neon
// integrations may create a PREFIXED var (e.g. STORAGE_URL, POSTGRES_URL), so
// fall back to scanning env for a pooled postgres URL. This makes the app work
// regardless of the "Custom Prefix" chosen when connecting the database.
function connString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const entries = Object.entries(process.env);
  const isPg = (v) => typeof v === 'string' && /^postgres(ql)?:\/\//.test(v);
  // 1) a pooled "*_URL" var (skip unpooled / prisma / no-ssl variants)
  for (const [k, v] of entries) {
    if (isPg(v) && /_URL$/.test(k) && !/(UNPOOLED|NON_POOLING|NO_SSL|PRISMA)/.test(k)) return v;
  }
  // 2) any postgres URL as a last resort
  for (const [, v] of entries) if (isPg(v)) return v;
  return '';
}

async function createClient() {
  const cs = connString();
  if (cs) {
    const { Pool } = await import('pg');
    const needsSsl = !/localhost|127\.0\.0\.1/.test(cs) && !/sslmode=disable/.test(cs);
    const pool = new Pool({ connectionString: cs, ssl: needsSsl ? { rejectUnauthorized: false } : false, max: 5 });
    return { kind: 'pg', query: (t, p) => pool.query(t, p) };
  }
  const { PGlite } = await import(/* webpackIgnore: true */ '@electric-sql/pglite');
  const fs = await import('node:fs');
  const path = await import('node:path');
  const dir = path.join(process.cwd(), 'data');
  fs.mkdirSync(dir, { recursive: true });
  const db = new PGlite(path.join(dir, 'pgdata'));
  return { kind: 'pglite', query: (t, p) => db.query(t, p) };
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL, pass_hash TEXT NOT NULL, pass_salt TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Friend', age INTEGER, height_cm REAL, weight_kg REAL,
    avg_cycle INTEGER NOT NULL DEFAULT 28, avg_period INTEGER NOT NULL DEFAULT 5,
    flow TEXT NOT NULL DEFAULT 'normal', pcod BOOLEAN NOT NULL DEFAULT FALSE,
    activity TEXT NOT NULL DEFAULT 'light', last_period TEXT,
    reminders TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS periods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start TEXT NOT NULL, "end" TEXT, flow TEXT NOT NULL DEFAULT 'normal',
    UNIQUE(user_id, start)
  )`,
  `CREATE TABLE IF NOT EXISTS diet_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL, plan TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS push_subs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL, sub TEXT NOT NULL, UNIQUE(user_id, endpoint)
  )`,
  `CREATE TABLE IF NOT EXISTS notify_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day TEXT NOT NULL, kind TEXT NOT NULL, UNIQUE(user_id, day, kind)
  )`
];

async function init() {
  const client = await createClient();
  for (const stmt of SCHEMA) await client.query(stmt);
  return client;
}

// memoized client + schema (survives dev hot-reload and warm serverless invocations)
function ready() {
  if (!g.__rmReady) g.__rmReady = init();
  return g.__rmReady;
}

export async function query(text, params) {
  const client = await ready();
  return client.query(text, params || []);
}
export async function one(text, params) { return (await query(text, params)).rows[0] ?? null; }
export async function all(text, params) { return (await query(text, params)).rows; }
export async function run(text, params) { await query(text, params); }
