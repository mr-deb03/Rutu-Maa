import { NextResponse } from 'next/server';
import { one, run } from '@/lib/db';
import { hashPassword, newToken, defaultReminders, serializeUser } from '@/lib/auth';
import { COOKIE, COOKIE_OPTS } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const email = String(b.email || '').trim().toLowerCase();
  if (!/.+@.+\..+/.test(email)) return NextResponse.json({ ok: false, error: 'Please enter a valid email.' }, { status: 400 });
  if (!b.password || String(b.password).length < 4) return NextResponse.json({ ok: false, error: 'Password needs at least 4 characters.' }, { status: 400 });
  if (await one('SELECT id FROM users WHERE email=$1', [email])) {
    return NextResponse.json({ ok: false, error: 'An account with this email already exists. Try logging in.' }, { status: 409 });
  }
  const { salt, hash } = hashPassword(b.password);
  const flow = b.flow === 'excess' ? 'excess' : 'normal';
  const inserted = await one(
    `INSERT INTO users (email, pass_hash, pass_salt, name, age, height_cm, weight_kg, avg_cycle, avg_period, flow, pcod, activity, last_period, reminders, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
    [
      email, hash, salt, (b.name || 'Friend').toString().slice(0, 60),
      Number(b.age) || null, Number(b.heightCm) || null, Number(b.weightKg) || null,
      Number(b.avgCycleLength) || 28, Number(b.avgPeriodLength) || 5,
      flow, !!b.pcod, b.activity || 'light', b.lastPeriodStart || null,
      JSON.stringify(defaultReminders(flow)), new Date().toISOString()
    ]
  );
  const uid = inserted.id;
  if (b.lastPeriodStart) await run('INSERT INTO periods (user_id, start, flow) VALUES ($1,$2,$3) ON CONFLICT (user_id, start) DO NOTHING', [uid, b.lastPeriodStart, flow]);
  const token = newToken();
  await run('INSERT INTO sessions (token, user_id, created_at) VALUES ($1,$2,$3)', [token, uid, new Date().toISOString()]);
  const user = await serializeUser(await one('SELECT * FROM users WHERE id=$1', [uid]));
  const res = NextResponse.json({ ok: true, user });
  res.cookies.set(COOKIE, token, COOKIE_OPTS);
  return res;
}
