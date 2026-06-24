import { NextResponse } from 'next/server';
import { one, run } from '@/lib/db';
import { serializeUser, defaultReminders } from '@/lib/auth';
import { currentUserRow } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const row = await currentUserRow();
  if (!row) return NextResponse.json({ ok: false, error: 'Not logged in.' }, { status: 401 });
  return NextResponse.json({ ok: true, user: await serializeUser(row) });
}

export async function PUT(req) {
  const cur = await currentUserRow();
  if (!cur) return NextResponse.json({ ok: false, error: 'Not logged in.' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const flow = (b.flow === 'excess' || b.flow === 'normal') ? b.flow : cur.flow;
  await run(
    `UPDATE users SET name=$1, age=$2, height_cm=$3, weight_kg=$4, avg_cycle=$5, avg_period=$6, flow=$7, pcod=$8, activity=$9 WHERE id=$10`,
    [
      b.name != null ? String(b.name).slice(0, 60) : cur.name,
      b.age != null ? (Number(b.age) || null) : cur.age,
      b.heightCm != null ? (Number(b.heightCm) || null) : cur.height_cm,
      b.weightKg != null ? (Number(b.weightKg) || null) : cur.weight_kg,
      b.avgCycleLength != null ? (Number(b.avgCycleLength) || 28) : cur.avg_cycle,
      b.avgPeriodLength != null ? (Number(b.avgPeriodLength) || 5) : cur.avg_period,
      flow, b.pcod != null ? !!b.pcod : cur.pcod, b.activity || cur.activity, cur.id
    ]
  );
  const fresh = await one('SELECT * FROM users WHERE id=$1', [cur.id]);
  let rem = {}; try { rem = JSON.parse(fresh.reminders) || {}; } catch (e) {}
  rem = Object.assign(defaultReminders(fresh.flow), rem);
  if (b.flow && !rem.padManual) { rem.padIntervalHrs = flow === 'excess' ? 2 : 3; await run('UPDATE users SET reminders=$1 WHERE id=$2', [JSON.stringify(rem), cur.id]); }
  return NextResponse.json({ ok: true, user: await serializeUser(await one('SELECT * FROM users WHERE id=$1', [cur.id])) });
}
