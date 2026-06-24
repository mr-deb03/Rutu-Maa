import { NextResponse } from 'next/server';
import { one, run } from '@/lib/db';
import { serializeUser } from '@/lib/auth';
import { currentUserRow } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const row = await currentUserRow();
  if (!row) return NextResponse.json({ ok: false, error: 'Not logged in.' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.plan) return NextResponse.json({ ok: false, error: 'plan required' }, { status: 400 });
  await run('INSERT INTO diet_plans (user_id, created_at, plan) VALUES ($1,$2,$3)', [row.id, new Date().toISOString(), JSON.stringify(b.plan)]);
  return NextResponse.json({ ok: true, user: await serializeUser(await one('SELECT * FROM users WHERE id=$1', [row.id])) });
}
