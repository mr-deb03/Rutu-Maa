import { NextResponse } from 'next/server';
import { saveSubscription } from '@/lib/push';
import { currentUserRow } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const row = await currentUserRow();
  if (!row) return NextResponse.json({ ok: false, error: 'Not logged in.' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  await saveSubscription(row.id, b.subscription);
  return NextResponse.json({ ok: true });
}
