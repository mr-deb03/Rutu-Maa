import { NextResponse } from 'next/server';
import { sendToUser } from '@/lib/push';
import { currentUserRow } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const row = await currentUserRow();
  if (!row) return NextResponse.json({ ok: false, error: 'Not logged in.' }, { status: 401 });
  await sendToUser(row.id, { title: 'Rutu-Maa 🌸', body: 'Push reminders are working — you\'re all set!', route: 'reminders' });
  return NextResponse.json({ ok: true });
}
