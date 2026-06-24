/* Next.js instrumentation hook — runs once when the server boots.
   Starts the in-process reminder scheduler for LOCAL / self-hosted runs.
   On Vercel (process.env.VERCEL) there is no long-lived process, so the
   reminder pass is driven by Vercel Cron hitting /api/cron/reminders. */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && !process.env.VERCEL) {
    const { startLocalScheduler } = await import('./lib/scheduler');
    startLocalScheduler();
  }
}
