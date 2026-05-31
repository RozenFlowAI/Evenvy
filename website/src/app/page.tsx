'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

const GOLD = '#D4AF37';

const EVENT_TYPES = [
  { id: 'wedding', icon: '💍', label: 'Nuntă', active: true },
  { id: 'baptism', icon: '🕯️', label: 'Botez', active: false },
  { id: 'corporate', icon: '🏢', label: 'Corporate', active: false },
  { id: 'birthday', icon: '🎂', label: 'Aniversare', active: false },
  { id: 'party', icon: '🎉', label: 'Petrecere', active: false },
  { id: 'conference', icon: '🎤', label: 'Conferință', active: false },
  { id: 'civil_wedding', icon: '📜', label: 'Cununie', active: false },
];

const STEPS = [
  { n: '1', title: 'Completezi formularul', desc: '8 întrebări simple despre nunta voastră — oraș, invitați, stil, buget.' },
  { n: '2', title: 'AI-ul analizează', desc: 'Evenvy AI calculează costurile reale bazat pe datele de piață România 2026.' },
  { n: '3', title: 'Primești planul complet', desc: 'Verdict brutal cinstit, distribuție pe categorii, sfaturi și plan de acțiune.' },
];

const WHY_EVENVY = [
  { icon: '📊', title: 'Prețuri reale 2026', desc: 'Fără estimări vagi — folosim date reale din piața românească.' },
  { icon: '🎯', title: 'Verdict brutal cinstit', desc: 'Dacă bugetul nu e realist, îți spunem direct. Fără înflorituri.' },
  { icon: '⚡', title: 'Rezultat în 10 secunde', desc: 'Plan complet cu distribuție și sfaturi în sub 10 secunde.' },
  { icon: '🔗', title: 'Distribuie cu partenerul', desc: 'Link public de share — trimite-i partenerului tău fără cont necesar.' },
];

