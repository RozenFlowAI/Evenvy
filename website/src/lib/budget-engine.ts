// Motor determinist de buget. Toate cifrele planului se calculează aici, din pricing-data.ts.
// Același input => același output. AI-ul doar explică rezultatul (vezi budget-ai.ts).

import { BudgetCategorie, BudgetFormData } from './budget-types';
import {
  CATEGORII,
  CategorieDef,
  CategorieId,
  GAMA_LA_SUMA,
  Interval,
  MENIU_PER_PERS,
  NEPREVAZUTE_PROCENT,
  NIVELURI,
  Nivel,
  ORAS_LA_ZONA,
  ZONA_LABEL,
  ZonaPret,
} from './pricing-data';

export type Clasificare = 'GENEROS' | 'POTRIVIT' | 'STRÂNS' | 'MIC' | 'FOARTE MIC';

export interface LinieCalcul {
  id: CategorieId | 'neprevazute';
  nume: string;
  nivel: Nivel | null;
  interval: Interval;
  descriere: string;
  alternativa: string | null;
  dejaDecis: boolean;
}

export interface CalculBuget {
  buget: number | null; // null = cuplul nu a declarat buget
  bugetSursa: 'exact' | 'gama' | 'nedeclarat';
  invitati: number;
  zona: ZonaPret;
  zonaLabel: string;
  bugetPerPers: number | null;
  clasificare: Clasificare | null;
  linii: LinieCalcul[];
  totalMin: number;
  totalMax: number;
  diferenta: number | null; // buget - total mediu (pozitiv = surplus, negativ = lipsă)
  scorRealism: number;
}

const round = (n: number, step = 50) => Math.round(n / step) * step;
const mid = (i: Interval) => (i.min + i.max) / 2;

// Ce prioritate din formular contează pentru fiecare categorie (1-5)
function prioritate(id: CategorieId, data: BudgetFormData): number {
  const p = data.prioritati;
  switch (id) {
    case 'locatie': return Math.max(p.locatie, p.mancare);
    case 'muzica': return p.atmosfera;
    case 'decor': return p.decor;
    case 'cazare': return p.cazare;
    case 'foto': return 4; // amintirile rămân — rar e prima tăiată
    case 'tinute': return 3;
    case 'papetarie': return 2;
  }
}

const DECIZIE_LA_CATEGORIE: Record<string, CategorieId> = {
  'Locația': 'locatie',
  'Fotograf': 'foto',
  'Formație / DJ': 'muzica',
  'Florar': 'decor',
  'Rochia': 'tinute',
};

function intervalCategorie(def: CategorieDef, nivel: Nivel, zona: ZonaPret, invitati: number): Interval {
  if (def.id === 'locatie') {
    const pp = MENIU_PER_PERS[zona][nivel];
    return { min: round(pp.min * invitati), max: round(pp.max * invitati) };
  }
  return def.preturi![nivel];
}

function clasifica(perPers: number): Clasificare {
  if (perPers > 400) return 'GENEROS';
  if (perPers >= 200) return 'POTRIVIT';
  if (perPers >= 100) return 'STRÂNS';
  if (perPers >= 50) return 'MIC';
  return 'FOARTE MIC';
}

function scor(buget: number | null, totalMediu: number): number {
  if (buget == null) return 7;
  const r = buget / totalMediu;
  if (r >= 1.3) return 10;
  if (r >= 1.1) return 9;
  if (r >= 1.0) return 8;
  if (r >= 0.92) return 7;
  if (r >= 0.85) return 6;
  if (r >= 0.75) return 5;
  if (r >= 0.65) return 4;
  if (r >= 0.5) return 3;
  if (r >= 0.35) return 2;
  return 1;
}

export function rezolvaBuget(data: BudgetFormData): { suma: number | null; sursa: CalculBuget['bugetSursa'] } {
  if (data.bugetSuma != null && data.bugetSuma > 0) return { suma: data.bugetSuma, sursa: 'exact' };
  const g = GAMA_LA_SUMA[data.bugetGama];
  if (g != null) return { suma: g, sursa: 'gama' };
  return { suma: null, sursa: 'nedeclarat' };
}

