// Stratul AI: explică planul calculat de budget-engine.ts. Server-only.
// Dacă AI-ul nu răspunde (cheie lipsă, limită, eroare), planul tot se livrează cu texte generate în cod.

import { BudgetFormData, BudgetPlanActiune } from './budget-types';
import { CalculBuget } from './budget-engine';

const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
// llama-3.3-70b-versatile a fost retras pe 16 aug 2026; gpt-oss-120b e înlocuitorul recomandat de Groq
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

export interface TexteAI {
  verdict: string;
  sfaturi_brutale: string[];
  plan_actiune: BudgetPlanActiune;
  sursa_text: 'ai' | 'fallback';
}

const fmt = (n: number) => Math.round(n).toLocaleString('ro-RO');

function rezumatCalcul(data: BudgetFormData, calc: CalculBuget): string {
  const linii = calc.linii
    .map(l => `- ${l.nume}: ${fmt(l.interval.min)}–${fmt(l.interval.max)} EUR (${l.nivel ?? 'rezervă'}; ${l.descriere})${l.dejaDecis ? ' [furnizor deja ales]' : ''}`)
    .join('\n');
  const buget = calc.buget == null
    ? 'nedeclarat'
    : `${fmt(calc.buget)} EUR (${calc.bugetSursa === 'gama' ? 'mijlocul gamei alese' : 'sumă exactă'}), adică ${fmt(calc.bugetPerPers!)} EUR/persoană — ${calc.clasificare}`;
  const dif = calc.diferenta == null
    ? ''
    : calc.diferenta >= 0
      ? `SURPLUS estimat: ${fmt(calc.diferenta)} EUR`
      : `LIPSĂ estimată: ${fmt(-calc.diferenta)} EUR chiar după alegerile economice`;

  return `CUPLU: ${data.numePartener1 || '?'} și ${data.numePartener2 || '?'}
DATA: ${data.dataNunta || 'nestabilită'}
ORAȘ: ${data.oras} — preț de referință ${calc.zonaLabel}${data.zona ? `, zona: ${data.zona}` : ''}
INVITAȚI: ${calc.invitati}
STIL: ${data.stil || 'nehotărât'}
BUGET: ${buget}
TOTAL PLAN: ${fmt(calc.totalMin)}–${fmt(calc.totalMax)} EUR
${dif}
PRIORITĂȚI (1-5): locație ${data.prioritati.locatie}, mâncare ${data.prioritati.mancare}, atmosferă ${data.prioritati.atmosfera}, decor ${data.prioritati.decor}, cazare ${data.prioritati.cazare}

PLAN CALCULAT:
${linii}`;
}

const SYSTEM = `Ești Evenvy AI, consilier de buget pentru nunți în România. Primești un plan DEJA CALCULAT din prețuri reale de piață.

REGULI:
- Folosește DOAR cifrele din plan. Nu inventa prețuri, nume de furnizori sau procente noi.
- Stilul ales de cuplu nu se schimbă. Bugetul decide doar cum îl implementăm.
- Niciodată: "nerealist", "imposibil", "schimbați stilul", "nu vă permiteți".
- Dacă există LIPSĂ: spune exact cât lipsește și 2-3 soluții concrete (altă zi decât sâmbătă, extrasezon, mai puțini invitați — cu calculul pe persoană din plan).
- Dacă există SURPLUS: sugerează unde merită investit, legat de prioritățile cuplului.
- Ton: direct, cald, practic. Română corectă cu diacritice.

Răspunde DOAR cu JSON valid:
{
  "verdict": "1-2 propoziții: clasificarea + cifra pe persoană + concluzia practică",
  "sfaturi_brutale": ["exact 5 sfaturi specifice, acționabile, cu cifre din plan"],
  "plan_actiune": {
    "urgent_30_zile": "ce fac în următoarele 30 de zile",
    "luna_2_4": "ce fac în lunile 2-4",
    "final_luna": "ce fac în ultima lună"
  }
}`;

async function callClaude(user: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY lipsește');

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 25_000);
  try {
    const res = await fetch(ANTHROPIC_ENDPOINT, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1500,
        temperature: 0.4,
        system: SYSTEM,
        messages: [{ role: 'user', content: user }],
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Anthropic ${res.status}: ${txt.slice(0, 300)}`);
    }
    const json = await res.json();
    const text = json?.content?.find((b: { type: string }) => b.type === 'text')?.text;
    if (typeof text !== 'string') throw new Error('Răspuns Anthropic fără text');
    return text;
  } finally {
    clearTimeout(t);
  }
}

async function callGroq(user: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY lipsește');

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 25_000);
  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: user },
        ],
        temperature: 0.4,
        max_tokens: 3000,
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Groq ${res.status}: ${txt.slice(0, 300)}`);
    }
    const json = await res.json();
    const text = json?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text) throw new Error('Răspuns Groq fără text');
    return text;
  } finally {
    clearTimeout(t);
  }
}

