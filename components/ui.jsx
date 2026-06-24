import Link from 'next/link';

export function fmtNum(n) { return (n || 0).toLocaleString(); }

export function Header({ title, sub }) {
  return (
    <>
      <div className="eyebrow">Rutu-Maa</div>
      <h2 className="section-title">{title}</h2>
      {sub ? <p className="section-sub">{sub}</p> : null}
    </>
  );
}

export function Ring({ day, total, phase }) {
  const r = 92, c = 2 * Math.PI * r, pct = Math.max(0, Math.min(day / total, 1));
  return (
    <div className="ring">
      <svg width="220" height="220" viewBox="0 0 220 220">
        <circle cx="110" cy="110" r="92" fill="none" stroke="rgba(255,126,179,.16)" strokeWidth="16" />
        <circle cx="110" cy="110" r="92" fill="none" stroke="url(#rg)" strokeWidth="16" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
        <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff5e9a" /><stop offset="1" stopColor="#c46bff" /></linearGradient></defs>
      </svg>
      <div className="ring__center">
        <div className="ring__day">{day}</div>
        <div className="ring__label">day of cycle</div>
        <div className="ring__phase">{phase} phase</div>
      </div>
    </div>
  );
}

export function Tile({ big, label, small }) {
  return (
    <div className="tile">
      <b>{String(big)}</b><span>{label}</span><br /><small>{small}</small>
    </div>
  );
}

export function LockScreen({ title = 'This part is personalised', body }) {
  return (
    <div className="auth-wrap"><div className="card lock-card">
      <span style={{ fontSize: 46 }}>🔒</span>
      <h3 style={{ fontFamily: 'var(--display)', fontSize: 24, color: 'var(--plum)' }}>{title}</h3>
      <p className="muted" style={{ maxWidth: '42ch', margin: '8px auto 18px' }}>{body || 'Register or log in so Rutu-Maa can tailor this to your body, flow and PCOD needs.'}</p>
      <div className="btn-row" style={{ justifyContent: 'center' }}>
        <Link href="/auth" className="btn">Register / Login</Link>
      </div>
    </div></div>
  );
}

export function PlanCard({ plan }) {
  if (!plan) return null;
  const m = plan.macros || { protein: 0, carbs: 0, fat: 0 };
  return (
    <div className="card">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <div className="eyebrow">{plan.profileType} plan · {plan.date}{plan.source === 'ai' ? ' · ✨ AI' : ''}</div>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: 22, marginTop: 4 }}>~{fmtNum(plan.calories)} kcal · {plan.water} L water</h3>
        </div>
        {plan.bmi ? <span className={'badge badge--' + (plan.bmiBand?.tone || 'lav')}>BMI {plan.bmi} · {plan.bmiBand?.label}</span> : null}
      </div>
      <ul className="list list--tip" style={{ margin: '14px 0' }}>{(plan.focus || []).map((f, i) => <li key={i}>{f}</li>)}</ul>
      <div className="macro-bar">
        <i style={{ width: m.protein + '%', background: '#ff5e9a' }} />
        <i style={{ width: m.carbs + '%', background: '#c46bff' }} />
        <i style={{ width: m.fat + '%', background: '#b8e6ff' }} />
      </div>
      <div className="macro-legend">
        <span><i className="dot-c" style={{ background: '#ff5e9a' }} />Protein <b>{m.protein}%</b></span>
        <span><i className="dot-c" style={{ background: '#c46bff' }} />Carbs <b>{m.carbs}%</b></span>
        <span><i className="dot-c" style={{ background: '#b8e6ff' }} />Fat <b>{m.fat}%</b></span>
      </div>
      <hr className="divider" />
      <div>
        {(plan.meals || []).map((mm, i) => (
          <div className="meal" key={i}>
            <div className="meal__time">{mm.time}</div>
            <div className="meal__body"><h4>{mm.item?.name}</h4><p>{mm.item?.desc}</p></div>
          </div>
        ))}
      </div>
      <hr className="divider" />
      <div className="grid grid-2">
        <div><h4 style={{ color: 'var(--ok)', margin: '0 0 8px' }}>Eat more 💚</h4><ul className="list list--check">{(plan.eatMore || []).map((x, i) => <li key={i}>{x}</li>)}</ul></div>
        <div><h4 style={{ color: 'var(--danger)', margin: '0 0 8px' }}>Go easy on</h4><ul className="list list--cross">{(plan.eatLess || []).map((x, i) => <li key={i}>{x}</li>)}</ul></div>
      </div>
      <hr className="divider" />
      <div className="notice">💡 {(plan.supplements || []).join(' · ')}</div>
      <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>Educational guidance, not a substitute for professional medical or dietetic advice.</p>
    </div>
  );
}
