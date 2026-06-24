'use client';
import Link from 'next/link';
import { useAuth } from '@/components/AppProviders';
import { Header, Ring, Tile, LockScreen } from '@/components/ui';
import { computeCycle, PHASE_NOTE, pretty, today } from '@/lib/engine';

export default function Dashboard() {
  const { user, ready } = useAuth();
  if (!ready) return <div className="empty"><span className="big">🌸</span>Loading…</div>;
  if (!user) return <LockScreen body="Register or log in to see your personalised dashboard." />;

  const cy = computeCycle(user);
  if (cy.needsSetup) {
    return (
      <>
        <Header title={'Hi ' + user.name.split(' ')[0] + ' 🌸'} sub="Let's set up your cycle to unlock predictions." />
        <div className="card lock-card"><span style={{ fontSize: 42 }}>📅</span><h3>Add your last period date</h3>
          <p className="muted" style={{ margin: '8px 0 16px' }}>We need one period date to start predicting.</p>
          <Link href="/tracker" className="btn">Log my period</Link></div>
      </>
    );
  }

  const note = PHASE_NOTE[cy.phase];
  const flowPill = user.flow === 'excess'
    ? <span className="flow-pill badge--warn">🩸🩸 Heavy flow</span>
    : <span className="flow-pill badge--pink">🩸 Normal flow</span>;

  return (
    <>
      <Header title={'Hi ' + user.name.split(' ')[0] + ' 🌸'} sub={pretty(today())} />
      <div className="grid" style={{ gridTemplateColumns: 'minmax(240px,300px) 1fr', alignItems: 'stretch' }}>
        <div className="card center">
          <div className="ring-wrap"><Ring day={cy.cycleDay} total={cy.cycleLen} phase={cy.phase} /></div>
          <div style={{ marginTop: 12 }}>{flowPill}{user.pcod ? <> <span className="flow-pill badge--lav">💗 PCOD</span></> : null}</div>
        </div>
        <div className="card card--accent">
          <div className="eyebrow">Today · {cy.phase}</div>
          <p style={{ color: 'var(--ink)', fontSize: 15.5, lineHeight: 1.55, marginBottom: 14 }}>{note}</p>
          <div className="tiles">
            <Tile big={cy.daysUntil} label="days to next period" small={pretty(cy.nextStart)} />
            <Tile big={'Day ' + cy.cycleDay} label="of your cycle" small={cy.cycleLen + '-day cycle'} />
            <Tile big={pretty(cy.ovulation).split(',')[0] || '—'} label="ovulation (est.)" small="fertile window open" />
          </div>
        </div>
      </div>

      <div className="spacer" />
      <div className="grid grid-3">
        <Link href="/diet" className="card card--tilt" style={{ textDecoration: 'none' }}><span className="card__icon">🥗</span><h3>Today&apos;s AI diet</h3><p>A plan tuned to your body &amp; flow.</p></Link>
        <Link href="/reminders" className="card card--tilt" style={{ textDecoration: 'none' }}><span className="card__icon">🔔</span><h3>Reminders</h3><p>{cy.inPeriod ? 'Pad alarm every ' + user.reminders.padIntervalHrs + ' hrs is active.' : 'Set pad & period reminders.'}</p></Link>
        <Link href={user.pcod ? '/pcod' : '/hygiene'} className="card card--tilt" style={{ textDecoration: 'none' }}><span className="card__icon">{user.pcod ? '💗' : '🧼'}</span><h3>{user.pcod ? 'My PCOD corner' : 'Hygiene tips'}</h3><p>{user.pcod ? 'Care, diet & hygiene for PCOD.' : 'Stay fresh & healthy.'}</p></Link>
      </div>

      {cy.daysUntil <= (user.reminders.nextPeriodLeadDays || 2) && (
        <><div className="spacer" /><div className="notice">🎒 <b>Your period is near ({cy.daysUntil} day{cy.daysUntil === 1 ? '' : 's'}).</b> Keep your essentials kit — pads, a spare underwear, wipes — in your bag.</div></>
      )}
      {cy.inPeriod && (
        <><div className="spacer" /><div className="notice">🩸 <b>You&apos;re on your period (day {cy.cycleDay}).</b> Change your pad every {user.reminders.padIntervalHrs} hours, wash hands and stay hydrated.</div></>
      )}
    </>
  );
}
