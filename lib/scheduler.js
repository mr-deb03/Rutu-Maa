/* =========================================================
   Rutu-Maa — reminder logic (Postgres).
   runReminderTick() runs ONE pass and is used by both:
   - the local in-process scheduler (startLocalScheduler), and
   - the Vercel Cron endpoint (/api/cron/reminders).
   ========================================================= */
import { one, all, run } from './db';
import { serializeUser, defaultReminders } from './auth';
import { sendToUser, pushEnabled } from './push';
import { computeCycle, iso, today } from './cycle';

async function flagged(userId, day, kind) {
  return !!(await one('SELECT 1 FROM notify_log WHERE user_id=$1 AND day=$2 AND kind=$3', [userId, day, kind]));
}
async function setFlag(userId, day, kind) {
  await run('INSERT INTO notify_log (user_id, day, kind) VALUES ($1,$2,$3) ON CONFLICT (user_id, day, kind) DO NOTHING', [userId, day, kind]);
}
function remOf(row) {
  let r = {}; try { r = JSON.parse(row.reminders) || {}; } catch (e) {}
  return Object.assign(defaultReminders(row.flow), r);
}

export async function runReminderTick() {
  if (!pushEnabled()) return { ok: true, push: 'off', sent: 0 };
  const day = iso(today());
  let sent = 0;
  const rows = await all('SELECT * FROM users WHERE id IN (SELECT DISTINCT user_id FROM push_subs)');
  for (const row of rows) {
    const rem = remOf(row);
    if (!rem.enabled) continue;
    const user = await serializeUser(row);
    const cy = computeCycle(user);
    if (cy.needsSetup) continue;

    if (rem.nextPeriodReminder && cy.daysUntil === (rem.nextPeriodLeadDays || 2) && !(await flagged(row.id, day, 'nextPeriod'))) {
      await sendToUser(row.id, { title: 'Your period is near 🌸', body: `Expected in ${cy.daysUntil} days. Keep your essentials kit (pads, spare underwear, wipes) in your bag.`, route: 'reminders' });
      await setFlag(row.id, day, 'nextPeriod'); sent++;
    }
    if (cy.inPeriod && cy.cycleDay === 1 && !(await flagged(row.id, day, 'periodStart'))) {
      await sendToUser(row.id, { title: 'Period started 🩸', body: `Pad-change reminders are now active every ${rem.padIntervalHrs} hours.`, route: 'reminders' });
      await setFlag(row.id, day, 'periodStart'); sent++;
    }
    if (cy.inPeriod) {
      const last = rem.lastPadChange ? new Date(rem.lastPadChange).getTime() : 0;
      if (Date.now() >= last + (rem.padIntervalHrs || 3) * 3600000) {
        await sendToUser(row.id, { title: 'Time to change your pad 🌸', body: `It's been about ${rem.padIntervalHrs} hours. Change your pad, wash hands and stay fresh.`, route: 'reminders' });
        rem.lastPadChange = new Date().toISOString();
        await run('UPDATE users SET reminders=$1 WHERE id=$2', [JSON.stringify(rem), row.id]); sent++;
      }
    }
    if (user.pcod && rem.pcodCare && new Date().getHours() === 20 && !(await flagged(row.id, day, 'pcodCare'))) {
      await sendToUser(row.id, { title: 'PCOD self-care 💗', body: 'Keep the area dry, change underwear, and a short walk after dinner helps insulin balance.', route: 'pcod' });
      await setFlag(row.id, day, 'pcodCare'); sent++;
    }
  }
  return { ok: true, push: 'on', sent };
}

export function startLocalScheduler() {
  const g = globalThis;
  if (g.__rutumaaScheduler) return;
  g.__rutumaaScheduler = setInterval(() => { runReminderTick().catch((e) => console.warn('[scheduler]', e.message)); }, 60000);
  console.log('[rutu-maa] local push scheduler started (60s); push ' + (pushEnabled() ? 'ENABLED' : 'OFF — set VAPID keys'));
}
