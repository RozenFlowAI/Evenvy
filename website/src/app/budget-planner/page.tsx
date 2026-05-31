'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { BudgetFormData } from '@/lib/budget-types';
import { useLocalStorageRaw, writeLocalStorage } from '@/lib/use-local-storage';

const FORM_KEY = 'evenvy_budget_form';
const RESULT_KEY = 'evenvy_budget_result';
const LEAD_UUID_KEY = 'evenvy_lead_uuid';
const DATA_STEPS = 8; // pasii de colectare date (1..8)

const ORASE = ['București', 'Cluj', 'Timișoara', 'Iași', 'Constanța', 'Brașov', 'Sat / la țară', 'Altul'];
const STILURI = ['Clasic', 'Boutique', 'Rustic', 'Modern', 'Tradițional', 'Nehotărât'];
const BUGET_GAME = [
  { value: '15.000 - 25.000 EUR', label: '15.000 - 25.000 EUR' },
  { value: '25.000 - 35.000 EUR', label: '25.000 - 35.000 EUR' },
  { value: '35.000 - 50.000 EUR', label: '35.000 - 50.000 EUR' },
  { value: 'peste 50.000 EUR', label: 'Peste 50.000 EUR' },
  { value: 'nehotărât', label: 'Încă nu știu' },
];
const DECIZII = ['Locația', 'Fotograf', 'Formație / DJ', 'Florar', 'Rochia', 'Wedding planner', 'Niciun furnizor'];
const NICIUN_FURNIZOR = 'Niciun furnizor';
const PRIORITATI: { key: keyof BudgetFormData['prioritati']; label: string }[] = [
  { key: 'locatie', label: 'Locație' },
  { key: 'mancare', label: 'Mâncare' },
  { key: 'atmosfera', label: 'Atmosferă (muzică, distracție)' },
  { key: 'decor', label: 'Decor' },
  { key: 'cazare', label: 'Cazare' },
];

