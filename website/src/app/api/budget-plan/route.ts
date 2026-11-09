import { NextResponse } from 'next/server';
import { calculeazaBuget, liniiLaCategorii } from '@/lib/budget-engine';
import { genereazaTexte } from '@/lib/budget-ai';
import { PRICING_SOURCES, PRICING_UPDATED } from '@/lib/pricing-data';
import { BudgetFormData, BudgetResult } from '@/lib/budget-types';

export const runtime = 'nodejs';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evenvy.onrender.com/api';

function normalize(body: Partial<BudgetFormData>): BudgetFormData {
  const p = body.prioritati;
  return {
    numePartener1: body.numePartener1 ?? '',
    numePartener2: body.numePartener2 ?? '',
    dataNunta: body.dataNunta ?? '',
    oras: body.oras ?? '',
    zona: body.zona ?? '',
    invitati: typeof body.invitati === 'number' ? body.invitati : 100,
    stil: body.stil ?? '',
    bugetSuma: typeof body.bugetSuma === 'number' ? body.bugetSuma : null,
    bugetGama: body.bugetGama ?? '',
    deciziLuate: Array.isArray(body.deciziLuate) ? body.deciziLuate : [],
    prioritati: {
      locatie: p?.locatie ?? 3,
      mancare: p?.mancare ?? 3,
      atmosfera: p?.atmosfera ?? 3,
      decor: p?.decor ?? 3,
      cazare: p?.cazare ?? 3,
    },
    email: body.email ?? '',
    nume: body.nume,
    telefon: body.telefon,
  };
}

async function saveLead(data: BudgetFormData, result: BudgetResult): Promise<string | null> {
  // Backend-ul (Render free) poate dormi sau cădea: nu blocăm planul mai mult de 8s pentru salvarea lead-ului.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8_000);
  try {
    const res = await fetch(`${BACKEND_URL}/leads`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        nume: data.nume ?? null,
        telefon: data.telefon ?? null,
        form_data: data,
        ai_result: result,
        event_type: 'wedding',
      }),
    });
    if (!res.ok) {
      console.error('[leads] Backend returned', res.status);
      return null;
    }
    const json = await res.json();
    return json.lead_uuid ?? null;
  } catch (e) {
    console.error('[leads] Failed to save lead:', e instanceof Error ? e.message : e);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  let body: Partial<BudgetFormData>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body invalid (JSON asteptat).' }, { status: 400 });
  }

  if (!body.email || !body.oras || !body.invitati) {
    return NextResponse.json(
      { error: 'Lipsesc campuri obligatorii (email, oras, invitati).' },
      { status: 400 }
    );
  }

  const data = normalize(body);

  try {
    // 1. Cifrele: calcul determinist din tabelul de prețuri
    const calc = calculeazaBuget(data);
    // 2. Textele: AI explică planul (cu fallback în cod dacă AI-ul nu răspunde)
    const texte = await genereazaTexte(data, calc);

    const result: BudgetResult = {
      verdict: texte.verdict,
      buget_total_min: calc.totalMin,
      buget_total_max: calc.totalMax,
      buget_realist: true,
      categorii: liniiLaCategorii(calc),
      sfaturi_brutale: texte.sfaturi_brutale,
      plan_actiune: texte.plan_actiune,
      scor_realism: calc.scorRealism,
      buget_declarat: calc.buget,
      buget_per_persoana: calc.bugetPerPers,
      clasificare: calc.clasificare,
      diferenta: calc.diferenta,
      surse: PRICING_SOURCES,
      preturi_actualizate: PRICING_UPDATED,
      sursa_text: texte.sursa_text,
    };
    console.log('[budget]', data.oras, data.invitati, 'inv ->', calc.totalMin, '-', calc.totalMax, '| text:', texte.sursa_text);

    const lead_uuid = await saveLead(data, result);
    return NextResponse.json({ ...result, lead_uuid }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Eroare necunoscuta la generarea planului.';
    console.error('[budget] error:', message);
    return NextResponse.json({ error: 'Nu am putut genera planul. Încearcă din nou.' }, { status: 500 });
  }
}
