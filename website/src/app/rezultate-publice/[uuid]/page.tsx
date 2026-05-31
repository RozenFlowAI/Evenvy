import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BudgetResult, BudgetFormData } from '@/lib/budget-types';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evenvy.onrender.com/api';

interface PublicLeadResponse {
  ai_result: BudgetResult;
  form_data: Partial<BudgetFormData>;
}

async function getLead(uuid: string): Promise<PublicLeadResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/leads/${uuid}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ uuid: string }> }): Promise<Metadata> {
  const { uuid } = await params;
  const data = await getLead(uuid);
  if (!data) return { title: 'Plan negăsit | Evenvy' };
  const oras = data.form_data.oras || 'România';
  const invitati = data.form_data.invitati || '?';
  return {
    title: `Plan buget nuntă ${oras} · ${invitati} invitați | Evenvy AI`,
    description: data.ai_result.verdict?.slice(0, 160) ?? 'Plan de buget generat de Evenvy AI.',
  };
}

function fmt(n: number): string {
  return new Intl.NumberFormat('ro-RO').format(Math.round(n));
}

export default async function PublicRezultatePage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const data = await getLead(uuid);
  if (!data) notFound();

  const { ai_result: result, form_data: form } = data;
  const realist = result.buget_realist;
  const scor = Math.max(0, Math.min(10, result.scor_realism));
  const accentColor = realist ? '#22C55E' : '#EF4444';
  const gold = '#D4AF37';

  return (
    <div style={{ minHeight: '100vh', padding: '32px 16px', background: '#0f0f10', color: '#f5f5f5' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ color: gold, textDecoration: 'none', fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>
            Evenvy AI
          </Link>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 12, marginBottom: 4 }}>
            Plan de buget nuntă
          </h1>
          {form.oras && (
            <p style={{ color: '#aaa', fontSize: 15 }}>
              {form.oras}{form.invitati ? ` · ${form.invitati} invitați` : ''}
              {form.stil ? ` · stil ${form.stil}` : ''}
            </p>
          )}
        </div>

        {/* Verdict */}
        <div style={{ background: '#1a1a1b', border: `2px solid ${accentColor}`, borderRadius: 16, padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>{realist ? '✅' : '🚨'}</span>
            <span style={{ color: accentColor, fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {realist ? 'Buget realist' : 'Buget nerealist'}
            </span>
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.65, marginBottom: 20 }}>{result.verdict}</p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#888', fontSize: 13 }}>Total estimat</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: gold }}>
                {fmt(result.buget_total_min)} – {fmt(result.buget_total_max)} EUR
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: 13, marginBottom: 6 }}>
                <span>Scor realism</span>
                <span style={{ color: accentColor, fontWeight: 700 }}>{scor}/10</span>
              </div>
              <div style={{ height: 10, background: '#2a2a2c', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${scor * 10}%`, background: accentColor, borderRadius: 999 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Categorii */}
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Distribuția bugetului</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
          {result.categorii.map((cat, i) => (
            <div key={i} style={{ background: '#1a1a1b', border: '1px solid #2a2a2c', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{cat.nume}</span>
                <span style={{ color: gold, fontWeight: 700, fontSize: 13 }}>{cat.procent}%</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
                {fmt(cat.suma_min)} – {fmt(cat.suma_max)} EUR
              </div>
              {cat.nota && <p style={{ color: '#888', fontSize: 12, lineHeight: 1.5, margin: 0 }}>{cat.nota}</p>}
            </div>
          ))}
        </div>

        {/* Sfaturi */}
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Sfaturi brutale</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {result.sfaturi_brutale.map((s, i) => (
            <div key={i} style={{ background: '#1a1a1b', border: '1px solid #3a3000', borderRadius: 12, padding: 16, display: 'flex', gap: 12 }}>
              <span style={{ color: gold, fontWeight: 800 }}>{i + 1}.</span>
              <span style={{ lineHeight: 1.6, color: '#e5e5e5' }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Plan actiune */}
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Plan de acțiune</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 48 }}>
          {[
            { t: 'Urgent — 30 zile', v: result.plan_actiune.urgent_30_zile, col: '#EF4444' },
            { t: 'Lunile 2–4', v: result.plan_actiune.luna_2_4, col: '#F59E0B' },
            { t: 'Ultima lună', v: result.plan_actiune.final_luna, col: '#22C55E' },
          ].map((b, i) => (
            <div key={i} style={{ background: '#1a1a1b', border: '1px solid #2a2a2c', borderRadius: 12, padding: 18, borderTop: `3px solid ${b.col}` }}>
              <div style={{ color: b.col, fontWeight: 700, marginBottom: 10, fontSize: 13 }}>{b.t}</div>
              <p style={{ color: '#aaa', lineHeight: 1.6, margin: 0, fontSize: 13 }}>{b.v}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '32px 0', borderTop: '1px solid #2a2a2c' }}>
          <p style={{ color: '#888', marginBottom: 16, fontSize: 15 }}>
            Vrei un plan personalizat pentru nunta ta?
          </p>
          <Link
            href="/budget-planner"
            style={{ display: 'inline-block', background: gold, color: '#0f0f10', padding: '14px 40px', borderRadius: 999, fontWeight: 700, textDecoration: 'none', fontSize: 16 }}
          >
            Generează planul tău gratuit
          </Link>
          <p style={{ color: '#555', fontSize: 12, marginTop: 20 }}>Evenvy AI — planificator nuntă România 2026</p>
        </div>
      </div>
    </div>
  );
}
