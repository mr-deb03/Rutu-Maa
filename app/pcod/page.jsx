'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AppProviders';
import { Header } from '@/components/ui';
import { RM_CONTENT } from '@/lib/content';

export default function PcodPage() {
  const { user } = useAuth();
  const P = RM_CONTENT.pcod;
  const [checked, setChecked] = useState([]);

  function toggle(i) { setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i])); }
  const n = checked.length;
  let result = null;
  if (n > 0) {
    let msg, tone;
    if (n <= 1) { msg = 'A couple of these can be normal. Keep tracking your cycle and revisit if things change.'; tone = 'mint'; }
    else if (n <= 3) { msg = 'A few signs match. Consider noting your symptoms and discussing them with a gynaecologist.'; tone = 'warn'; }
    else { msg = 'Several signs match. It\'s a good idea to consult a gynaecologist for a proper check-up.'; tone = 'warn'; }
    result = <><div className={'badge badge--' + tone}>{n} selected</div><p style={{ marginTop: 8, color: 'var(--ink)' }}>{msg} <b>This is not a diagnosis.</b></p></>;
  }

  return (
    <>
      <Header title="PCOD Corner 💗" sub="Understand PCOD/PCOS, manage it with confidence, and care for your body and hygiene." />
      {user && user.pcod && (
        <><div className="notice" style={{ background: '#f3ecff', borderColor: '#e0d2ff', color: '#6b3fa0' }}>💗 <b>This corner is tuned for you.</b> Your diet plans already follow PCOD-friendly, low-GI guidance. Visit <Link href="/diet">Diet AI</Link> for today&apos;s plan.</div><div className="spacer" /></>
      )}
      <div className="grid grid-2">
        <div className="card"><h3>What is PCOD?</h3><p style={{ marginBottom: 10 }}>{P.what}</p><span className="badge badge--lav">{P.prevalence}</span></div>
        <div className="card"><h3>Common signs</h3><ul className="list">{P.symptoms.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
      </div>
      <div className="spacer" />
      <div className="card card--accent"><h3>Quick self-check</h3><p className="muted" style={{ marginBottom: 12 }}>{P.selfCheckIntro}</p>
        <div>{P.selfCheck.map((q, i) => (
          <label className="row-toggle" key={i} style={{ cursor: 'pointer' }}>
            <div><h4 style={{ fontWeight: 500 }}>{q}</h4></div>
            <input type="checkbox" checked={checked.includes(i)} onChange={() => toggle(i)} style={{ width: 20, height: 20, accentColor: '#c46bff' }} />
          </label>
        ))}</div>
        <div style={{ marginTop: 14 }}>{result}</div>
      </div>
      <div className="spacer" />
      <div className="grid grid-2">
        <div className="card"><h3>Daily care tips</h3><ul className="list list--tip">{P.careTips.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
        <div className="card"><h3>Hygiene with PCOD</h3><ul className="list">{P.hygieneTips.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
      </div>
      <div className="spacer" />
      <div className="grid grid-2">
        <div className="card"><h4 style={{ color: 'var(--ok)', margin: '0 0 8px' }}>Eat more 💚</h4><ul className="list list--check">{P.eatMore.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
        <div className="card"><h4 style={{ color: 'var(--danger)', margin: '0 0 8px' }}>Limit</h4><ul className="list list--cross">{P.eatLess.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
      </div>
      <div className="spacer" />
      <div className="notice">🩺 <b>When to see a doctor:</b> {P.whenDoctor}</div>
      {!user && (
        <><div className="spacer" /><div className="card center lock-card"><h3>Get a PCOD-friendly diet plan</h3><p className="muted" style={{ margin: '8px 0 16px' }}>Register to receive AI meal plans tuned to PCOD and your body.</p><Link href="/auth" className="btn">Create free account</Link></div></>
      )}
    </>
  );
}
