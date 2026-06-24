'use client';
import Link from 'next/link';
import { useAuth } from '@/components/AppProviders';
import { Ring } from '@/components/ui';
import { RM_CONTENT } from '@/lib/content';

const FEATURES = [
  ['🩸', 'Cycle tracking', 'Log periods and get clear predictions for your next period, ovulation and fertile window.', '/tracker'],
  ['🥗', 'AI diet plans', 'Personalised meals from your weight, flow & PCOD status — different body, different plan.', '/diet'],
  ['💗', 'PCOD corner', 'Understand PCOD, manage it, and follow hygiene & lifestyle tips made for you.', '/pcod'],
  ['🔔', 'Smart reminders', 'Pad-change alarms every 2–3 hrs and a nudge to carry your essentials kit.', '/reminders'],
  ['🧼', 'Hygiene guide', 'Simple, science-based menstrual hygiene habits, product care and myth-busting.', '/hygiene'],
  ['📲', 'Installable PWA', 'Add it to your home screen. Works offline; your history syncs to your account.', '/dashboard']
];

export default function Home() {
  const { user } = useAuth();
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">Your cycle · your care</div>
          <h1 className="hero__title">Gentle, smart care for your <em>period</em> &amp; <em>hygiene</em>.</h1>
          <p className="hero__lead">Rutu-Maa tracks your cycle, sends pad-change &amp; “carry your kit” reminders, and builds an <b>AI dietary plan</b> tuned to your body, flow and PCOD needs — with a dedicated PCOD corner.</p>
          <div className="hero__cta">
            {user ? <Link href="/dashboard" className="btn">Open my dashboard →</Link>
                  : <Link href="/auth" className="btn">Get started — it&apos;s free</Link>}
            <Link href="/pcod" className="btn btn--ghost">💗 Explore PCOD corner</Link>
          </div>
          <div className="hero__stats">
            <div className="stat"><b>2–3h</b><span>smart pad reminders</span></div>
            <div className="stat"><b>AI</b><span>personalised diet</span></div>
            <div className="stat"><b>PCOD</b><span>dedicated corner</span></div>
          </div>
        </div>
        <div className="hero__art">
          <div className="phone-mock">
            <div className="pm-ring"><Ring day={3} total={28} phase="Menstrual" /></div>
            <div className="pm-card"><div className="pm-dot" /><div style={{ flex: 1 }}><div className="pm-pill w70" /><div style={{ height: 6 }} /><div className="pm-pill w50" /></div></div>
            <div className="pm-card"><div className="pm-dot" style={{ background: 'linear-gradient(135deg,#b8e6ff,#c46bff)' }} /><div style={{ flex: 1 }}><div className="pm-pill w90" /><div style={{ height: 6 }} /><div className="pm-pill w50" /></div></div>
          </div>
        </div>
      </section>

      <div className="spacer" />
      <div className="eyebrow">Everything in one calm place</div>
      <div className="grid grid-3">
        {FEATURES.map(([icon, title, body, href]) => (
          <Link key={title} href={href} className="card card--tilt" style={{ textDecoration: 'none' }}>
            <span className="card__icon">{icon}</span><h3>{title}</h3><p>{body}</p>
          </Link>
        ))}
      </div>

      <div className="spacer" />
      <div className="card card--accent">
        <div className="eyebrow">Loved by people like you</div>
        <div className="grid grid-3" style={{ marginTop: 10 }}>
          {RM_CONTENT.testimonials.map((t, i) => (
            <div key={i}><p style={{ color: 'var(--ink)', fontSize: 15, lineHeight: 1.5 }}>“{t.q}”</p><div className="muted" style={{ marginTop: 8, fontWeight: 600 }}>— {t.a}</div></div>
          ))}
        </div>
      </div>

      <div className="spacer" />
      <div className="card center lock-card">
        <h3 style={{ fontFamily: 'var(--display)', fontSize: 24 }}>Make it yours</h3>
        <p className="muted" style={{ maxWidth: '46ch', margin: '8px auto 18px' }}>Register once to unlock personalised tracking, AI diet plans, history and reminders.</p>
        {user ? <Link href="/dashboard" className="btn">Go to dashboard</Link> : <Link href="/auth" className="btn">Create my free account</Link>}
      </div>
    </>
  );
}
