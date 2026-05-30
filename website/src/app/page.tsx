'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

const COMING_SOON_SERVICES = [
  { id: 'dj', label: 'DJ si Echipe Muzica', desc: 'Gaseste cel mai bun DJ pentru evenimentul tau' },
  { id: 'photographers', label: 'Fotografi si Videografi', desc: 'Imortalizeaza fiecare moment important' },
  { id: 'florists', label: 'Florari si Decoratori', desc: 'Transforma locatia intr-un loc magic' },
  { id: 'catering', label: 'Cofetarie si Catering', desc: 'Meniuri delicioase pentru toti invitatii' },
  { id: 'workforce', label: 'Echipe Setup si Curatenie', desc: 'Oameni de incredere pentru montaj si curatenie' },
  { id: 'planners', label: 'Wedding Planners', desc: 'Profesionisti care iti organizeaza tot' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evenvy.onrender.com/api';

export default function HomePage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const c = theme.colors;
  const [modalService, setModalService] = useState<{ id: string; label: string } | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const isOwner = user?.role === 'owner';

  const openModal = (service: { id: string; label: string }) => {
    setModalService(service);
    setSuccess(false);
    setError('');
    setEmail('');
    setName('');
  };

  const closeModal = () => {
    setModalService(null);
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalService) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || null,
          service: modalService.id,
          source: 'homepage',
        }),
      });
      if (!res.ok) throw new Error('A aparut o eroare. Incearca din nou.');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'A aparut o eroare');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
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

      <section
        style={{
          background: `linear-gradient(135deg, ${c.surface} 0%, ${c.background} 100%)`,
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: `${c.primary}20`, color: c.primary, padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, marginBottom: 16, letterSpacing: 0.5 }}>
              COMING SOON
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: c.textPrimary, marginBottom: 12 }}>
              Evenvy creste - iata ce urmeaza
            </h2>
            <p style={{ fontSize: 17, color: c.textSecondary, maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
              In curand vei putea organiza orice tip de eveniment complet de pe Evenvy. Inscrie-te pe lista de asteptare pentru serviciul care te intereseaza si vei fi anuntat primul cand lansam.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {COMING_SOON_SERVICES.map((service) => (
              <button
                key={service.id}
                onClick={() => openModal({ id: service.id, label: service.label })}
                style={{
                  position: 'relative',
                  background: c.surface,
                  border: `1px solid ${c.border}`,
                  borderRadius: 16,
                  padding: 28,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: `${c.primary}20`,
                    color: c.primary,
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}
                >
                  COMING SOON
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: c.textPrimary, marginBottom: 8, marginTop: 16, paddingRight: 100 }}>
                  {service.label}
                </h3>
                <p style={{ color: c.textSecondary, fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
                  {service.desc}
                </p>
                <div style={{ color: c.primary, fontWeight: 600, fontSize: 14 }}>
                  Vreau sa fiu primul
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {!isOwner && (
        <section
          style={{
            background: `linear-gradient(135deg, ${c.primary}20 0%, ${c.surface} 100%)`,
            padding: '80px 24px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: 32, fontWeight: 600, color: c.textPrimary, marginBottom: 16 }}>
            Esti proprietar de locatie?
          </h2>
          <p style={{ fontSize: 18, color: c.textSecondary, marginBottom: 32 }}>
            Listeaza-ti locatia gratuit si primeste cereri de oferta de la clienti.
          </p>
          <Link
            href="/auth?role=owner"
            style={{
              display: 'inline-block',
              background: c.primary,
              color: c.background,
              padding: '14px 40px',
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Inregistreaza-te ca proprietar
          </Link>
        </section>
      )}

      {isOwner && (
        <section
          style={{
            background: `linear-gradient(135deg, ${c.primary}20 0%, ${c.surface} 100%)`,
            padding: '80px 24px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: 32, fontWeight: 600, color: c.textPrimary, marginBottom: 16 }}>
            Bun venit inapoi!
          </h2>
          <p style={{ fontSize: 18, color: c.textSecondary, marginBottom: 32 }}>
            Gestioneaza-ti locatiile si vezi cererile primite in Dashboard.
          </p>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-block',
              background: c.primary,
              color: c.background,
              padding: '14px 40px',
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Mergi la Dashboard
          </Link>
        </section>
      )}

      <footer style={{ background: c.surface, borderTop: `1px solid ${c.border}`, padding: '48px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: c.textPrimary }}>Evenvy</span>
            </div>
            <p style={{ color: c.textSecondary, fontSize: 14 }}>Tot ce ai nevoie pentru evenimentul tau perfect, intr-un singur loc</p>
          </div>
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
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

      {modalService && (
        <div
          onClick={closeModal}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: c.surface, borderRadius: 16, padding: 32, maxWidth: 480, width: '100%', border: `1px solid ${c.border}`, maxHeight: '90vh', overflow: 'auto' }}
          >
            {success ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 32, background: `${c.primary}20`, color: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, margin: '0 auto 16px' }}>
                  OK
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: c.textPrimary, marginBottom: 12 }}>Te-am inscris cu succes!</h2>
                <p style={{ color: c.textSecondary, lineHeight: 1.6, marginBottom: 24 }}>
                  Te anuntam pe email cand lansam <strong style={{ color: c.primary }}>{modalService.label}</strong>. Multumim ca ai incredere in noi!
                </p>
                <button
                  onClick={closeModal}
                  style={{ background: c.primary, color: c.background, border: 'none', padding: '12px 32px', borderRadius: 999, fontWeight: 600, cursor: 'pointer', fontSize: 15 }}
                >
                  Inchide
                </button>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit}>
                <div style={{ display: 'inline-block', background: `${c.primary}20`, color: c.primary, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, marginBottom: 16, letterSpacing: 0.5 }}>
                  COMING SOON
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: c.textPrimary, marginBottom: 8 }}>
                  {modalService.label}
                </h2>
                <p style={{ color: c.textSecondary, marginBottom: 24, lineHeight: 1.6 }}>
                  Te anuntam pe email cand lansam acest serviciu. Vei fi printre primii care primesc acces.
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

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, color: c.textSecondary, marginBottom: 6 }}>Nume (optional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ion Popescu"
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
                  {submitting ? 'Se trimite...' : 'Inscrie-ma in lista'}
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  style={{ width: '100%', padding: 12, marginTop: 8, borderRadius: 999, border: 'none', background: 'transparent', color: c.textTertiary, fontSize: 14, cursor: 'pointer' }}
                >
                  Anuleaza
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
