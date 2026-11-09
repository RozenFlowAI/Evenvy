// Tabel de prețuri piața nunților România 2026 — sursa unică de adevăr pentru calculator.
// AI-ul NU inventează cifre: toate sumele din plan vin de aici, prin budget-engine.ts.
// Ca să actualizezi prețurile: editezi doar acest fișier și schimbi PRICING_UPDATED.

export type Nivel = 'ieftin' | 'standard' | 'premium';
export const NIVELURI: Nivel[] = ['ieftin', 'standard', 'premium'];

export interface Interval {
  min: number;
  max: number;
}

export const PRICING_UPDATED = '2026-11';

export const PRICING_SOURCES = [
  'wall-street.ro (2026): meniu București ~130 EUR/pers, alte orașe de la ~70 EUR/pers; foto 1.100–1.500 EUR; DJ 1.000–3.000 EUR; formație 4.000–30.000 EUR; decor 800–30.000 EUR',
  'Digi24 (2026): prețurile serviciilor de nuntă au crescut cu ~30% față de anii anteriori',
  'Evenvy — date agregate din oferte publice ale locațiilor și furnizorilor (2026)',
];

// Meniu + băuturi + sală (all-inclusive), EUR / persoană
export type ZonaPret = 'bucuresti' | 'mare' | 'mediu' | 'sat';

export const ORAS_LA_ZONA: Record<string, ZonaPret> = {
  'București': 'bucuresti',
  'Cluj': 'mare',
  'Timișoara': 'mare',
  'Iași': 'mare',
  'Constanța': 'mediu',
  'Brașov': 'mediu',
  'Sat / la țară': 'sat',
  'Altul': 'mediu',
};

export const ZONA_LABEL: Record<ZonaPret, string> = {
  bucuresti: 'în București',
  mare: 'într-un oraș mare (Cluj / Timișoara / Iași)',
  mediu: 'într-un oraș mediu',
  sat: 'la țară',
};

export const MENIU_PER_PERS: Record<ZonaPret, Record<Nivel, Interval>> = {
  bucuresti: { ieftin: { min: 55, max: 75 }, standard: { min: 75, max: 100 }, premium: { min: 100, max: 135 } },
  mare: { ieftin: { min: 45, max: 60 }, standard: { min: 60, max: 80 }, premium: { min: 80, max: 110 } },
  mediu: { ieftin: { min: 40, max: 55 }, standard: { min: 55, max: 75 }, premium: { min: 75, max: 95 } },
  sat: { ieftin: { min: 30, max: 40 }, standard: { min: 40, max: 55 }, premium: { min: 55, max: 70 } },
};

export type CategorieId = 'locatie' | 'foto' | 'muzica' | 'decor' | 'tinute' | 'papetarie' | 'cazare';

export interface CategorieDef {
  id: CategorieId;
  nume: string;
  // Interval total pe eveniment (EUR). Locația se calculează separat (per persoană).
  preturi?: Record<Nivel, Interval>;
  descriere: Record<Nivel, string>;
  // Alternativa ieftină concretă, afișată când nu suntem deja pe nivelul ieftin
  alternativa: string;
}

export const CATEGORII: CategorieDef[] = [
  {
    id: 'locatie',
    nume: 'Locație + meniu',
    descriere: {
      ieftin: 'restaurant mic / periferie sau cămin cultural, negociat',
      standard: 'restaurant sau salon cu rating bun, zonă urbană',
      premium: 'locație centrală sau conac cu servicii complete',
    },
    alternativa: 'Vineri sau duminică în loc de sâmbătă și extrasezon (noiembrie–martie) scad prețul/persoană cu 10–20%.',
  },
  {
    id: 'foto',
    nume: 'Foto + video',
    preturi: {
      ieftin: { min: 400, max: 1000 },
      standard: { min: 1500, max: 2500 },
      premium: { min: 2500, max: 4500 },
    },
    descriere: {
      ieftin: 'fotograf la început de drum / student la arte cu portofoliu',
      standard: 'fotograf + videograf cu experiență',
      premium: 'echipă foto-video de top',
    },
    alternativa: 'Doar foto profesionist + video scurt (highlights) în loc de film complet.',
  },
  {
    id: 'muzica',
    nume: 'Muzică',
    preturi: {
      ieftin: { min: 300, max: 800 },
      standard: { min: 1000, max: 2000 },
      premium: { min: 3000, max: 6000 },
    },
    descriere: {
      ieftin: 'DJ inclus în pachetul locației sau DJ la început de drum',
      standard: 'DJ profesionist',
      premium: 'formație live',
    },
    alternativa: 'DJ profesionist + 1–2 momente live (saxofonist, lăutari la intrare) în loc de formație completă.',
  },
  {
    id: 'decor',
    nume: 'Decor + flori',
    preturi: {
      ieftin: { min: 300, max: 800 },
      standard: { min: 1500, max: 3000 },
      premium: { min: 3000, max: 7000 },
    },
    descriere: {
      ieftin: 'materiale cumpărate angro, montaj cu familia',
      standard: 'florar mediu, aranjamente la mese și prezidiu',
      premium: 'florar premium, decor complet personalizat',
    },
    alternativa: 'Verdeață + lumânări în loc de flori scumpe; refolosiți aranjamentele de la cununie la restaurant.',
  },
  {
    id: 'tinute',
    nume: 'Rochie + costum',
    preturi: {
      ieftin: { min: 550, max: 1000 },
      standard: { min: 1500, max: 3500 },
      premium: { min: 3500, max: 7000 },
    },
    descriere: {
      ieftin: 'rochie închiriată + costum bun din magazin',
      standard: 'rochie din salon + costum la comandă',
      premium: 'designer / colecție premium',
    },
    alternativa: 'Închiriere rochie (400–800 EUR) — economie de 1.000–2.500 EUR față de cumpărare.',
  },
  {
    id: 'papetarie',
    nume: 'Invitații, mărturii, tort',
    preturi: {
      ieftin: { min: 200, max: 400 },
      standard: { min: 400, max: 800 },
      premium: { min: 800, max: 1500 },
    },
    descriere: {
      ieftin: 'invitații digitale, mărturii angro, tort de la cofetărie mică',
      standard: 'invitații printate, mărturii personalizate',
      premium: 'papetărie de designer, tort de autor',
    },
    alternativa: 'Invitații digitale (0 EUR) + tort inclus în meniul locației.',
  },
  {
    id: 'cazare',
    nume: 'Cazare',
    preturi: {
      ieftin: { min: 200, max: 500 },
      standard: { min: 500, max: 1200 },
      premium: { min: 1200, max: 2500 },
    },
    descriere: {
      ieftin: 'cameră pentru miri + câteva camere negociate pentru familie',
      standard: 'camere pentru miri și invitații din alt oraș',
      premium: 'cazare pentru majoritatea invitaților din alt oraș',
    },
    alternativa: 'Cereți locației tarif de grup — multe oferă camera mirilor gratuit peste 100 de invitați.',
  },
];

export const NEPREVAZUTE_PROCENT = 0.05;

// Gama de buget din formular -> sumă de lucru (mijlocul intervalului)
export const GAMA_LA_SUMA: Record<string, number | null> = {
  '15.000 - 25.000 EUR': 20000,
  '25.000 - 35.000 EUR': 30000,
  '35.000 - 50.000 EUR': 42500,
  'peste 50.000 EUR': 60000,
  'nehotărât': null,
};
