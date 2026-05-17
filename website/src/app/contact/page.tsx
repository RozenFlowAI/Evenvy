'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

export default function ContactPage() {
  const { theme } = useTheme();
  const c = theme.colors;
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '48px 16px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Link href="/" style={{ color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 16, display: 'inline-block' }}>
          Inapoi la pagina principala
        </Link>

        <h1 style={{ fontSize: 36, fontWeight: 700, color: c.textPrimary, marginBottom: 8 }}>Contact</h1>
        <p style={{ color: c.textSecondary, marginBottom: 40, fontSize: 16 }}>
          Suntem aici sa te ajutam. Pentru orice intrebare, sugestie sau problema tehnica, contacteaza-ne.
        </p>

        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.primary, minWidth: 50 }}>TEL</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: c.textSecondary, marginBottom: 4 }}>Telefon</div>
            <a href="tel:+40731177299" style={{ fontSize: 18, color: c.textPrimary, textDecoration: 'none', fontWeight: 600 }}>
              +40 731 177 299
            </a>
            <div style={{ fontSize: 12, color: c.textTertiary, marginTop: 4 }}>Luni - Vineri, 9:00 - 18:00</div>
          </div>
          <button
            onClick={() => copyToClipboard('+40731177299', 'phone')}
            style={{ background: 'transparent', border: `1px solid ${c.border}`, borderRadius: 8, padding: '8px 14px', color: c.textSecondary, cursor: 'pointer', fontSize: 13 }}
          >
            {copied === 'phone' ? 'Copiat' : 'Copiaza'}
          </button>
        </div>

        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.primary, minWidth: 50 }}>MAIL</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: c.textSecondary, marginBottom: 4 }}>Email</div>
            <a href="mailto:contact@evenvy.ro" style={{ fontSize: 18, color: c.textPrimary, textDecoration: 'none', fontWeight: 600 }}>
              contact@evenvy.ro
            </a>
            <div style={{ fontSize: 12, color: c.textTertiary, marginTop: 4 }}>Raspundem in maxim 24h</div>
          </div>
          <button
            onClick={() => copyToClipboard('contact@evenvy.ro', 'email')}
            style={{ background: 'transparent', border: `1px solid ${c.border}`, borderRadius: 8, padding: '8px 14px', color: c.textSecondary, cursor: 'pointer', fontSize: 13 }}
          >
            {copied === 'email' ? 'Copiat' : 'Copiaza'}
          </button>
        </div>

        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: 24, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.primary, minWidth: 50 }}>WA</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: c.textSecondary, marginBottom: 4 }}>WhatsApp</div>
            <a
              href="https://wa.me/40731177299"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 18, color: c.textPrimary, textDecoration: 'none', fontWeight: 600 }}
            >
              Scrie-ne pe WhatsApp
            </a>
            <div style={{ fontSize: 12, color: c.textTertiary, marginTop: 4 }}>Raspuns rapid in timpul programului</div>
          </div>
        </div>

        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginBottom: 16 }}>Intrebari frecvente</h2>

          <details style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${c.border}` }}>
            <summary style={{ cursor: 'pointer', color: c.textPrimary, fontWeight: 500, padding: '8px 0' }}>
              Costa ceva sa listez o locatie?
            </summary>
            <p style={{ color: c.textSecondary, marginTop: 8, lineHeight: 1.6 }}>
              Nu, primele 3 luni sunt complet gratuite. Fara comisioane, fara abonament.
            </p>
          </details>

          <details style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${c.border}` }}>
            <summary style={{ cursor: 'pointer', color: c.textPrimary, fontWeight: 500, padding: '8px 0' }}>
              Cum primesc cereri de oferta?
            </summary>
            <p style={{ color: c.textSecondary, marginTop: 8, lineHeight: 1.6 }}>
              Dupa ce listezi locatia, clientii interesati pot trimite cereri prin platforma. Le vezi in Dashboard.
            </p>
          </details>

          <details style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${c.border}` }}>
            <summary style={{ cursor: 'pointer', color: c.textPrimary, fontWeight: 500, padding: '8px 0' }}>
              Pot sterge contul?
            </summary>
            <p style={{ color: c.textSecondary, marginTop: 8, lineHeight: 1.6 }}>
              Da, contacteaza-ne pe email si stergem contul in maxim 48h, conform GDPR.
            </p>
          </details>

          <details>
            <summary style={{ cursor: 'pointer', color: c.textPrimary, fontWeight: 500, padding: '8px 0' }}>
              Cine se ocupa de Evenvy?
            </summary>
            <p style={{ color: c.textSecondary, marginTop: 8, lineHeight: 1.6 }}>
              Evenvy este un proiect dezvoltat de Vlad Trandafir, cu scopul de a simplifica procesul de gasire a locatiilor pentru evenimente in Romania.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
