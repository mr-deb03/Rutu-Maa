import { NextResponse } from 'next/server';
import { run } from '@/lib/db';
import { defaultReminders } from '@/lib/auth';
import { currentUserRow } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const row = await currentUserRow();
  if (!row) return NextResponse.json({ ok: false, error: 'Not logged in.' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  let rem = {}; try { rem = JSON.parse(row.reminders) || {}; } catch (e) {}
  rem = Object.assign(defaultReminders(row.flow), rem, b);
  await run('UPDATE users SET reminders=$1 WHERE id=$2', [JSON.stringify(rem), row.id]);
  return NextResponse.json({ ok: true, reminders: rem });
}
