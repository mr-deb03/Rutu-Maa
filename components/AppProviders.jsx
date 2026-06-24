'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthCtx = createContext(null);
export function useAuth() { return useContext(AuthCtx); }
export function useToast() { return useContext(AuthCtx).toast; }

function urlB64(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const b64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function api(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  let data = {};
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) throw new Error(data.error || ('Request failed (' + res.status + ')'));
  return data;
}

export default function AppProviders({ children }) {
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState({ aiEnabled: false, pushEnabled: false, vapidPublicKey: null, model: null });
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  useEffect(() => {
    (async () => {
      try { setConfig(await api('GET', '/api/config')); } catch (e) {}
      try { const r = await fetch('/api/me'); if (r.ok) { const j = await r.json(); if (j.user) setUser(j.user); } } catch (e) {}
      setReady(true);
      if ('serviceWorker' in navigator) { try { await navigator.serviceWorker.register('/sw.js'); } catch (e) {} }
    })();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'navigate') window.location.assign('/' + (e.data.route || ''));
      });
    }
  }, []);

  async function subscribePush() {
    try {
      if (!config.pushEnabled || !config.vapidPublicKey) return false;
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64(config.vapidPublicKey) });
      await api('POST', '/api/push/subscribe', { subscription: sub.toJSON ? sub.toJSON() : sub });
      return true;
    } catch (e) { return false; }
  }

  async function enableNotifications() {
    if (!('Notification' in window)) return 'unsupported';
    let perm = Notification.permission;
    if (perm === 'default') { try { perm = await Notification.requestPermission(); } catch (e) { perm = 'denied'; } }
    if (perm === 'granted') { await subscribePush(); await actions.setReminders({ enabled: true }); }
    return perm;
  }

  // Fire a notification right now through the service worker — works even if
  // server push fails, as long as permission is granted and the OS allows it.
  async function notifyNow(title, body, route = 'reminders') {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') return false;
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, { body, icon: '/icon.svg', badge: '/icon.svg', tag: 'rutumaa-test', renotify: true, vibrate: [120, 60, 120], data: { route } });
        return true;
      }
      new Notification(title, { body, icon: '/icon.svg' });
      return true;
    } catch (e) { return false; }
  }

  // Report what's actually set up, for clear diagnostics.
  async function pushStatus() {
    const out = { permission: ('Notification' in window) ? Notification.permission : 'unsupported', sw: false, subscribed: false, serverPush: !!config.pushEnabled };
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        out.sw = !!reg;
        if (reg && reg.pushManager) out.subscribed = !!(await reg.pushManager.getSubscription());
      }
    } catch (e) {}
    return out;
  }

  const actions = {
    register: async (p) => { const j = await api('POST', '/api/auth/register', p); setUser(j.user); return j.user; },
    login: async (e, pw) => { const j = await api('POST', '/api/auth/login', { email: e, password: pw }); setUser(j.user); return j.user; },
    logout: async () => { try { await api('POST', '/api/auth/logout'); } catch (e) {} setUser(null); },
    updateProfile: async (patch) => { const j = await api('PUT', '/api/me', patch); setUser(j.user); return j.user; },
    addPeriod: async (p) => { const j = await api('POST', '/api/periods', p); setUser(j.user); return j.user; },
    removePeriod: async (start) => { const j = await api('DELETE', '/api/periods/' + encodeURIComponent(start)); setUser(j.user); return j.user; },
    setReminders: async (patch) => { const j = await api('POST', '/api/reminders', patch); setUser((u) => (u ? { ...u, reminders: j.reminders } : u)); return j.reminders; },
    markPadChanged: async () => { const j = await api('POST', '/api/pad'); setUser((u) => (u ? { ...u, reminders: j.reminders } : u)); return j.reminders; },
    generateDiet: async () => { const j = await api('POST', '/api/diet'); if (j.ok && j.user) setUser(j.user); return j; },
    saveDiet: async (plan) => { const j = await api('POST', '/api/diet/save', { plan }); if (j.user) setUser(j.user); return j; },
    testPush: async () => { try { return await api('POST', '/api/push/test'); } catch (e) { return { ok: false, error: e.message }; } },
    subscribePush, enableNotifications, notifyNow, pushStatus
  };

  const value = { user, config, ready, toast, ...actions };

  return (
    <AuthCtx.Provider value={value}>
      {children}
      <div className="toast-wrap" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className={'toast toast--' + t.type}>{t.msg}</div>)}
      </div>
    </AuthCtx.Provider>
  );
}
