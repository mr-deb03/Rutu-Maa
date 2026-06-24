/* =========================================================
   Rutu-Maa (Next.js) — AI dietary plan generation via any
   OpenAI-COMPATIBLE chat API (OpenAI, Groq, Google Gemini,
   OpenRouter, …). Configure with three env vars:
     OPENAI_API_KEY   — the provider's key
     OPENAI_BASE_URL  — e.g. https://api.groq.com/openai/v1
     OPENAI_MODEL     — e.g. llama-3.3-70b-versatile
   Uses JSON-mode (response_format: json_object) for broad
   compatibility across free providers.
   ========================================================= */

const BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export function hasKey() { return !!process.env.OPENAI_API_KEY; }
export { MODEL };

function bmiBand(bmi) {
  if (bmi == null) return { label: '—', tone: 'lav' };
  if (bmi < 18.5) return { label: 'Underweight', tone: 'warn' };
  if (bmi < 25) return { label: 'Healthy', tone: 'mint' };
  if (bmi < 30) return { label: 'Overweight', tone: 'warn' };
  return { label: 'High', tone: 'warn' };
}

const SHAPE = `Return ONLY a JSON object with EXACTLY these keys (no markdown, no extra text):
{
  "profileType": string,            // e.g. "PCOD-focused" or "Heavy-flow balanced"
  "calories": integer,              // approx daily kcal
  "waterLitres": number,            // daily water target in litres
  "macros": { "protein": integer, "carbs": integer, "fat": integer },  // percentages summing to 100
  "focus": [string],                // 2-4 short personalised notes
  "meals": [ {
     "time": string,                // meal slot + clock time, e.g. "Breakfast · 8 AM"
     "name": string,                // the ACTUAL DISH name (e.g. "Veggie besan chilla with mint chutney"), NOT the meal slot
     "desc": string                 // one short line on why it helps
  } ],                              // EXACTLY 5 meals in order: breakfast, mid-morning snack, lunch, evening snack, dinner
  "eatMore": [string],
  "eatLess": [string],
  "supplements": [string]
}`;

export async function generateDietPlan(user, cycle) {
  if (!hasKey()) throw new Error('NO_API_KEY');
  const bmi = user.heightCm && user.weightKg
    ? Math.round((user.weightKg / Math.pow(user.heightCm / 100, 2)) * 10) / 10 : null;
  const facts = {
    name: user.name, age: user.age, heightCm: user.heightCm, weightKg: user.weightKg, bmi,
    activity: user.activity, typicalFlow: user.flow, hasPCOD: !!user.pcod,
    cyclePhase: cycle.phase, onPeriodToday: cycle.inPeriod, cycleDay: cycle.cycleDay
  };

  const system = [
    'You are a careful, friendly nutrition assistant for an Indian women\'s health app called Rutu-Maa.',
    'Create a ONE-DAY, realistic, mostly Indian vegetarian-friendly meal plan personalised to the user.',
    'Tailor it to their flow (heavy/excess => more iron + vitamin C + hydration), PCOD status (=> low glycaemic index, anti-inflammatory, lean protein, less refined sugar), BMI and activity (adjust calories), and current cycle phase.',
    'macros percentages must sum to 100. Each meal\'s "name" MUST be a specific named dish (e.g. "Palak paneer with 2 millet rotis"), never the meal slot like "Breakfast". Keep every text field concise. This is general educational guidance, never a medical prescription.',
    SHAPE
  ].join(' ');

  const body = {
    model: MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: 'Create today\'s personalised dietary plan as JSON for this person:\n' + JSON.stringify(facts, null, 2) }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  let res;
  try {
    res = await fetch(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + process.env.OPENAI_API_KEY },
      body: JSON.stringify(body),
      signal: controller.signal
    });
  } finally { clearTimeout(timer); }

  if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error('AI_HTTP_' + res.status + ': ' + t.slice(0, 300)); }
  const data = await res.json();
  const choice = data.choices && data.choices[0];
  if (!choice) throw new Error('AI_NO_CHOICE');
  if (choice.message && choice.message.refusal) throw new Error('AI_REFUSAL');
  let content = choice.message && choice.message.content;
  if (!content) throw new Error('AI_NO_CONTENT');
  // some providers wrap JSON in ```json fences — strip them defensively
  content = String(content).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const ai = JSON.parse(content);

  let { protein = 30, carbs = 45, fat = 25 } = ai.macros || {};
  const sum = protein + carbs + fat || 1;
  protein = Math.round((protein / sum) * 100);
  carbs = Math.round((carbs / sum) * 100);
  fat = 100 - protein - carbs;

  return {
    source: 'ai', model: MODEL, date: new Date().toISOString().slice(0, 10),
    profileType: ai.profileType || (user.pcod ? 'PCOD-focused' : 'Balanced'),
    calories: ai.calories || 2000, water: ai.waterLitres || 2.5, bmi, bmiBand: bmiBand(bmi),
    macros: { protein, carbs, fat },
    focus: Array.isArray(ai.focus) ? ai.focus : [],
    meals: (Array.isArray(ai.meals) ? ai.meals : []).map((m) => ({ time: m.time, item: { name: m.name, desc: m.desc } })),
    eatMore: Array.isArray(ai.eatMore) ? ai.eatMore : [],
    eatLess: Array.isArray(ai.eatLess) ? ai.eatLess : [],
    supplements: Array.isArray(ai.supplements) ? ai.supplements : []
  };
}
