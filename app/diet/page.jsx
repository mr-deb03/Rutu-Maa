'use client';
import { useState } from 'react';
import { useAuth } from '@/components/AppProviders';
import { Header, LockScreen, PlanCard, fmtNum } from '@/components/ui';
import { computeCycle, generateDiet, iso, today } from '@/lib/engine';

export default function DietPage() {
  const { user, ready, config, generateDiet: apiGenerate, saveDiet, toast } = useAuth();
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(null);

  if (!ready) return <div className="empty"><span className="big">🌸</span>Loading…</div>;
  if (!user) return <LockScreen body="Register or log in to get AI dietary plans tuned to your body." />;

  const cy = computeCycle(user);
  const todays = (user.dietPlans || []).find((p) => p.plan?.date === iso(today()));
  const shown = selected || (todays ? todays.plan : null);

  async function onGenerate() {
    setBusy(true);
    let plan = null;
    if (config.aiEnabled) {
      try { const r = await apiGenerate(); if (r && r.ok && r.plan) plan = r.plan; } catch (e) {}
    }
    if (!plan) {
      plan = generateDiet(user, cy);
      try { await saveDiet(plan); } catch (e) {}
      toast(config.aiEnabled ? 'Used the on-device engine (AI unavailable) 🌸' : 'Fresh plan generated for you ✨', 'ok');
    } else {
      toast('Fresh AI plan generated ✨', 'ok');
    }
    setSelected(plan);
    setBusy(false);
  }

  return (
    <>
      <Header title="AI dietary plan" sub="A nourishing day built from your weight, flow and PCOD needs. Different body → different plan." />
      <div className="card card--accent" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="eyebrow">Your profile signals</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              <span className={'badge ' + (user.pcod ? 'badge--lav' : 'badge--pink')}>{user.pcod ? '💗 PCOD-focused' : '🌸 General'}</span>
              <span className={'badge ' + (user.flow === 'excess' ? 'badge--warn' : 'badge--pink')}>{user.flow === 'excess' ? '🩸🩸 Heavy flow' : '🩸 Normal flow'}</span>
              {cy.inPeriod ? <span className="badge badge--warn">On period</span> : null}
              {user.weightKg ? <span className="badge badge--mint">{user.weightKg} kg</span> : null}
              <span className={'badge ' + (config.aiEnabled ? 'badge--lav' : 'badge--pink')}>{config.aiEnabled ? '✨ AI · ' + config.model : 'On-device engine'}</span>
            </div>
          </div>
          <button className="btn" onClick={onGenerate} disabled={busy}>✨ {busy ? 'Building…' : (shown ? 'Regenerate plan' : "Generate today's plan")}</button>
        </div>
      </div>

      {shown ? <PlanCard plan={shown} /> : <div className="card empty"><span className="big">🥗</span>Tap <b>Generate today&apos;s plan</b> to get your personalised meals.</div>}

      <div className="spacer" />
      <div className="card"><h3>Plan history</h3>
        {(!user.dietPlans || !user.dietPlans.length)
          ? <div className="empty">No saved plans yet.</div>
          : <div className="hist">{user.dietPlans.map((e, i) => (
            <div className="hist__row" key={i}>
              <b>{e.plan?.date}</b> <span className="badge badge--pink">{e.plan?.profileType}</span>
              <span>~{fmtNum(e.plan?.calories)} kcal <button className="btn-ghost" onClick={() => setSelected(e.plan)}>View</button></span>
            </div>
          ))}</div>}
      </div>
    </>
  );
}