function extrageJson(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Fără JSON în răspuns');
  return JSON.parse(text.slice(start, end + 1));
}

function valid(o: unknown): o is Omit<TexteAI, 'sursa_text'> {
  const x = o as Record<string, unknown>;
  const p = x?.plan_actiune as Record<string, unknown> | undefined;
  return (
    typeof x?.verdict === 'string' &&
    Array.isArray(x.sfaturi_brutale) &&
    x.sfaturi_brutale.every(s => typeof s === 'string') &&
    !!p && typeof p.urgent_30_zile === 'string' && typeof p.luna_2_4 === 'string' && typeof p.final_luna === 'string'
  );
}

export function texteFallback(data: BudgetFormData, calc: CalculBuget): TexteAI {
  const locatie = calc.linii.find(l => l.id === 'locatie')!;
  const perPersLocatie = Math.round(locatie.interval.max / calc.invitati);
  let verdict: string;
  if (calc.buget == null) {
    verdict = `Pentru ${calc.invitati} invitați ${calc.zonaLabel}, o nuntă${data.stil && data.stil !== 'Nehotărât' ? ` în stil ${data.stil.toLowerCase()}` : ''} costă realist ${fmt(calc.totalMin)}–${fmt(calc.totalMax)} EUR. Stabiliți acum o sumă maximă — fiecare decizie de mai jos depinde de ea.`;
  } else if (calc.diferenta! >= 0) {
    verdict = `Buget ${calc.clasificare!.toLowerCase()}: ${fmt(calc.bugetPerPers!)} EUR/persoană. Planul de mai jos încape în buget și lasă ~${fmt(calc.diferenta!)} EUR rezervă pentru ce contează cel mai mult pentru voi.`;
  } else {
    verdict = `Buget ${calc.clasificare!.toLowerCase()}: ${fmt(calc.bugetPerPers!)} EUR/persoană. Cu alegerile economice de mai jos mai lipsesc ~${fmt(-calc.diferenta!)} EUR — iată de unde îi recuperați fără să renunțați la stil.`;
  }

  const sfaturi = [
    `Locația e ~${Math.round((locatie.interval.max / calc.totalMax) * 100)}% din buget. Cereți oferte de la minim 3 locații și comparați prețul final/persoană (meniu + băuturi + taxe), nu doar meniul — țintă: sub ${perPersLocatie} EUR/pers.`,
    'Vineri, duminică sau extrasezon (noiembrie–martie): aceeași locație e de obicei cu 10–20% mai ieftină decât o sâmbătă de vară.',
    'Rezervați fotograful și muzica imediat după locație — cei buni se ocupă cu 12–18 luni înainte.',
    `Cu ${calc.invitati} invitați, fiecare 10 invitați în minus economisesc ~${fmt(Math.round(locatie.interval.max / calc.invitati) * 10)} EUR doar la meniu.`,
    'Cereți contract scris cu toate costurile (ore suplimentare, taxa de dop, DJ, decor inclus) — acolo apar surprizele.',
  ];

  return {
    verdict,
    sfaturi_brutale: sfaturi,
    plan_actiune: {
      urgent_30_zile: 'Fixați bugetul maxim și lista de invitați, apoi vizitați 3 locații și blocați data cu avans.',
      luna_2_4: 'Rezervați foto-video și muzica, apoi rochia/costumul și decorul. Comparați minim 2 oferte pe fiecare.',
      final_luna: 'Confirmați numărul final de invitați la locație, plătiți soldurile și faceți programul zilei cu toți furnizorii.',
    },
    sursa_text: 'fallback',
  };
}

export async function genereazaTexte(data: BudgetFormData, calc: CalculBuget): Promise<TexteAI> {
  const user = rezumatCalcul(data, calc);
  // Ordinea: Claude -> Groq -> texte generate în cod. Planul nu pică niciodată din cauza AI-ului.
  for (const [nume, call] of [['anthropic', callClaude], ['groq', callGroq]] as const) {
    try {
      const parsed = extrageJson(await call(user));
      if (!valid(parsed)) throw new Error('JSON AI incomplet');
      console.log(`[budget-ai] text generat de ${nume}`);
      return {
        verdict: parsed.verdict,
        sfaturi_brutale: parsed.sfaturi_brutale.slice(0, 5),
        plan_actiune: parsed.plan_actiune,
        sursa_text: 'ai',
      };
    } catch (e) {
      console.error(`[budget-ai] ${nume} a eșuat:`, e instanceof Error ? e.message : e);
    }
  }
  return texteFallback(data, calc);
}
