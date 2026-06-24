import { NextResponse } from 'next/server';
import { run } from '@/lib/db';
import { COOKIE, currentToken } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const token = await currentToken();
  if (token) await run('DELETE FROM sessions WHERE token=$1', [token]);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
