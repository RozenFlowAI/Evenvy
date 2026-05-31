import { NextResponse } from 'next/server';
import { callGroq } from '@/lib/groq';
import { getSystemPrompt, getUserPrompt } from '@/lib/budget-prompt';
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

function recalculateMath(result: BudgetResult): BudgetResult {
  const active = result.categorii.filter(c => c.suma_max > 0);
  const totalMin = active.reduce((sum, c) => sum + c.suma_min, 0);
  const totalMax = active.reduce((sum, c) => sum + c.suma_max, 0);

  const updatedCategorii = result.categorii.map(c =>
    c.suma_max === 0
      ? { ...c, procent: 0 }
      : { ...c, procent: Math.round((c.suma_max / totalMax) * 100) }
  );

  return { ...result, buget_total_min: totalMin, buget_total_max: totalMax, categorii: updatedCategorii };
}

async function saveLead(data: BudgetFormData, result: BudgetResult): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/leads`, {
      method: 'POST',
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
    console.error('[leads] Failed to save lead:', e);
    return null;
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
    const raw = await callGroq(getSystemPrompt(), getUserPrompt(data));

    let result: BudgetResult;
    try {
      result = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: 'AI-ul a returnat un raspuns care nu este JSON valid. Incearca din nou.' },
        { status: 502 }
      );
    }

    console.log('[budget] AI raw totals:', result.buget_total_min, '-', result.buget_total_max);
    result = recalculateMath(result);
    console.log('[budget] recalc totals:', result.buget_total_min, '-', result.buget_total_max);

    const lead_uuid = await saveLead(data, result);
    if (lead_uuid) {
      console.log('[leads] Saved lead:', lead_uuid);
    }

    return NextResponse.json({ ...result, lead_uuid }, { status: 200 });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Eroare necunoscuta la generarea planului.';
    const status = message.includes('GROQ_API_KEY') ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
