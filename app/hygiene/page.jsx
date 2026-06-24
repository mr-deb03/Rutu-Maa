'use client';
import { useAuth } from '@/components/AppProviders';
import { Header } from '@/components/ui';
import { RM_CONTENT } from '@/lib/content';

export default function HygienePage() {
  const { user, enableNotifications, setReminders, testPush, toast } = useAuth();
  const H = RM_CONTENT.hygiene;

  async function remindKit() {
    const perm = await enableNotifications();
    if (perm !== 'granted') return toast('Enable notifications in Reminders first.', 'warn');
    await setReminders({ enabled: true, carryKit: true });
    await testPush();
    toast('Reminder set 🌸 we\'ll nudge you to carry your kit.', 'ok');
  }

  return (
    <>
      <Header title="Menstrual hygiene 🧼" sub={H.intro} />
      <div className="grid grid-2">
        <div className="card"><h3>Core habits</h3><ul className="list list--check">{H.coreTips.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
        <div className="card"><h3>🎒 Essentials kit to carry</h3><ul className="list">{H.essentialsKit.map((t, i) => <li key={i}>{t}</li>)}</ul>
          {user ? <button className="btn btn--soft btn--small" style={{ marginTop: 12 }} onClick={remindKit}>🔔 Remind me to carry this</button> : null}
        </div>
      </div>
      <div className="spacer" />
      <div className="card"><h3>Product care</h3><div className="grid grid-2" style={{ marginTop: 8 }}>
        {H.productCare.map((p, i) => <div className="hist__row" key={i} style={{ alignItems: 'flex-start' }}><div><b>{p.p}</b><p className="muted" style={{ fontSize: 13.5, margin: '4px 0 0' }}>{p.t}</p></div></div>)}
      </div></div>
      <div className="spacer" />
      <div className="card card--accent"><h3>Myth busting</h3>
        {H.myths.map((x, i) => <div className="meal" key={i}><div className="meal__time" style={{ color: 'var(--danger)' }}>Myth</div><div className="meal__body"><h4>{x.m}</h4><p>✅ {x.t}</p></div></div>)}
      </div>
    </>
  );
}
