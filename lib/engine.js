/* =========================================================
   Rutu-Maa (Next.js) — client engine: cycle predictions +
   on-device AI-style dietary generator + date helpers.
   Pure functions, safe to import in client components.
   ========================================================= */
import { RM_CONTENT } from './content';

const DAY = 86400000;
export function atMidnight(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
export function today() { return atMidnight(new Date()); }
export function parse(str) { return str ? atMidnight(new Date(str + 'T00:00:00')) : null; }
export function addDays(d, n) { return new Date(atMidnight(d).getTime() + n * DAY); }
export function diffDays(a, b) { return Math.round((atMidnight(a) - atMidnight(b)) / DAY); }
export function iso(d) {
  const x = atMidnight(d);
  return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
}
export function pretty(d) { return atMidnight(d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }); }

export const PHASE_NOTE = {
  Menstrual: 'Your period is here. Rest, hydrate, eat iron-rich food and change pads regularly. 🩸',
  Follicular: 'Energy is rising — a great time for movement and fresh, balanced meals. 🌱',
  Ovulation: 'You\'re in your fertile window. You may feel your best — stay hydrated. ✨',
  Luteal: 'PMS phase. Cravings & mood dips are normal — favour magnesium & complex carbs. 🌙'
};

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
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = addDays(ovulation, 1);
  const inPeriod = cycleDay >= 1 && cycleDay <= periodLen;
  let phase = 'Luteal';
  if (inPeriod) phase = 'Menstrual';
  else if (t >= fertileStart && t <= fertileEnd) phase = 'Ovulation';
  else if (cycleDay < diffDays(ovulation, cycleStart) + 1) phase = 'Follicular';
  return { needsSetup: false, cycleLen, periodLen, cycleStart, nextStart, cycleDay, daysUntil, ovulation, fertileStart, fertileEnd, inPeriod, phase };
}

/* ---- on-device diet generator (fallback when AI is off/offline) ---- */
function seed(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }
function pick(list, seedStr, must) {
  let pool = list;
  if (must && must.length) { const f = list.filter((m) => must.some((tag) => m.tags.includes(tag))); if (f.length) pool = f; }
  return pool[seed(seedStr) % pool.length];
}
export function bmiOf(user) {
  if (!user.heightCm || !user.weightKg) return null;
  const m = user.heightCm / 100;
  return user.weightKg / (m * m);
}
export function bmiBand(bmi) {
  if (bmi == null) return { label: '—', tone: 'lav' };
  if (bmi < 18.5) return { label: 'Underweight', tone: 'warn' };
  if (bmi < 25) return { label: 'Healthy', tone: 'mint' };
  if (bmi < 30) return { label: 'Overweight', tone: 'warn' };
  return { label: 'High', tone: 'warn' };
}

export function generateDiet(user, cycle) {
  const C = RM_CONTENT;
  const bmi = bmiOf(user);
  const band = bmiBand(bmi);
  const inPeriod = cycle && cycle.inPeriod;
  const excess = user.flow === 'excess';

  let calories = 2000;
  if (user.weightKg && user.heightCm && user.age) {
    const bmr = 10 * user.weightKg + 6.25 * user.heightCm - 5 * user.age - 161;
    const factor = ({ sedentary: 1.3, light: 1.45, moderate: 1.6, active: 1.75 })[user.activity || 'light'] || 1.45;
    calories = bmr * factor;
    if (user.pcod && bmi && bmi >= 25) calories -= 300;
    if (bmi && bmi < 18.5) calories += 250;
    calories = Math.round(calories / 10) * 10;
  }

  const must = [];
  if (user.pcod) must.push('pcod');
  if (excess || inPeriod) must.push('iron');
  if (excess) must.push('hydrate');
  if (!must.length) must.push('balanced');

  let macros;
  if (user.pcod) macros = { protein: 30, carbs: 38, fat: 32 };
  else if (excess) macros = { protein: 28, carbs: 47, fat: 25 };
  else macros = { protein: 25, carbs: 50, fat: 25 };

  let water = 2.5;
  if (excess || inPeriod) water += 0.5;
  if (user.pcod) water += 0.3;
  water = Math.round(water * 10) / 10;

  const k = (user.email || 'guest') + iso(today());
  const plan = {
    source: 'engine', date: iso(today()),
    profileType: user.pcod ? 'PCOD-focused' : (excess ? 'Heavy-flow balanced' : 'Balanced'),
    bmi: bmi ? Math.round(bmi * 10) / 10 : null, bmiBand: band, calories, macros, water, focus: [],
    meals: [
      { time: 'Breakfast · 8 AM', item: pick(C.meals.breakfast, k + 'b', must) },
      { time: 'Mid-morning · 11 AM', item: pick(C.meals.midMorning, k + 'm', must) },
      { time: 'Lunch · 1:30 PM', item: pick(C.meals.lunch, k + 'l', must) },
      { time: 'Evening · 5 PM', item: pick(C.meals.evening, k + 'e', must) },
      { time: 'Dinner · 8 PM', item: pick(C.meals.dinner, k + 'd', must) }
    ],
    eatMore: user.pcod ? C.pcod.eatMore : ['Iron-rich greens & lentils', 'Fresh fruit (vitamin-C)', 'Whole grains', 'Lean protein', 'Plenty of water'],
    eatLess: user.pcod ? C.pcod.eatLess : ['Excess sugar & sweets', 'Deep-fried food', 'Too much caffeine', 'Packaged juices'],
    supplements: []
  };

  if (user.pcod) plan.focus.push('Low-GI, anti-inflammatory plate to steady blood sugar & hormones.');
  if (excess) plan.focus.push('Extra iron + vitamin-C to replace what heavy bleeding takes away.');
  if (inPeriod && !excess) plan.focus.push('Period-day comfort: warm, iron-rich, easy-to-digest meals.');
  if (band.label === 'Underweight') plan.focus.push('Slightly higher calories to support a healthy weight.');
  if (band.label === 'Overweight' || band.label === 'High') plan.focus.push('Gentle calorie balance — steady changes, never crash diets.');
  if (!plan.focus.length) plan.focus.push('A balanced, nourishing day tuned to your body.');

  if (excess || inPeriod) plan.supplements.push('Iron-rich foods with a vitamin-C source at the same meal');
  if (user.pcod) plan.supplements.push('Spearmint / green tea and omega-3 (flax, walnuts) daily');
  plan.supplements.push(`Hydration target: ~${water} litres of water`);

  return plan;
}
