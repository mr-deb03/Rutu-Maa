'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AppProviders';
import { Header, LockScreen } from '@/components/ui';

export default function ProfilePage() {
  const { user, ready, updateProfile, logout, toast } = useAuth();
  const router = useRouter();

  if (!ready) return <div className="empty"><span className="big">🌸</span>Loading…</div>;
  if (!user) return <LockScreen body="Register or log in to manage your profile." />;

  async function onSave(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    d.pcod = d.pcod === 'yes';
    try { await updateProfile(d); toast('Profile updated 🌸', 'ok'); router.push('/dashboard'); }
    catch (err) { toast(err.message || 'Could not save.', 'warn'); }
  }
  async function onLogout() { await logout(); toast('Logged out. Take care! 🌸', 'info'); router.push('/'); }

  return (
    <>
      <Header title="My profile" sub="Update your details so your plans and reminders stay accurate." />
      <div className="card">
        <form className="form" onSubmit={onSave}>
          <div className="field"><label>Name</label><input name="name" defaultValue={user.name} /></div>
          <div className="form-grid">
            <div className="field"><label>Age</label><input name="age" type="number" defaultValue={user.age || ''} /></div>
            <div className="field"><label>Activity</label><select name="activity" defaultValue={user.activity}>{['sedentary', 'light', 'moderate', 'active'].map((a) => <option key={a} value={a}>{a}</option>)}</select></div>
          </div>
          <div className="form-grid">
            <div className="field"><label>Height (cm)</label><input name="heightCm" type="number" defaultValue={user.heightCm || ''} /></div>
            <div className="field"><label>Weight (kg)</label><input name="weightKg" type="number" defaultValue={user.weightKg || ''} /></div>
          </div>
          <div className="form-grid">
            <div className="field"><label>Avg cycle (days)</label><input name="avgCycleLength" type="number" defaultValue={user.avgCycleLength} /></div>
            <div className="field"><label>Period length (days)</label><input name="avgPeriodLength" type="number" defaultValue={user.avgPeriodLength} /></div>
          </div>
          <div className="field"><label>Typical flow</label>
            <div className="seg">
              <input type="radio" name="flow" id="pf-n" value="normal" defaultChecked={user.flow !== 'excess'} /><label htmlFor="pf-n">🩸 Normal</label>
              <input type="radio" name="flow" id="pf-e" value="excess" defaultChecked={user.flow === 'excess'} /><label htmlFor="pf-e">🩸🩸 Heavy</label>
            </div>
          </div>
          <div className="field"><label>PCOD / PCOS</label>
            <div className="seg">
              <input type="radio" name="pcod" id="pp-no" value="no" defaultChecked={!user.pcod} /><label htmlFor="pp-no">No</label>
              <input type="radio" name="pcod" id="pp-yes" value="yes" defaultChecked={user.pcod} /><label htmlFor="pp-yes">Yes</label>
            </div>
          </div>
          <button className="btn" type="submit">Save changes</button>
        </form>
      </div>
      <div className="spacer" />
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div><b style={{ color: 'var(--plum)' }}>{user.email}</b><p className="muted" style={{ fontSize: 13, margin: '4px 0 0' }}>Member since {new Date(user.createdAt).toLocaleDateString()}</p></div>
        <button className="btn btn--ghost" onClick={onLogout}>Log out</button>
      </div>
    </>
  );
}
