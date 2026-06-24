import { NextResponse } from 'next/server';
import { one, run } from '@/lib/db';
import { serializeUser } from '@/lib/auth';
import { currentUserRow } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req, { params }) {
  const row = await currentUserRow();
  if (!row) return NextResponse.json({ ok: false, error: 'Not logged in.' }, { status: 401 });
  const { start } = await params;
  await run('DELETE FROM periods WHERE user_id=$1 AND start=$2', [row.id, decodeURIComponent(start)]);
  const r = await one('SELECT start FROM periods WHERE user_id=$1 ORDER BY start DESC LIMIT 1', [row.id]);
  await run('UPDATE users SET last_period=$1 WHERE id=$2', [r ? r.start : null, row.id]);
  return NextResponse.json({ ok: true, user: await serializeUser(await one('SELECT * FROM users WHERE id=$1', [row.id])) });
}