const INITIAL: BudgetFormData = {
  numePartener1: '', numePartener2: '', dataNunta: '', oras: '', zona: '',
  invitati: 100, stil: '', bugetSuma: null, bugetGama: '',
  deciziLuate: [], prioritati: { locatie: 3, mancare: 3, atmosfera: 3, decor: 3, cazare: 3 },
  email: '', nume: '', telefon: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BudgetPlannerPage() {
  const { theme } = useTheme();
  const c = theme.colors;
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const submittedRef = useRef(false);

  // localStorage e sursa unica pentru datele formularului (pre-populare automata).
  const raw = useLocalStorageRaw(FORM_KEY);
  const data = useMemo<BudgetFormData>(() => {
    if (!raw) return INITIAL;
    try {
      const parsed = JSON.parse(raw);
      return { ...INITIAL, ...parsed, prioritati: { ...INITIAL.prioritati, ...(parsed.prioritati || {}) } };
    } catch {
      return INITIAL;
    }
  }, [raw]);

  const setData = useCallback((next: BudgetFormData) => {
    writeLocalStorage(FORM_KEY, JSON.stringify(next));
  }, []);

  const update = <K extends keyof BudgetFormData>(key: K, value: BudgetFormData[K]) => {
    setData({ ...data, [key]: value });
  };

  const toggleDecizie = (item: string) => {
    if (item === NICIUN_FURNIZOR) {
      setData({ ...data, deciziLuate: data.deciziLuate.includes(NICIUN_FURNIZOR) ? [] : [NICIUN_FURNIZOR] });
      return;
    }
    const without = data.deciziLuate.filter(d => d !== NICIUN_FURNIZOR);
    setData({
      ...data,
      deciziLuate: without.includes(item) ? without.filter(d => d !== item) : [...without, item],
    });
  };

  const submit = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/budget-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Eroare server (${res.status}).`);
      }
      const result = await res.json();
      localStorage.setItem(RESULT_KEY, JSON.stringify(result));
      if (result.lead_uuid) {
        localStorage.setItem(LEAD_UUID_KEY, result.lead_uuid);
      }
      router.push('/budget-planner/rezultate');
    } catch (e: unknown) {
      submittedRef.current = false;
      setError(e instanceof Error ? e.message : 'A apărut o eroare. Încearcă din nou.');
    }
  }, [data, router]);

  // Declanseaza generarea cand ajungem la pasul de loading
  useEffect(() => {
    if (step === 9 && !submittedRef.current) {
      submittedRef.current = true;
      submit();
    }
  }, [step, submit]);

  const canContinue = (): boolean => {
    switch (step) {
      case 1: return data.numePartener1.trim() !== '' && data.numePartener2.trim() !== '';
      case 2: return data.oras !== '';
      case 3: return data.invitati >= 30;
      case 4: return data.stil !== '';
      case 5: return (data.bugetSuma != null && data.bugetSuma > 0) || data.bugetGama !== '';
      case 6: return data.deciziLuate.length > 0;
      case 7: return true;
      case 8: return EMAIL_RE.test(data.email);
      default: return true;
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 640 }}>
        {/* Progress bar - doar pe pasii de date */}
        {step >= 1 && step <= DATA_STEPS && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: c.textSecondary, fontSize: 13 }}>
              <span>Pasul {step} din {DATA_STEPS}</span>
              <span>{Math.round((step / DATA_STEPS) * 100)}%</span>
            </div>
            <div style={{ height: 6, background: c.surfaceHighlight, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(step / DATA_STEPS) * 100}%`, background: c.primary, borderRadius: 999, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}

        {/* PAS 0 - Welcome */}
        {step === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 48 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💍</div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: c.textPrimary, marginBottom: 16 }}>AI Budget Planner</h1>
            <p style={{ fontSize: 17, color: c.textSecondary, lineHeight: 1.6, marginBottom: 8, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
              Spune-ne despre nunta voastră și primești un plan de buget <strong style={{ color: c.primary }}>brutal de cinstit</strong>, bazat pe prețurile reale din România 2026.
            </p>
            <p style={{ fontSize: 14, color: c.textTertiary, marginBottom: 40 }}>Fără păreri vagi. Doar cifre și recomandări concrete.</p>
            <button onClick={() => setStep(1)} style={primaryBtn(c)}>Începe (5 minute)</button>
          </div>
        )}

        {/* PAS 1 - Nume */}
        {step === 1 && (
          <StepShell title="Cum vă numiți?" subtitle="Ca să personalizăm planul vostru.">
            <Field label="Numele tău *" c={c}>
              <input style={inputStyle(c)} value={data.numePartener1} onChange={e => update('numePartener1', e.target.value)} placeholder="ex: Andrei" />
            </Field>
            <Field label="Numele partenerei / partenerului *" c={c}>
              <input style={inputStyle(c)} value={data.numePartener2} onChange={e => update('numePartener2', e.target.value)} placeholder="ex: Maria" />
            </Field>
            <Field label="Data nunții (opțional)" c={c}>
              <input type="date" style={inputStyle(c)} value={data.dataNunta} onChange={e => update('dataNunta', e.target.value)} />
            </Field>
          </StepShell>
        )}

        {/* PAS 2 - Oras */}
        {step === 2 && (
          <StepShell title="Unde va fi nunta?" subtitle="Alege orașul sau zona.">
            <CardGrid>
              {ORASE.map(o => (
                <ChoiceCard key={o} label={o} selected={data.oras === o} onClick={() => update('oras', o)} c={c} />
              ))}
            </CardGrid>
          </StepShell>
        )}

        {/* PAS 3 - Invitati */}
        {step === 3 && (
          <StepShell title="Câți invitați?" subtitle="Cel mai important factor pentru buget.">
            <div style={{ textAlign: 'center', margin: '24px 0' }}>
              <div style={{ fontSize: 52, fontWeight: 800, color: c.primary }}>{data.invitati}</div>
              <div style={{ color: c.textSecondary }}>invitați</div>
            </div>
            <input
              type="range" min={30} max={400} step={5}
              value={data.invitati}
              onChange={e => update('invitati', parseInt(e.target.value))}
              style={{ width: '100%', accentColor: c.primary }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: c.textTertiary, fontSize: 13, marginTop: 8 }}>
              <span>30</span><span>400</span>
            </div>
          </StepShell>
        )}

        {/* PAS 4 - Stil */}
        {step === 4 && (
          <StepShell title="Ce stil vă doriți?" subtitle="Alege vibe-ul evenimentului.">
            <CardGrid>
              {STILURI.map(s => (
                <ChoiceCard key={s} label={s} selected={data.stil === s} onClick={() => update('stil', s)} c={c} />
              ))}
            </CardGrid>
          </StepShell>
        )}

        {/* PAS 5 - Buget */}
        {step === 5 && (
          <StepShell title="Ce buget aveți în minte?" subtitle="Scrie o sumă exactă SAU alege o gamă.">
            <Field label="Sumă exactă (EUR)" c={c}>
              <input
                type="number" style={inputStyle(c)}
                value={data.bugetSuma ?? ''}
                onChange={e => {
                  const v = e.target.value;
                  setData({ ...data, bugetSuma: v ? parseInt(v) : null, bugetGama: v ? '' : data.bugetGama });
                }}
                placeholder="ex: 30000"
              />
            </Field>
            <div style={{ textAlign: 'center', color: c.textTertiary, margin: '8px 0 16px' }}>— sau —</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {BUGET_GAME.map(g => (
                <ChoiceCard
                  key={g.value} label={g.label} selected={data.bugetGama === g.value}
                  onClick={() => setData({ ...data, bugetGama: g.value, bugetSuma: null })}
                  c={c} full
                />
              ))}
            </div>
          </StepShell>
        )}

        {/* PAS 6 - Decizii luate */}
        {step === 6 && (
          <StepShell title="Ce ați decis deja?" subtitle="Bifează furnizorii pe care i-ai ales (poți alege mai mulți).">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {DECIZII.map(d => (
                <Chip key={d} label={d} selected={data.deciziLuate.includes(d)} onClick={() => toggleDecizie(d)} c={c} />
              ))}
            </div>
          </StepShell>
        )}

        {/* PAS 7 - Prioritati */}
        {step === 7 && (
          <StepShell title="Ce contează cel mai mult?" subtitle="De la 1 (puțin) la 5 (foarte important).">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 8 }}>
              {PRIORITATI.map(p => (
                <div key={p.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: c.textPrimary, fontWeight: 600 }}>{p.label}</span>
                    <span style={{ color: c.primary, fontWeight: 700 }}>{data.prioritati[p.key]}/5</span>
                  </div>
                  <input
                    type="range" min={1} max={5} step={1}
                    value={data.prioritati[p.key]}
                    onChange={e => update('prioritati', { ...data.prioritati, [p.key]: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: c.primary }}
                  />
                </div>
              ))}
            </div>
          </StepShell>
        )}

        {/* PAS 8 - Contact */}
        {step === 8 && (
          <StepShell title="Unde trimitem planul?" subtitle="Emailul e obligatoriu. Restul, opțional.">
            <Field label="Email *" c={c}>
              <input type="email" style={inputStyle(c)} value={data.email} onChange={e => update('email', e.target.value)} placeholder="nume@email.com" />
            </Field>
            <Field label="Nume (opțional)" c={c}>
              <input style={inputStyle(c)} value={data.nume ?? ''} onChange={e => update('nume', e.target.value)} placeholder="Numele tău" />
            </Field>
            <Field label="Telefon (opțional)" c={c}>
              <input type="tel" style={inputStyle(c)} value={data.telefon ?? ''} onChange={e => update('telefon', e.target.value)} placeholder="+40 7xx xxx xxx" />
            </Field>
          </StepShell>
        )}

        {/* PAS 9 - Loading / Eroare */}
        {step === 9 && (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            {error ? (
              <>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: c.textPrimary, marginBottom: 12 }}>Ceva n-a mers</h2>
                <p style={{ color: c.textSecondary, marginBottom: 32, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>{error}</p>
                <button onClick={() => { submittedRef.current = true; submit(); }} style={primaryBtn(c)}>Încearcă din nou</button>
              </>
            ) : (
              <>
                <div style={{ width: 56, height: 56, border: `4px solid ${c.surfaceHighlight}`, borderTopColor: c.primary, borderRadius: '50%', margin: '0 auto 24px', animation: 'evenvy-spin 0.9s linear infinite' }} />
                <h2 style={{ fontSize: 22, fontWeight: 700, color: c.textPrimary, marginBottom: 12 }}>Analizăm bugetul vostru...</h2>
                <p style={{ color: c.textSecondary }}>Durează 5-10 secunde. Calculăm cifrele reale pentru {data.invitati} invitați.</p>
                <style>{`@keyframes evenvy-spin { to { transform: rotate(360deg); } }`}</style>
              </>
            )}
          </div>
        )}

        {/* Navigare */}
        {step >= 1 && step <= DATA_STEPS && (
          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <button onClick={() => setStep(step - 1)} style={secondaryBtn(c)}>Înapoi</button>
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canContinue()}
              style={{ ...primaryBtn(c), flex: 1, opacity: canContinue() ? 1 : 0.4, cursor: canContinue() ? 'pointer' : 'not-allowed' }}
            >
              {step === DATA_STEPS ? 'Generează planul' : 'Continuă'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ----- Componente / stiluri reutilizabile -----

type Colors = ReturnType<typeof useTheme>['theme']['colors'];

function StepShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: c.textPrimary, marginBottom: 6 }}>{title}</h2>
      {subtitle && <p style={{ color: c.textSecondary, marginBottom: 24 }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function Field({ label, c, children }: { label: string; c: Colors; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8, fontSize: 14 }}>{label}</label>
      {children}
    </div>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>{children}</div>;
}

function ChoiceCard({ label, selected, onClick, c, full }: { label: string; selected: boolean; onClick: () => void; c: Colors; full?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: full ? '100%' : undefined,
        padding: '18px 16px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 15,
        border: `2px solid ${selected ? c.primary : c.border}`,
        background: selected ? `${c.primary}1A` : c.surface,
        color: selected ? c.primary : c.textPrimary,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

function Chip({ label, selected, onClick, c }: { label: string; selected: boolean; onClick: () => void; c: Colors }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 20px', borderRadius: 999, cursor: 'pointer', fontWeight: 600, fontSize: 15,
        border: `2px solid ${selected ? c.primary : c.border}`,
        background: selected ? c.primary : c.surface,
        color: selected ? c.background : c.textPrimary,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

function inputStyle(c: Colors): React.CSSProperties {
  return {
    width: '100%', padding: 14, borderRadius: 10, border: `1px solid ${c.border}`,
    background: c.surfaceHighlight, color: c.textPrimary, fontSize: 16, boxSizing: 'border-box',
  };
}

function primaryBtn(c: Colors): React.CSSProperties {
  return {
    padding: '16px 32px', borderRadius: 999, border: 'none', background: c.primary,
    color: c.background, fontSize: 17, fontWeight: 700, cursor: 'pointer',
  };
}

function secondaryBtn(c: Colors): React.CSSProperties {
  return {
    padding: '16px 24px', borderRadius: 999, border: `1px solid ${c.border}`, background: 'transparent',
    color: c.textPrimary, fontSize: 16, fontWeight: 600, cursor: 'pointer',
  };
}
