/* =========================================================
   Rutu-Maa (Next.js) — session cookie helpers for Route Handlers
   ========================================================= */
import { cookies } from 'next/headers';
import { userRowByToken } from './auth';

export const COOKIE = 'rm_token';
export const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 180 // 180 days
};

/* Resolve the logged-in user row from the request cookie (route handlers). */
export async function currentUserRow() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  return userRowByToken(token);
}

export async function currentToken() {
  const store = await cookies();
  return store.get(COOKIE)?.value || null;
}
