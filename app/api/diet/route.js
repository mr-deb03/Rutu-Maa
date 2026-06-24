import { NextResponse } from 'next/server';
import { one, run } from '@/lib/db';
import { serializeUser } from '@/lib/auth';
import { currentUserRow } from '@/lib/session';
import { computeCycle } from '@/lib/cycle';
import { generateDietPlan, hasKey } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const row = await currentUserRow();
  if (!row) return NextResponse.json({ ok: false, error: 'Not logged in.' }, { status: 401 });
  const user = await serializeUser(row);
  const cycle = computeCycle(user);
  try {
    const plan = await generateDietPlan(user, cycle);
    await run('INSERT INTO diet_plans (user_id, created_at, plan) VALUES ($1,$2,$3)', [row.id, new Date().toISOString(), JSON.stringify(plan)]);
    return NextResponse.json({ ok: true, plan, source: 'ai', user: await serializeUser(await one('SELECT * FROM users WHERE id=$1', [row.id])) });
  } catch (err) {
    console.warn('[diet] AI failed:', err.message);
    return NextResponse.json({ ok: false, fallback: true, reason: hasKey() ? 'ai_error' : 'no_key' });
  }
}
