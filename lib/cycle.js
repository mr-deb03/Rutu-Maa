/* =========================================================
   Rutu-Maa (Next.js) — server-side cycle math (for the AI
   prompt context and the push scheduler).
   ========================================================= */
const DAY = 86400000;
function atMidnight(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function today() { return atMidnight(new Date()); }
function parse(str) { return str ? atMidnight(new Date(str + 'T00:00:00')) : null; }
function addDays(d, n) { return new Date(atMidnight(d).getTime() + n * DAY); }
function diffDays(a, b) { return Math.round((atMidnight(a) - atMidnight(b)) / DAY); }
export function iso(d) {
  const x = atMidnight(d);
  return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
}
export { today };

export function computeCycle(user) {
  if (!user || !user.lastPeriodStart) return { needsSetup: true };
  const cycleLen = Math.max(20, Math.min(45, user.avgCycleLength || 28));
  const periodLen = Math.max(2, Math.min(10, user.avgPeriodLength || 5));
  const t = today();
  let cycleStart = parse(user.lastPeriodStart);
  while (diffDays(t, cycleStart) >= cycleLen) cycleStart = addDays(cycleStart, cycleLen);
  const nextStart = addDays(cycleStart, cycleLen);
  const cycleDay = diffDays(t, cycleStart) + 1;
  const daysUntil = diffDays(nextStart, t);
  const ovulation = addDays(nextStart, -14);
  const inPeriod = cycleDay >= 1 && cycleDay <= periodLen;
  let phase = 'Luteal';
  if (inPeriod) phase = 'Menstrual';
  else if (Math.abs(diffDays(t, ovulation)) <= 1) phase = 'Ovulation';
  else if (cycleDay < diffDays(ovulation, cycleStart) + 1) phase = 'Follicular';
  return { needsSetup: false, cycleLen, periodLen, cycleStart, nextStart, cycleDay, daysUntil, ovulation, inPeriod, phase };
}
