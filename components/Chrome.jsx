'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from './AppProviders';

const TOP = [
  ['dashboard', 'Dashboard'], ['tracker', 'Cycle'], ['diet', 'Diet AI'],
  ['pcod', 'PCOD Corner'], ['hygiene', 'Hygiene'], ['reminders', 'Reminders']
];
const BOTTOM = [
  ['dashboard', '🏠', 'Home'], ['tracker', '🩸', 'Cycle'], ['diet', '🥗', 'Diet'],
  ['pcod', '💗', 'PCOD'], ['reminders', '🔔', 'Alerts']
];

export default function Chrome({ children }) {
  const { user, toast } = useAuth();
  const path = usePathname();
  const active = (r) => path === '/' + r;
  const [deferred, setDeferred] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setDeferred(e); if (!sessionStorage.getItem('rm_dismiss')) setShowBanner(true); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => { setShowBanner(false); toast('Rutu-Maa installed! 🌸', 'ok'); });
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, [toast]);

  async function install() {
    if (!deferred) { toast('Open your browser menu → “Add to Home screen / Install app”.', 'info'); return; }
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null); setShowBanner(false);
  }

  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand"><span className="brand__mark">🌸</span><span className="brand__name">Rutu<span>-Maa</span></span></Link>
        <nav className="topnav" aria-label="Primary">
          {TOP.map(([r, label]) => (
            <Link key={r} href={'/' + r} className={'topnav__link' + (active(r) ? ' active' : '')}>{label}</Link>
          ))}
        </nav>
        <div className="topbar__right">
          {user
            ? <Link href="/profile" className="chip">{(user.name || 'Me').split(' ')[0]}</Link>
            : <Link href="/auth" className="chip">Login</Link>}
        </div>
      </header>

      <main id="view" className="view">{children}</main>

      <nav className="bottomnav" aria-label="Mobile">
        {BOTTOM.map(([r, icon, label]) => (
          <Link key={r} href={'/' + r} className={'bottomnav__item' + (active(r) ? ' active' : '')}><span>{icon}</span><i>{label}</i></Link>
        ))}
      </nav>

      {showBanner && (
        <div className="install-banner">
          <span className="install-banner__text">📲 Install <b>Rutu-Maa</b> as an app for the full experience</span>
          <div className="install-banner__actions">
            <button className="btn btn--small" onClick={install}>Install</button>
            <button className="btn-ghost btn-ghost--small" aria-label="Dismiss" onClick={() => { setShowBanner(false); sessionStorage.setItem('rm_dismiss', '1'); }}>✕</button>
          </div>
        </div>
      )}
    </>
  );
}
