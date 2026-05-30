'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { EVENT_TYPE_LABELS } from '@/lib/api';

const EVENT_ICONS: Record<string, string> = {
  wedding: '💍',
  baptism: '🕯️',
  corporate: '🏢',
  civil_wedding: '📜',
  party: '🎉',
  birthday: '🎂',
  conference: '🎤',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evenvy.onrender.com/api';

export default function HomePage() {
  const { theme } = useTheme();
  const c = theme.colors;
  const [modalType, setModalType] = useState<{ id: string; label: string } | null>(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const openModal = (type: { id: string; label: string }) => {
    setModalType(type);
    setSuccess(false);
    setError('');
    setEmail('');
  };

  const closeModal = () => setModalType(null);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalType) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, service: modalType.id, source: 'homepage' }),
      });
      if (!res.ok) throw new Error('A apărut o eroare. Încearcă din nou.');
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'A apărut o eroare');
    } finally {
      setSubmitting(false);
    }
  };

  const eventTypes = Object.entries(EVENT_TYPE_LABELS);

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          background: `linear-gradient(135deg, ${c.surface} 0%, ${c.background} 100%)`,
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 48, fontWeight: 700, color: c.textPrimary, marginBottom: 16, lineHeight: 1.2 }}>
            Planifică nunta perfectă cu <span style={{ color: c.primary }}>bugetul potrivit</span>
          </h1>
          <p style={{ fontSize: 20, color: c.textSecondary, marginBottom: 32 }}>
            Calculatorul nostru AI îți spune exact cât costă nunta ta în România — fără surprize.
          </p>
          <Link
            href="/budget-planner"
            style={{
              display: 'inline-block',
              background: c.primary,
              color: c.background,
              padding: '16px 48px',
              borderRadius: 999,
              fontSize: 18,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Calculează bugetul
          </Link>
        </div>
      </section>

      {/* Event types grid */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, color: c.textPrimary, marginBottom: 8, textAlign: 'center' }}>
          Ce tip de eveniment planifici?
        </h2>
        <p style={{ color: c.textSecondary, textAlign: 'center', marginBottom: 32, fontSize: 16 }}>
          AI Planner pentru nunți e disponibil acum. Celelalte tipuri — în curând.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 16,
          }}
        >
          {eventTypes.map(([id, label]) => {
            if (id === 'wedding') {
              return (
                <Link
                  key={id}
                  href="/budget-planner"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                    padding: 24,
                    background: c.surface,
                    borderRadius: 12,
                    border: `2px solid ${c.primary}`,
                    textDecoration: 'none',
                  }}
                >
                  <span style={{ fontSize: 32 }}>{EVENT_ICONS[id]}</span>
                  <span style={{ color: c.textPrimary, fontWeight: 700 }}>{label}</span>
                  <span style={{ fontSize: 11, color: c.primary, fontWeight: 700, background: `${c.primary}18`, padding: '3px 10px', borderRadius: 999, letterSpacing: 0.3 }}>
                    DISPONIBIL
                  </span>
                </Link>
              );
            }
            return (
              <button
                key={id}
                onClick={() => openModal({ id, label })}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  padding: 24,
                  background: c.surface,
                  borderRadius: 12,
                  border: `1px solid ${c.border}`,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: 32, opacity: 0.55 }}>{EVENT_ICONS[id]}</span>
                <span style={{ color: c.textSecondary, fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 11, color: c.textTertiary, fontWeight: 700, background: c.surfaceHighlight, padding: '3px 10px', borderRadius: 999, letterSpacing: 0.3 }}>
                  COMING SOON
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* AI CTA section */}
      <section
        style={{
          background: `linear-gradient(135deg, ${c.primary}15 0%, ${c.surface} 100%)`,
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: c.textPrimary, marginBottom: 16, lineHeight: 1.35 }}>
            AI-ul nostru îți spune brutal de cinstit cât costă nunta ta
          </h2>
          <p style={{ fontSize: 17, color: c.textSecondary, marginBottom: 36, lineHeight: 1.7 }}>
            Fără estimări vagi. Fără surprize de ultim moment. Bazat pe prețurile reale din România în 2026.
          </p>
          <Link
            href="/budget-planner"
            style={{
              display: 'inline-block',
              background: c.primary,
              color: c.background,
              padding: '16px 40px',
              borderRadius: 999,
              fontSize: 17,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Începe planificarea cu AI →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: c.surface, borderTop: `1px solid ${c.border}`, padding: '48px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: c.textPrimary }}>Evenvy</span>
            </div>
            <p style={{ color: c.textSecondary, fontSize: 14 }}>Tot ce ai nevoie pentru evenimentul tău perfect, într-un singur loc</p>
          </div>
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ color: c.textPrimary, fontWeight: 600, marginBottom: 12 }}>Categorii</h4>
              {eventTypes.slice(0, 4).map(([id, label]) => (
                <Link
                  key={id}
                  href={`/search?event_type=${id}`}
                  style={{ display: 'block', color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 8 }}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <h4 style={{ color: c.textPrimary, fontWeight: 600, marginBottom: 12 }}>Legal</h4>
              <Link href="/despre" style={{ display: 'block', color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 8 }}>Despre Evenvy</Link>
              <Link href="/contact" style={{ display: 'block', color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 8 }}>Contact</Link>
              <Link href="/terms" style={{ display: 'block', color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 8 }}>Termeni si conditii</Link>
              <Link href="/privacy" style={{ display: 'block', color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 8 }}>Politica de confidentialitate</Link>
              <Link href="/cookies" style={{ display: 'block', color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 8 }}>Politica de cookies</Link>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '32px auto 0', paddingTop: 24, borderTop: `1px solid ${c.border}`, textAlign: 'center' }}>
          <p style={{ color: c.textTertiary, fontSize: 14 }}>2026 Evenvy. Toate drepturile rezervate.</p>
        </div>
      </footer>

      {/* Modal waitlist pentru tipuri de eveniment */}
      {modalType && (
        <div
          onClick={closeModal}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: c.surface, borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', border: `1px solid ${c.border}` }}
          >
            {success ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: c.textPrimary, marginBottom: 12 }}>Mulțumim!</h2>
                <p style={{ color: c.textSecondary, lineHeight: 1.6, marginBottom: 24 }}>
                  Te anunțăm când lansăm AI Planner pentru{' '}
                  <strong style={{ color: c.primary }}>{modalType.label}</strong>.
                </p>
                <button
                  onClick={closeModal}
                  style={{ background: c.primary, color: c.background, border: 'none', padding: '12px 32px', borderRadius: 999, fontWeight: 600, cursor: 'pointer', fontSize: 15 }}
                >
                  Închide
                </button>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit}>
                <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 16 }}>{EVENT_ICONS[modalType.id]}</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: c.textPrimary, marginBottom: 10, textAlign: 'center', lineHeight: 1.4 }}>
                  Suntem în curs de a lansa AI Planner pentru {modalType.label}
                </h2>
                <p style={{ color: c.textSecondary, marginBottom: 24, lineHeight: 1.6, textAlign: 'center' }}>
                  Lasă-ne email-ul și te anunțăm primul.
                </p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: c.textSecondary, marginBottom: 6 }}>Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplu.com"
                    style={{ width: '100%', padding: 12, borderRadius: 8, border: `1px solid ${c.border}`, background: c.surfaceHighlight, color: c.textPrimary, fontSize: 15, boxSizing: 'border-box' }}
                  />
                </div>
                {error && (
                  <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 16, padding: 10, background: '#EF444415', borderRadius: 8 }}>
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ width: '100%', padding: 14, borderRadius: 999, border: 'none', background: c.primary, color: c.background, fontSize: 15, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Se trimite...' : 'Anunță-mă'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ width: '100%', padding: 12, marginTop: 8, borderRadius: 999, border: 'none', background: 'transparent', color: c.textTertiary, fontSize: 14, cursor: 'pointer' }}
                >
                  Anulează
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
