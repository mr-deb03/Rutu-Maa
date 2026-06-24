'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AppProviders';
import { Header, LockScreen } from '@/components/ui';
import { computeCycle } from '@/lib/engine';

function Toggle({ on, onClick, title, body }) {
  return (
    <div className="row-toggle">
      <div><h4>{title}</h4><p>{body}</p></div>
      <button className={'toggle' + (on ? ' on' : '')} aria-pressed={!!on} onClick={onClick} />
    </div>
  );
}

export default function RemindersPage() {
  const { user, ready, config, setReminders, markPadChanged, enableNotifications, subscribePush, testPush, toast } = useAuth();
  const [now, setNow] = useState(Date.now());
  const [perm, setPerm] = useState('default');

  useEffect(() => {
    if ('Notification' in window) setPerm(Notification.permission);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!ready) return <div className="empty"><span className="big">🌸</span>Loading…</div>;
  if (!user) return <LockScreen body="Register or log in to set up reminders." />;

  const r = user.reminders;
  const cy = computeCycle(user);
  const padMs = (r.padIntervalHrs || 3) * 3600000;
  const lastPad = r.lastPadChange ? new Date(r.lastPadChange).getTime() : Date.now();
  let left = Math.max(0, lastPad + padMs - now);
  const hh = String(Math.floor(left / 3600000)).padStart(2, '0');
  const mm = String(Math.floor((left % 3600000) / 60000)).padStart(2, '0');
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0');

  async function toggle(key) {
    const val = !r[key];
    if (key === 'enabled' && val) { const p = await enableNotifications(); setPerm('Notification' in window ? Notification.permission : 'unsupported'); }
    await setReminders({ [key]: val });
    toast('Saved.', 'ok');
  }
  async function setPad(h) { await setReminders({ padIntervalHrs: h, padManual: true }); toast('Pad reminder set to every ' + h + ' hours.', 'ok'); }
  async function changed() { await markPadChanged(); toast('Nice & fresh 🌸 timer reset.', 'ok'); }
  async function enable() { const p = await enableNotifications(); setPerm('Notification' in window ? Notification.permission : 'unsupported'); if (p === 'granted') toast('Notifications enabled 🔔', 'ok'); else if (p === 'denied') toast('Notifications are blocked in your browser settings.', 'warn'); }
  async function test() { const p = await enableNotifications(); if (p !== 'granted') return toast('Please enable notifications first.', 'warn'); if (config.pushEnabled) await testPush(); toast('Test sent — check your notifications.', 'ok'); }

  return (
    <>
      <Header title="Reminders & alarms 🔔" sub="Smart nudges so you're always prepared — pad changes, period alerts and your essentials kit." />
      {perm !== 'granted'
        ? <div className="notice" style={{ marginBottom: 18 }}>🔔 Notifications are <b>{perm}</b>. <button className="btn btn--small" style={{ marginLeft: 8 }} onClick={enable}>Enable notifications</button></div>
        : <div className="notice" style={{ background: '#e8f8f0', borderColor: '#bfe9d4', color: '#1d8f63', marginBottom: 18 }}>✅ Notifications are enabled on this device.{config.pushEnabled ? ' Background push is active.' : ' (Server push keys not set — alerts fire while the app is open.)'}</div>}

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div className="card center">
          <div className="eyebrow">Next pad change</div>
          {cy.inPeriod
            ? <><div className="countdown">{hh}:{mm}:{ss}</div><p className="muted" style={{ margin: '6px 0 14px' }}>Alarm every <b>{r.padIntervalHrs} hours</b> {user.flow === 'excess' ? '(heavy flow)' : '(normal flow)'}</p><button className="btn btn--soft" onClick={changed}>✅ I changed my pad</button></>
            : <><div className="countdown" style={{ fontSize: 26 }}>On period days</div><p className="muted" style={{ marginTop: 10 }}>Pad alarms run automatically while you&apos;re on your period. Next period in <b>{cy.needsSetup ? '—' : cy.daysUntil}</b> days.</p></>}
        </div>
        <div className="card">
          <h3>Pad-change interval</h3>
          <p className="muted" style={{ fontSize: 13.5, marginBottom: 12 }}>Auto-set from your flow. Heavy = every 2 hrs, normal = every 3 hrs. You can override:</p>
          <div className="seg">
            {[2, 3, 4].map((h) => (
              <span key={h}>
                <input type="radio" name="pad" id={'pad-' + h} checked={r.padIntervalHrs === h} onChange={() => setPad(h)} />
                <label htmlFor={'pad-' + h}>Every {h} hrs</label>
              </span>
            ))}
          </div>
          {user.pcod ? <div className="notice" style={{ marginTop: 14 }}>💗 PCOD care: even on lighter days, change every 3–4 hrs and keep the area dry.</div> : null}
        </div>
      </div>

      <div className="spacer" />
      <div className="card">
        <h3>Reminder settings</h3>
        <Toggle on={r.enabled} onClick={() => toggle('enabled')} title="All reminders" body="Master switch for every Rutu-Maa alert." />
        <Toggle on={r.nextPeriodReminder} onClick={() => toggle('nextPeriodReminder')} title="Upcoming period alert" body={'Notify me ' + (r.nextPeriodLeadDays || 2) + ' days before my period.'} />
        <Toggle on={r.carryKit} onClick={() => toggle('carryKit')} title="Carry essentials kit" body="Remind me to keep pads & a spare in my bag." />
        <Toggle on={r.pcodCare} onClick={() => toggle('pcodCare')} title="PCOD self-care nudge" body="A gentle daily hygiene & lifestyle reminder." />
      </div>

      <div className="spacer" />
      <div className="btn-row"><button className="btn btn--ghost" onClick={test}>🔔 Send a test notification</button></div>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 14 }}>ℹ️ Install Rutu-Maa to your home screen and keep notifications on. With server VAPID keys set, reminders are delivered by push even when the app is closed.</p>
    </>
  );
}
