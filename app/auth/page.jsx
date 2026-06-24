'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AppProviders';

export default function AuthPage() {
  const { register, login, subscribePush, toast } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('register');
  const [busy, setBusy] = useState(false);

  async function onRegister(e) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.target);
    const d = Object.fromEntries(f.entries());
    d.pcod = d.pcod === 'yes';
    try {
      const u = await register(d);
      toast('Welcome to Rutu-Maa, ' + u.name + '! 🌸', 'ok');
      router.push('/dashboard');
    } catch (err) { setBusy(false); toast(err.message || 'Could not register.', 'warn'); }
  }
  async function onLogin(e) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.target);
    try {
      const u = await login(f.get('email'), f.get('password'));
      toast('Welcome back, ' + u.name.split(' ')[0] + '! 🌸', 'ok');
      router.push('/dashboard');
    } catch (err) { setBusy(false); toast(err.message || 'Could not log in.', 'warn'); }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="auth-wrap">
      <div className="center"><div className="eyebrow">Welcome 🌸</div><h2 className="section-title">Join Rutu-Maa</h2></div>
      <div className="card">
        <div className="tabs">
          <button className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')}>Register</button>
          <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>Login</button>
        </div>

        {tab === 'register' ? (
          <form className="form" onSubmit={onRegister}>
            <div className="field"><label>Your name</label><input name="name" placeholder="e.g. Rutu" required /></div>
            <div className="form-grid">
              <div className="field"><label>Email</label><input name="email" type="email" placeholder="you@email.com" required /></div>
              <div className="field"><label>Password</label><input name="password" type="password" placeholder="min 4 characters" required /></div>
            </div>
            <div className="form-grid">
              <div className="field"><label>Age</label><input name="age" type="number" min="9" max="60" placeholder="years" /></div>
              <div className="field"><label>Activity level</label><select name="activity" defaultValue="light"><option value="sedentary">Mostly sitting</option><option value="light">Lightly active</option><option value="moderate">Moderately active</option><option value="active">Very active</option></select></div>
            </div>
            <div className="form-grid">
              <div className="field"><label>Height (cm)</label><input name="heightCm" type="number" min="120" max="210" placeholder="e.g. 160" /></div>
              <div className="field"><label>Weight (kg)</label><input name="weightKg" type="number" min="25" max="180" placeholder="e.g. 55" /></div>
            </div>
            <div className="form-grid">
              <div className="field"><label>Avg cycle length (days)</label><input name="avgCycleLength" type="number" min="20" max="45" defaultValue="28" /></div>
              <div className="field"><label>Period length (days)</label><input name="avgPeriodLength" type="number" min="2" max="10" defaultValue="5" /></div>
            </div>
            <div className="field"><label>Last period start date</label><input name="lastPeriodStart" type="date" max={today} /></div>
            <div className="field"><label>Typical flow</label>
              <div className="seg">
                <input type="radio" name="flow" id="f-normal" value="normal" defaultChecked /><label htmlFor="f-normal">🩸 Normal</label>
                <input type="radio" name="flow" id="f-excess" value="excess" /><label htmlFor="f-excess">🩸🩸 Heavy / excess</label>
              </div>
              <span className="hint">Heavy flow → pad reminder every 2 hrs · Normal → every 3 hrs.</span>
            </div>
            <div className="field"><label>Do you have PCOD / PCOS?</label>
              <div className="seg">
                <input type="radio" name="pcod" id="p-no" value="no" defaultChecked /><label htmlFor="p-no">No</label>
                <input type="radio" name="pcod" id="p-yes" value="yes" /><label htmlFor="p-yes">Yes</label>
              </div>
            </div>
            <button className="btn btn--block" type="submit" disabled={busy}>Create my account 🌸</button>
          </form>
        ) : (
          <form className="form" onSubmit={onLogin}>
            <div className="field"><label>Email</label><input name="email" type="email" placeholder="you@email.com" required /></div>
            <div className="field"><label>Password</label><input name="password" type="password" placeholder="your password" required /></div>
            <button className="btn btn--block" type="submit" disabled={busy}>Log in</button>
          </form>
        )}
      </div>
      <p className="muted center" style={{ fontSize: 12.5, marginTop: 14 }}>🔒 Your account is stored on the server; passwords are hashed.</p>
    </div>
  );
}
