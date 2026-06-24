'use client';
import { useState } from 'react';
import { useAuth } from '@/components/AppProviders';
import { Header, LockScreen } from '@/components/ui';
import { computeCycle, iso, today, parse, addDays, diffDays, pretty } from '@/lib/engine';

function periodDateSet(user) {
  const set = new Set();
  (user.periods || []).forEach((p) => {
    const start = parse(p.start);
    const end = p.end ? parse(p.end) : addDays(start, (user.avgPeriodLength || 5) - 1);
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) set.add(iso(d));
  });
  return set;
}

export default function Tracker() {
  const { user, ready, addPeriod, removePeriod, updateProfile, toast } = useAuth();
  const t0 = today();
  const [cal, setCal] = useState({ y: t0.getFullYear(), m: t0.getMonth() });
  const [busy, setBusy] = useState(false);

  if (!ready) return <div className="empty"><span className="big">🌸</span>Loading…</div>;
  if (!user) return <LockScreen body="Register or log in to track your cycle." />;

  const cy = computeCycle(user);
  const periods = periodDateSet(user);
  const predicted = new Set(), fertile = new Set();
  let ovuIso = null;
  if (!cy.needsSetup) {
    for (let i = 0; i < (cy.periodLen || 5); i++) predicted.add(iso(addDays(cy.nextStart, i)));
    for (let d = new Date(cy.fertileStart); d <= cy.fertileEnd; d = addDays(d, 1)) fertile.add(iso(d));
    ovuIso = iso(cy.ovulation);
  }

  const { y, m } = cal;
  const monthTitle = new Date(y, m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const startDow = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const todayIso = iso(t0);
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(<div key={'b' + i} className="cal__cell muted" />);
  for (let day = 1; day <= daysInMonth; day++) {
    const di = iso(new Date(y, m, day));
    let cls = 'cal__cell';
    if (periods.has(di)) cls += ' period';
    else if (predicted.has(di)) cls += ' predicted';
    else if (ovuIso === di) cls += ' ovu';
    else if (fertile.has(di)) cls += ' fertile';
    if (di === todayIso) cls += ' today';
    cells.push(<div key={di} className={cls} title={di}>{day}</div>);
  }
  function move(d) { let mm = m + d, yy = y; if (mm < 0) { mm = 11; yy--; } if (mm > 11) { mm = 0; yy++; } setCal({ y: yy, m: mm }); }

  async function onLog(e) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.target);
    const d = Object.fromEntries(f.entries());
    if (d.end && d.end < d.start) { setBusy(false); return toast('End date can\'t be before start date.', 'warn'); }
    try {
      if (d.flow && d.flow !== user.flow) await updateProfile({ flow: d.flow });
      await addPeriod({ start: d.start, end: d.end || null, flow: d.flow });
      toast('Period logged 🌸 predictions updated.', 'ok');
    } catch (err) { toast(err.message || 'Could not save.', 'warn'); }
    setBusy(false);
  }
  async function onDelete(start) { try { await removePeriod(start); toast('Removed.', 'info'); } catch (e) { toast(e.message, 'warn'); } }

  const sub = (s) => pretty(parse(s)).replace(/^\w+,\s/, '');

  return (
    <>
      <Header title="Cycle tracker" sub="Log your periods and see your predictions." />
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button className="btn-ghost" onClick={() => move(-1)}>‹</button>
          <b style={{ color: 'var(--plum)', fontFamily: 'var(--display)', fontSize: 18 }}>{monthTitle}</b>
          <button className="btn-ghost" onClick={() => move(1)}>›</button>
        </div>
        <div className="cal">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="cal__dow">{d}</div>)}
          {cells}
        </div>
        <div className="legend">
          <span><i style={{ background: 'linear-gradient(135deg,#ff7eb3,#ff5e9a)' }} />Period</span>
          <span><i style={{ background: 'repeating-linear-gradient(45deg,#ffd0e0,#ffd0e0 4px,#fff 4px,#fff 8px)' }} />Predicted</span>
          <span><i style={{ background: '#efe6ff' }} />Ovulation</span>
          <span><i style={{ boxShadow: 'inset 0 0 0 2px #c46bff' }} />Fertile</span>
        </div>
      </div>

      {!cy.needsSetup && (
        <><div className="spacer" /><div className="grid grid-3">
          <div className="card"><b style={{ fontFamily: 'var(--display)', fontSize: 26, color: 'var(--plum)', display: 'block' }}>{cy.daysUntil} days</b><span className="muted" style={{ fontSize: 13 }}>until next period</span><div style={{ marginTop: 6 }}><small style={{ color: 'var(--pink-500)', fontWeight: 600 }}>{pretty(cy.nextStart)}</small></div></div>
          <div className="card"><b style={{ fontFamily: 'var(--display)', fontSize: 26, color: 'var(--plum)', display: 'block' }}>Day {cy.cycleDay}</b><span className="muted" style={{ fontSize: 13 }}>current cycle day</span><div style={{ marginTop: 6 }}><small style={{ color: 'var(--pink-500)', fontWeight: 600 }}>{cy.phase} phase</small></div></div>
          <div className="card"><b style={{ fontFamily: 'var(--display)', fontSize: 26, color: 'var(--plum)', display: 'block' }}>{sub(iso(cy.ovulation))}</b><span className="muted" style={{ fontSize: 13 }}>ovulation (est.)</span><div style={{ marginTop: 6 }}><small style={{ color: 'var(--pink-500)', fontWeight: 600 }}>fertile {sub(iso(cy.fertileStart))}–{sub(iso(cy.fertileEnd))}</small></div></div>
        </div></>
      )}

      <div className="spacer" />
      <div className="card">
        <h3>Log a period</h3>
        <form className="form" onSubmit={onLog}>
          <div className="form-grid">
            <div className="field"><label>Start date</label><input name="start" type="date" max={todayIso} defaultValue={todayIso} required /></div>
            <div className="field"><label>End date (optional)</label><input name="end" type="date" max={todayIso} /></div>
          </div>
          <div className="field"><label>Flow this period</label>
            <div className="seg">
              <input type="radio" name="flow" id="lf-n" value="normal" defaultChecked={user.flow !== 'excess'} /><label htmlFor="lf-n">🩸 Normal</label>
              <input type="radio" name="flow" id="lf-e" value="excess" defaultChecked={user.flow === 'excess'} /><label htmlFor="lf-e">🩸🩸 Heavy</label>
            </div>
          </div>
          <button className="btn" type="submit" disabled={busy}>Save period</button>
        </form>
      </div>

      <div className="spacer" />
      <div className="card"><h3>Period history</h3>
        {(!user.periods || !user.periods.length)
          ? <div className="empty"><span className="big">📅</span>No periods logged yet.</div>
          : <div className="hist">{user.periods.map((p, i) => {
            let len = '';
            if (i + 1 < user.periods.length) len = diffDays(parse(p.start), parse(user.periods[i + 1].start)) + '-day cycle';
            return (
              <div className="hist__row" key={p.start}>
                <b>{pretty(parse(p.start))}</b>{' '}
                <span className={'badge ' + (p.flow === 'excess' ? 'badge--warn' : 'badge--pink')}>{p.flow === 'excess' ? 'Heavy' : 'Normal'}</span>
                <span>{len} <button className="btn-ghost" title="Remove" onClick={() => onDelete(p.start)}>🗑</button></span>
              </div>
            );
          })}</div>}
      </div>
    </>
  );
}
