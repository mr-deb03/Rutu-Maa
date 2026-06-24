import { NextResponse } from 'next/server';
import { one, run } from '@/lib/db';
import { verifyPassword, newToken, serializeUser } from '@/lib/auth';
import { COOKIE, COOKIE_OPTS } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const email = String(b.email || '').trim().toLowerCase();
  const row = await one('SELECT * FROM users WHERE email=$1', [email]);
  if (!row) return NextResponse.json({ ok: false, error: 'No account found for this email.' }, { status: 404 });
  if (!verifyPassword(b.password || '', row.pass_salt, row.pass_hash)) {
    return NextResponse.json({ ok: false, error: 'Incorrect password.' }, { status: 401 });
  }
  const token = newToken();
  await run('INSERT INTO sessions (token, user_id, created_at) VALUES ($1,$2,$3)', [token, row.id, new Date().toISOString()]);
  const res = NextResponse.json({ ok: true, user: await serializeUser(row) });
  res.cookies.set(COOKIE, token, COOKIE_OPTS);
  return res;
}
