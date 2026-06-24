import { NextResponse } from 'next/server';
import { one, run } from '@/lib/db';
import { serializeUser } from '@/lib/auth';
import { currentUserRow } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function refreshLastPeriod(userId) {
  const r = await one('SELECT start FROM periods WHERE user_id=$1 ORDER BY start DESC LIMIT 1', [userId]);
  await run('UPDATE users SET last_period=$1 WHERE id=$2', [r ? r.start : null, userId]);
}

export async function POST(req) {
  const row = await currentUserRow();
  if (!row) return NextResponse.json({ ok: false, error: 'Not logged in.' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.start) return NextResponse.json({ ok: false, error: 'start date required' }, { status: 400 });
  await run(
    'INSERT INTO periods (user_id, start, "end", flow) VALUES ($1,$2,$3,$4) ON CONFLICT (user_id, start) DO UPDATE SET "end"=EXCLUDED."end", flow=EXCLUDED.flow',
    [row.id, b.start, b.end || null, b.flow || row.flow]
  );
  await refreshLastPeriod(row.id);
  return NextResponse.json({ ok: true, user: await serializeUser(await one('SELECT * FROM users WHERE id=$1', [row.id])) });
}