const TESTIMONIALS = [
  { text: 'Am intrat cu convingerea că 20.000 EUR ajung. Evenvy AI mi-a arătat că pentru 150 de invitați în București trebuie cel puțin 32.000. Dureros, dar necesar.', author: 'Andrei & Maria, București' },
  { text: 'Planul de acțiune m-a ajutat enorm. Știam ce să rezerv urgent și ce putea să aștepte. Am economisit 4.000 EUR față de primul buget.', author: 'Cristina & Dan, Cluj' },
  { text: 'Sfaturile brutale m-au deranjat pe moment, dar aveam dreptate. Am tăiat din decor și am pus banii în mâncare — oaspeții au observat.', author: 'Ioana & Mihai, Timișoara' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evenvy.onrender.com/api';

export default function HomePage() {
  const { theme } = useTheme();
  const c = theme.colors;
  const [modalType, setModalType] = useState<{ id: string; label: string } | null>(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const openModal = (id: string, label: string) => {
    setModalType({ id, label });
    setEmail('');
    setSuccess(false);
    setError('');
  };
  const closeModal = () => setModalType(null);

  const handleWaitlist = async (e: React.FormEvent) => {
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
      if (!res.ok) throw new Error('Eroare server. Încearcă din nou.');
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'A apărut o eroare.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* A — Hero */}
      <section style={{ padding: '80px 24px 64px', textAlign: 'center', background: `linear-gradient(160deg, ${c.surface} 0%, ${c.background} 60%)` }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: `${GOLD}22`, color: GOLD, padding: '5px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, marginBottom: 20, letterSpacing: 0.5 }}>
            AI PLANNER PENTRU NUNTĂ
          </div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: c.textPrimary, lineHeight: 1.15, marginBottom: 20 }}>
            Știi exact cât costă{' '}
            <span style={{ color: GOLD }}>nunta ta?</span>
          </h1>
          <p style={{ fontSize: 'clamp(16px,2vw,19px)', color: c.textSecondary, lineHeight: 1.65, marginBottom: 36, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Evenvy AI îți face un plan de buget <strong style={{ color: c.textPrimary }}>brutal de cinstit</strong>, bazat pe prețurile reale din România 2026. Fără cifre vagi, fără surprize.
          </p>
          <Link
            href="/budget-planner"
            style={{ display: 'inline-block', background: GOLD, color: '#0f0f10', padding: '18px 48px', borderRadius: 999, fontSize: 18, fontWeight: 800, textDecoration: 'none', letterSpacing: 0.2 }}
          >
            Calculează bugetul gratuit
          </Link>
          <p style={{ color: c.textTertiary, fontSize: 13, marginTop: 14 }}>5 minute · fără cont · rezultat instant</p>
        </div>
      </section>

      {/* B — Tipuri de evenimente */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: c.textPrimary, textAlign: 'center', marginBottom: 32 }}>
          Ce eveniment planifici?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
          {EVENT_TYPES.map(ev =>
            ev.active ? (
              <Link
                key={ev.id}
                href="/budget-planner"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '22px 16px', background: `${GOLD}15`, border: `2px solid ${GOLD}`, borderRadius: 14, textDecoration: 'none', position: 'relative' }}
              >
                <span style={{ fontSize: 30 }}>{ev.icon}</span>
                <span style={{ color: c.textPrimary, fontWeight: 700, fontSize: 14 }}>{ev.label}</span>
                <span style={{ position: 'absolute', top: 8, right: 8, background: GOLD, color: '#0f0f10', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 999, letterSpacing: 0.4 }}>ACTIV</span>
              </Link>
            ) : (
              <button
                key={ev.id}
                onClick={() => openModal(ev.id, ev.label)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '22px 16px', background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, cursor: 'pointer', position: 'relative', fontFamily: 'inherit' }}
              >
                <span style={{ fontSize: 30 }}>{ev.icon}</span>
                <span style={{ color: c.textPrimary, fontWeight: 600, fontSize: 14 }}>{ev.label}</span>
                <span style={{ position: 'absolute', top: 8, right: 8, background: `${c.textTertiary}22`, color: c.textTertiary, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 999, letterSpacing: 0.4 }}>ÎN CURÂND</span>
              </button>
            )
          )}
        </div>
      </section>

      {/* C — Cum funcționează */}
      <section style={{ background: c.surface, padding: '72px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: c.textPrimary, textAlign: 'center', marginBottom: 48 }}>
            Cum funcționează?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            {STEPS.map(s => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${GOLD}22`, border: `2px solid ${GOLD}`, color: GOLD, fontSize: 20, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {s.n}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: c.textPrimary, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: c.textSecondary, fontSize: 14, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link
              href="/budget-planner"
              style={{ display: 'inline-block', background: GOLD, color: '#0f0f10', padding: '15px 40px', borderRadius: 999, fontWeight: 800, textDecoration: 'none', fontSize: 16 }}
            >
              Începe acum — e gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* D — De ce Evenvy */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: c.textPrimary, textAlign: 'center', marginBottom: 40 }}>
          De ce Evenvy AI?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
          {WHY_EVENVY.map(w => (
            <div key={w.icon} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, padding: '24px 20px' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{w.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: c.textPrimary, marginBottom: 8 }}>{w.title}</h3>
              <p style={{ color: c.textSecondary, fontSize: 14, lineHeight: 1.6 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* E — Testimoniale */}
      <section style={{ background: c.surface, padding: '72px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: c.textPrimary, textAlign: 'center', marginBottom: 40 }}>
            Ce spun cuplurile
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: c.background, border: `1px solid ${c.border}`, borderRadius: 14, padding: 24, borderTop: `3px solid ${GOLD}` }}>
                <p style={{ color: c.textPrimary, lineHeight: 1.7, marginBottom: 16, fontSize: 14 }}>"{t.text}"</p>
                <p style={{ color: GOLD, fontSize: 13, fontWeight: 700 }}>{t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* F — Pentru furnizori */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: `${c.textTertiary}18`, color: c.textTertiary, padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 20, letterSpacing: 0.5 }}>
            PENTRU FURNIZORI
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: c.textPrimary, marginBottom: 16 }}>
            Ești fotograf, DJ, florar sau wedding planner?
          </h2>
          <p style={{ color: c.textSecondary, fontSize: 16, lineHeight: 1.65, marginBottom: 32, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            Construim o platformă pentru furnizori unde cuplurile te vor găsi direct. Fii printre primii înscriși.
          </p>
          <button
            onClick={() => openModal('furnizori', 'Furnizori')}
            style={{ background: 'transparent', border: `2px solid ${GOLD}`, color: GOLD, padding: '14px 36px', borderRadius: 999, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Înscrie-te ca furnizor
          </button>
        </div>
      </section>

      {/* G — Final CTA */}
      <section style={{ background: `linear-gradient(135deg, ${GOLD}18 0%, ${c.surface} 100%)`, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, color: c.textPrimary, marginBottom: 16 }}>
            Pregătit să știi adevărul?
          </h2>
          <p style={{ color: c.textSecondary, fontSize: 17, lineHeight: 1.65, marginBottom: 36 }}>
            Planul tău de buget te așteaptă. Brutal, cinstit, gratuit.
          </p>
          <Link
            href="/budget-planner"
            style={{ display: 'inline-block', background: GOLD, color: '#0f0f10', padding: '18px 52px', borderRadius: 999, fontSize: 18, fontWeight: 800, textDecoration: 'none' }}
          >
            Calculează bugetul
          </Link>
        </div>
      </section>

      {/* H — Footer */}
      <footer style={{ background: c.surface, borderTop: `1px solid ${c.border}`, padding: '48px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: GOLD }}>Evenvy</span>
            </div>
            <p style={{ color: c.textSecondary, fontSize: 14, maxWidth: 220, lineHeight: 1.6 }}>Primul AI planner pentru nunți din România.</p>
          </div>
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ color: c.textPrimary, fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Planificare</h4>
              <Link href="/budget-planner" style={{ display: 'block', color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 8 }}>AI Budget Planner</Link>
              <span style={{ display: 'block', color: c.textTertiary, fontSize: 14, marginBottom: 8 }}>Fotografi (în curând)</span>
              <span style={{ display: 'block', color: c.textTertiary, fontSize: 14, marginBottom: 8 }}>Florari (în curând)</span>
              <span style={{ display: 'block', color: c.textTertiary, fontSize: 14 }}>DJ & Muzică (în curând)</span>
            </div>
            <div>
              <h4 style={{ color: c.textPrimary, fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Legal</h4>
              <Link href="/despre" style={{ display: 'block', color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 8 }}>Despre Evenvy</Link>
              <Link href="/contact" style={{ display: 'block', color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 8 }}>Contact</Link>
              <Link href="/terms" style={{ display: 'block', color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 8 }}>Termeni și condiții</Link>
              <Link href="/privacy" style={{ display: 'block', color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 8 }}>Politica de confidențialitate</Link>
              <Link href="/cookies" style={{ display: 'block', color: c.textSecondary, textDecoration: 'none', fontSize: 14 }}>Politica de cookies</Link>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: '24px auto 0', paddingTop: 24, borderTop: `1px solid ${c.border}`, textAlign: 'center' }}>
          <p style={{ color: c.textTertiary, fontSize: 13 }}>© 2026 Evenvy. Toate drepturile rezervate.</p>
        </div>
      </footer>

      {/* Waitlist modal */}
      {modalType && (
        <div
          onClick={closeModal}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: c.surface, borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', border: `1px solid ${c.border}` }}
          >
            {success ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: c.textPrimary, marginBottom: 10 }}>Te-am înscris!</h2>
                <p style={{ color: c.textSecondary, lineHeight: 1.6, marginBottom: 24 }}>
                  Te anunțăm pe email când lansăm <strong style={{ color: GOLD }}>{modalType.label}</strong>.
                </p>
                <button onClick={closeModal} style={{ background: GOLD, color: '#0f0f10', border: 'none', padding: '12px 32px', borderRadius: 999, fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
                  Închide
                </button>
              </div>
            ) : (
              <form onSubmit={handleWaitlist}>
                <div style={{ display: 'inline-block', background: `${c.textTertiary}22`, color: c.textTertiary, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, marginBottom: 14, letterSpacing: 0.5 }}>ÎN CURÂND</div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: c.textPrimary, marginBottom: 8 }}>{modalType.label}</h2>
                <p style={{ color: c.textSecondary, marginBottom: 22, lineHeight: 1.6, fontSize: 14 }}>
                  Înscrie-te și vei fi printre primii care primesc acces când lansăm.
                </p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: c.textSecondary, marginBottom: 6 }}>Email *</label>
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="email@exemplu.com"
                    style={{ width: '100%', padding: 12, borderRadius: 8, border: `1px solid ${c.border}`, background: c.surfaceHighlight, color: c.textPrimary, fontSize: 15, boxSizing: 'border-box' }}
                  />
                </div>
                {error && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 14, padding: 10, background: '#EF444415', borderRadius: 8 }}>{error}</div>}
                <button
                  type="submit" disabled={submitting}
                  style={{ width: '100%', padding: 14, borderRadius: 999, border: 'none', background: GOLD, color: '#0f0f10', fontSize: 15, fontWeight: 700, cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Se trimite...' : 'Înscrie-mă'}
                </button>
                <button type="button" onClick={closeModal} style={{ width: '100%', padding: 12, marginTop: 8, borderRadius: 999, border: 'none', background: 'transparent', color: c.textTertiary, fontSize: 14, cursor: 'pointer' }}>
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
