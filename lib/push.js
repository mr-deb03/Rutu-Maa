/* =========================================================
   Rutu-Maa — Web Push (VAPID) helper (Postgres)
   ========================================================= */
import webpush from 'web-push';
import { all, run } from './db';

let enabled = false;
const PUBLIC = process.env.VAPID_PUBLIC_KEY;
const PRIVATE = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@rutu-maa.app';

if (PUBLIC && PRIVATE) {
  try { webpush.setVapidDetails(SUBJECT, PUBLIC, PRIVATE); enabled = true; }
  catch (e) { console.warn('[push] invalid VAPID keys:', e.message); }
}

export function pushEnabled() { return enabled; }
export function publicKey() { return enabled ? PUBLIC : (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null); }

export async function saveSubscription(userId, sub) {
  if (!sub || !sub.endpoint) return;
  await run(
    'INSERT INTO push_subs (user_id, endpoint, sub) VALUES ($1,$2,$3) ON CONFLICT (user_id, endpoint) DO UPDATE SET sub=EXCLUDED.sub',
    [userId, sub.endpoint, JSON.stringify(sub)]
  );
}

export async function sendToUser(userId, payload) {
  if (!enabled) return;
  const rows = await all('SELECT id, sub FROM push_subs WHERE user_id=$1', [userId]);
  for (const row of rows) {
    try { await webpush.sendNotification(JSON.parse(row.sub), JSON.stringify(payload)); }
    catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) await run('DELETE FROM push_subs WHERE id=$1', [row.id]);
    }
  }
}
