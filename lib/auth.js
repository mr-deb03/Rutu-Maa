/* =========================================================
   Rutu-Maa — auth helpers + user serialization (Postgres)
   ========================================================= */
import crypto from 'node:crypto';
import { one, all } from './db';

export function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return { salt, hash };
}
export function verifyPassword(password, salt, expectedHash) {
  const { hash } = hashPassword(password, salt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(expectedHash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
export function newToken() { return crypto.randomBytes(32).toString('hex'); }
export function defaultReminders(flow) {
  return {
    enabled: false, padIntervalHrs: flow === 'excess' ? 2 : 3, padManual: false,
    nextPeriodReminder: true, nextPeriodLeadDays: 2, carryKit: true, pcodCare: true, lastPadChange: null
  };
}

export async function serializeUser(row) {
  if (!row) return null;
  const periods = await all('SELECT start, "end" AS end, flow FROM periods WHERE user_id=$1 ORDER BY start DESC', [row.id]);
  const plans = (await all('SELECT created_at AS date, plan FROM diet_plans WHERE user_id=$1 ORDER BY id DESC LIMIT 30', [row.id]))
    .map((p) => ({ date: p.date, plan: JSON.parse(p.plan) }));
  let reminders = {};
  try { reminders = JSON.parse(row.reminders) || {}; } catch (e) {}
  return {
    id: row.id, email: row.email, name: row.name, age: row.age,
    heightCm: row.height_cm, weightKg: row.weight_kg,
    avgCycleLength: row.avg_cycle, avgPeriodLength: row.avg_period,
    flow: row.flow, pcod: !!row.pcod, activity: row.activity,
    lastPeriodStart: row.last_period, createdAt: row.created_at,
    reminders: Object.assign(defaultReminders(row.flow), reminders),
    periods, dietPlans: plans
  };
}

export async function userRowByToken(token) {
  if (!token) return null;
  const s = await one('SELECT user_id FROM sessions WHERE token=$1', [token]);
  if (!s) return null;
  return one('SELECT * FROM users WHERE id=$1', [s.user_id]);
}
