// Tipuri partajate pentru AI Budget Planner.
// Importate de budget-engine.ts, route.ts si paginile budget-planner.

export interface BudgetPrioritati {
  locatie: number;
  mancare: number;
  atmosfera: number;
  decor: number;
  cazare: number;
}

export interface BudgetFormData {
  numePartener1: string;
  numePartener2: string;
  dataNunta: string;
  oras: string;
  zona: string;
  invitati: number;
  stil: string;
  bugetSuma: number | null;
  bugetGama: string;
  deciziLuate: string[];
  prioritati: BudgetPrioritati;
  email: string;
  nume?: string;
  telefon?: string;
}

export interface BudgetCategorie {
  nume: string;
  suma_min: number;
  suma_max: number;
  procent: number;
  nota: string;
}

export interface BudgetPlanActiune {
  urgent_30_zile: string;
  luna_2_4: string;
  final_luna: string;
}

export interface BudgetResult {
  verdict: string;
  buget_total_min: number;
  buget_total_max: number;
  buget_realist: boolean;
  categorii: BudgetCategorie[];
  sfaturi_brutale: string[];
  plan_actiune: BudgetPlanActiune;
  scor_realism: number;
  buget_declarat?: number | null;
  buget_per_persoana?: number | null;
  clasificare?: string | null;
  diferenta?: number | null; // pozitiv = surplus, negativ = lipsă
  surse?: string[];
  preturi_actualizate?: string;
  sursa_text?: 'ai' | 'fallback';
  lead_uuid?: string;
}
