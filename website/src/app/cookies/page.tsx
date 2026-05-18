'use client';

import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

export default function CookiesPage() {
  const { theme } = useTheme();
  const c = theme.colors;

  const sectionStyle = {
    background: c.surface,
    border: `1px solid ${c.border}`,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  };
  const h2Style = { fontSize: 20, fontWeight: 600, color: c.textPrimary, marginBottom: 12 };
  const pStyle = { color: c.textSecondary, lineHeight: 1.7, marginBottom: 12 };
  const liStyle = { color: c.textSecondary, lineHeight: 1.7, marginBottom: 8 };

  return (
    <div style={{ minHeight: '100vh', padding: '48px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link href="/" style={{ color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 16, display: 'inline-block' }}>
          Inapoi la pagina principala
        </Link>

        <h1 style={{ fontSize: 36, fontWeight: 700, color: c.textPrimary, marginBottom: 8 }}>
          Politica de Cookies
        </h1>
        <p style={{ color: c.textTertiary, marginBottom: 32, fontSize: 14 }}>
          Ultima actualizare: 17 mai 2026
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>1. Ce sunt cookie-urile</h2>
          <p style={pStyle}>
            Cookie-urile sunt fisiere de text mici stocate pe dispozitivul tau (calculator, telefon, tableta) atunci cand vizitezi un site web. Acestea ajuta site-ul sa retina informatii despre vizita ta.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>2. Ce cookie-uri folosim</h2>
          <p style={pStyle}>Pe Evenvy folosim urmatoarele tipuri de cookie-uri:</p>
          <ul style={{ paddingLeft: 20 }}>
            <li style={liStyle}>
              <strong style={{ color: c.textPrimary }}>Cookie-uri esentiale (obligatorii):</strong> sunt necesare pentru ca site-ul sa functioneze. Includ cookie-ul de autentificare (te tin logat) si preferinta de tema (light/dark).
            </li>
            <li style={liStyle}>
              <strong style={{ color: c.textPrimary }}>Cookie-uri de performanta:</strong> ne ajuta sa intelegem cum este folosit site-ul (pagini vizitate, timp petrecut). Datele sunt anonime.
            </li>
            <li style={liStyle}>
              <strong style={{ color: c.textPrimary }}>Cookie-uri terte (optionale):</strong> pentru analitice (Google Search Console). Folosite doar cu acordul tau.
            </li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>3. Cookie-uri specifice folosite</h2>
          <ul style={{ paddingLeft: 20 }}>
            <li style={liStyle}>
              <strong style={{ color: c.textPrimary }}>evenvy_token:</strong> cookie de autentificare, necesar pentru a te tine logat. Durata: 7 zile.
            </li>
            <li style={liStyle}>
              <strong style={{ color: c.textPrimary }}>evenvy_theme_pref:</strong> retine preferinta ta de tema (light/dark/sistem). Durata: permanent (pana stergi cookie-urile).
            </li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>4. Cum poti controla cookie-urile</h2>
          <p style={pStyle}>
            Poti dezactiva cookie-urile direct din setarile browser-ului tau. Atentie insa: daca dezactivezi cookie-urile esentiale, anumite functionalitati ale Platformei nu vor mai functiona corect (de exemplu, nu vei putea sa te loghezi).
          </p>
          <p style={pStyle}>Ghiduri pentru cele mai populare browsere:</p>
          <ul style={{ paddingLeft: 20 }}>
            <li style={liStyle}>Chrome: Setari - Confidentialitate si securitate - Cookies</li>
            <li style={liStyle}>Firefox: Optiuni - Confidentialitate si securitate</li>
            <li style={liStyle}>Safari: Preferinte - Confidentialitate</li>
            <li style={liStyle}>Edge: Setari - Cookies si permisiuni site</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>5. Modificari</h2>
          <p style={pStyle}>
            Aceasta politica poate fi actualizata. Te incurajam sa o consulti periodic pentru a fi la curent cu modificarile.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>6. Contact</h2>
          <p style={pStyle}>
            Pentru intrebari despre cookie-uri, contacteaza-ne la <strong style={{ color: c.textPrimary }}>contact@evenvy.ro</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
