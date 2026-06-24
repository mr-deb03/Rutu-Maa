import { NextResponse } from 'next/server';
import { runReminderTick } from '@/lib/scheduler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Called on a schedule by Vercel Cron (see vercel.json).
   When CRON_SECRET is set, Vercel sends "Authorization: Bearer <CRON_SECRET>"
   automatically; we reject anything else so the endpoint can't be abused. */
export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization') || '';
    if (auth !== 'Bearer ' + secret) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  try {
    const result = await runReminderTick();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
