'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { BudgetResult } from '@/lib/budget-types';
import { useLocalStorageRaw, removeLocalStorage } from '@/lib/use-local-storage';

const RESULT_KEY = 'evenvy_budget_result';
const FORM_KEY = 'evenvy_budget_form';
const LEAD_UUID_KEY = 'evenvy_lead_uuid';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://evenvy.ro';

function fmt(n: number): string {
  return new Intl.NumberFormat('ro-RO').format(Math.round(n));
}

export default function RezultatePage() {
  const { theme } = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const raw = useLocalStorageRaw(RESULT_KEY);
  const result = useMemo<BudgetResult | null>(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as BudgetResult;
    } catch {
      return null;
    }
  }, [raw]);

  // Daca nu exista rezultat salvat, redirect inapoi la formular.
  // Citire directa din localStorage (ruleaza doar pe client, dupa mount) => fara redirect prematur.
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(RESULT_KEY)) {
      router.replace('/budget-planner');
    }
  }, [router]);

  const startOver = () => {
    removeLocalStorage(RESULT_KEY);
    removeLocalStorage(FORM_KEY);
    router.push('/budget-planner');
  };

  if (!result) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: c.textSecondary }}>Se încarcă...</div>
      </div>
    );
  }

  const realist = result.buget_realist;
  const accent = realist ? c.success : c.error;
  const scor = Math.max(0, Math.min(10, result.scor_realism));

  return (
    <div style={{ minHeight: '100vh', padding: '32px 16px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: c.textPrimary, marginBottom: 24, textAlign: 'center' }}>
          Planul vostru de buget
        </h1>

        {/* VERDICT */}
        <div style={{ background: c.surface, border: `2px solid ${accent}`, borderRadius: 16, padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>{realist ? '✅' : '🚨'}</span>
            <span style={{ color: accent, fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {realist ? 'Buget realist' : 'Buget nerealist'}
            </span>
          </div>
          <p style={{ color: c.textPrimary, fontSize: 18, lineHeight: 1.6, marginBottom: 20 }}>{result.verdict}</p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ color: c.textTertiary, fontSize: 13 }}>Total estimat</div>
              <div style={{ color: c.textPrimary, fontSize: 24, fontWeight: 800 }}>
                {fmt(result.buget_total_min)} - {fmt(result.buget_total_max)} EUR
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: c.textTertiary, fontSize: 13, marginBottom: 6 }}>
                <span>Scor realism</span>
                <span style={{ color: accent, fontWeight: 700 }}>{scor}/10</span>
              </div>
              <div style={{ height: 10, background: c.surfaceHighlight, borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${scor * 10}%`, background: accent, borderRadius: 999 }} />
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORII */}
        <h2 style={{ fontSize: 20, fontWeight: 700, color: c.textPrimary, marginBottom: 16 }}>Distribuția bugetului</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
          {result.categorii.map((cat, i) => (
            <div key={i} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: c.textPrimary, fontWeight: 700 }}>{cat.nume}</span>
                <span style={{ color: c.primary, fontWeight: 700, fontSize: 14 }}>{cat.procent}%</span>
              </div>
              <div style={{ color: c.textPrimary, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                {fmt(cat.suma_min)} - {fmt(cat.suma_max)} EUR
              </div>
              {cat.nota && <p style={{ color: c.textSecondary, fontSize: 13, lineHeight: 1.5, margin: 0 }}>{cat.nota}</p>}
            </div>
          ))}
        </div>

        {/* SFATURI BRUTALE */}
        <h2 style={{ fontSize: 20, fontWeight: 700, color: c.textPrimary, marginBottom: 16 }}>Sfaturi brutale</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {result.sfaturi_brutale.map((s, i) => (
            <div key={i} style={{ background: `${c.warning}12`, border: `1px solid ${c.warning}55`, borderRadius: 12, padding: 16, display: 'flex', gap: 12 }}>
              <span style={{ color: c.warning, fontWeight: 800 }}>{i + 1}.</span>
              <span style={{ color: c.textPrimary, lineHeight: 1.6 }}>{s}</span>
            </div>
          ))}
        </div>

        {/* PLAN ACTIUNE */}
        <h2 style={{ fontSize: 20, fontWeight: 700, color: c.textPrimary, marginBottom: 16 }}>Plan de acțiune</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 40 }}>
          {[
            { t: 'Urgent - 30 zile', v: result.plan_actiune.urgent_30_zile, col: c.error },
            { t: 'Lunile 2-4', v: result.plan_actiune.luna_2_4, col: c.warning },
            { t: 'Ultima lună', v: result.plan_actiune.final_luna, col: c.success },
          ].map((b, i) => (
            <div key={i} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: 18, borderTop: `3px solid ${b.col}` }}>
              <div style={{ color: b.col, fontWeight: 700, marginBottom: 10, fontSize: 14 }}>{b.t}</div>
              <p style={{ color: c.textSecondary, lineHeight: 1.6, margin: 0, fontSize: 14 }}>{b.v}</p>
            </div>
          ))}
        </div>

        {/* SHARE */}
        {(() => {
          const leadUuid = typeof window !== 'undefined' ? localStorage.getItem(LEAD_UUID_KEY) : null;
          if (!leadUuid) return null;
          const shareUrl = `${SITE_URL}/rezultate-publice/${leadUuid}`;
          const handleCopy = () => {
            navigator.clipboard.writeText(shareUrl).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            });
          };
          return (
            <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: c.textPrimary, marginBottom: 8 }}>
                Distribuie planul partenerului tău
              </h2>
              <p style={{ color: c.textSecondary, fontSize: 14, marginBottom: 16 }}>
                Linkul de mai jos este public și nu conține date personale.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <code style={{ flex: 1, minWidth: 0, background: c.surfaceHighlight, border: `1px solid ${c.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: c.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {shareUrl}
                </code>
                <button
                  onClick={handleCopy}
                  style={{ flexShrink: 0, padding: '10px 20px', borderRadius: 8, border: 'none', background: copied ? c.success : c.primary, color: c.background, fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  {copied ? 'Copiat!' : 'Copiază linkul'}
                </button>
              </div>
            </div>
          );
        })()}

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={startOver}
            style={{ flex: 1, minWidth: 200, padding: 18, borderRadius: 999, border: `1px solid ${c.border}`, background: 'transparent', color: c.textPrimary, fontSize: 17, fontWeight: 600, cursor: 'pointer' }}
          >
            Începe iar
          </button>
        </div>
      </div>
    </div>
  );
}
