import { NextResponse } from 'next/server';
import { callGroq } from '@/lib/groq';
import { getSystemPrompt, getUserPrompt } from '@/lib/budget-prompt';
import { BudgetFormData, BudgetResult } from '@/lib/budget-types';

export const runtime = 'nodejs';

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

    return NextResponse.json(result, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Eroare necunoscuta la generarea planului.';
    const status = message.includes('GROQ_API_KEY') ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