export function calculeazaBuget(data: BudgetFormData): CalculBuget {
  const invitati = Math.max(1, Math.round(data.invitati));
  const zona = ORAS_LA_ZONA[data.oras] ?? 'mediu';
  const { suma: buget, sursa } = rezolvaBuget(data);

  const decise = new Set(
    data.deciziLuate.map(d => DECIZIE_LA_CATEGORIE[d]).filter(Boolean) as CategorieId[]
  );

  // Cazarea intră în plan doar dacă e importantă pentru cuplu
  const active = CATEGORII.filter(c => c.id !== 'cazare' || data.prioritati.cazare >= 4);

  const nivel: Partial<Record<CategorieId, number>> = {};
  const totalMediu = () => {
    const s = active.reduce((acc, c) => acc + mid(intervalCategorie(c, NIVELURI[nivel[c.id]!], zona, invitati)), 0);
    return s * (1 + NEPREVAZUTE_PROCENT);
  };

  if (buget == null) {
    // Fără buget: standard, ajustat după priorități
    for (const c of active) {
      const p = prioritate(c.id, data);
      nivel[c.id] = p >= 5 ? 2 : p <= 2 ? 0 : 1;
    }
  } else {
    // Cu buget: pornim de la premium și coborâm întâi ce contează cel mai puțin pentru cuplu,
    // până planul încape în buget sau totul e la nivelul ieftin.
    for (const c of active) nivel[c.id] = 2;
    while (totalMediu() > buget) {
      const candidati = active.filter(c => nivel[c.id]! > 0);
      if (candidati.length === 0) break;
      candidati.sort((a, b) => {
        const pa = prioritate(a.id, data) + nivel[a.id]! * -1.5; // un nivel premium "costă" 1,5 puncte de prioritate — tăierile se distribuie
        const pb = prioritate(b.id, data) + nivel[b.id]! * -1.5;
        if (pa !== pb) return pa - pb;
        const economie = (c: CategorieDef) =>
          mid(intervalCategorie(c, NIVELURI[nivel[c.id]!], zona, invitati)) -
          mid(intervalCategorie(c, NIVELURI[nivel[c.id]! - 1], zona, invitati));
        return economie(b) - economie(a);
      });
      nivel[candidati[0].id]! -= 1;
    }
  }

  const linii: LinieCalcul[] = active.map(c => {
    const n = NIVELURI[nivel[c.id]!];
    return {
      id: c.id,
      nume: c.nume,
      nivel: n,
      interval: intervalCategorie(c, n, zona, invitati),
      descriere: c.descriere[n],
      alternativa: n === 'ieftin' ? null : c.alternativa,
      dejaDecis: decise.has(c.id),
    };
  });

  const subMin = linii.reduce((a, l) => a + l.interval.min, 0);
  const subMax = linii.reduce((a, l) => a + l.interval.max, 0);
  const nep: Interval = { min: round(subMin * NEPREVAZUTE_PROCENT), max: round(subMax * NEPREVAZUTE_PROCENT) };
  linii.push({
    id: 'neprevazute',
    nume: 'Neprevăzute (5%)',
    nivel: null,
    interval: nep,
    descriere: 'rezervă pentru costuri care apar mereu: transport, ore suplimentare, bacșișuri',
    alternativa: null,
    dejaDecis: false,
  });

  const totalMin = subMin + nep.min;
  const totalMax = subMax + nep.max;
  const totalMed = (totalMin + totalMax) / 2;
  const bugetPerPers = buget != null ? Math.round(buget / invitati) : null;

  return {
    buget,
    bugetSursa: sursa,
    invitati,
    zona,
    zonaLabel: ZONA_LABEL[zona],
    bugetPerPers,
    clasificare: bugetPerPers != null ? clasifica(bugetPerPers) : null,
    linii,
    totalMin,
    totalMax,
    diferenta: buget != null ? Math.round(buget - totalMed) : null,
    scorRealism: scor(buget, totalMed),
  };
}

const NIVEL_LABEL: Record<Nivel, string> = { ieftin: 'Economic', standard: 'Standard', premium: 'Premium' };

export function liniiLaCategorii(calc: CalculBuget): BudgetCategorie[] {
  return calc.linii.map(l => {
    const parti = [
      l.nivel ? `${NIVEL_LABEL[l.nivel]}: ${l.descriere}.` : `${l.descriere[0].toUpperCase()}${l.descriere.slice(1)}.`,
    ];
    if (l.dejaDecis) parti.push('Ați ales deja furnizorul — înlocuiți estimarea cu suma din contract.');
    if (l.alternativa) parti.push(`Alternativă: ${l.alternativa}`);
    return {
      nume: l.nume,
      suma_min: l.interval.min,
      suma_max: l.interval.max,
      procent: calc.totalMax > 0 ? Math.round((l.interval.max / calc.totalMax) * 100) : 0,
      nota: parti.join(' '),
    };
  });
}
