'use client';

import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

export default function DesprePage() {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <div style={{ minHeight: '100vh', padding: '48px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link href="/" style={{ color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 16, display: 'inline-block' }}>
          Inapoi la pagina principala
        </Link>

        <h1 style={{ fontSize: 36, fontWeight: 700, color: c.textPrimary, marginBottom: 16 }}>
          Despre Evenvy
        </h1>
        <p style={{ color: c.textSecondary, fontSize: 18, lineHeight: 1.6, marginBottom: 32 }}>
          Marketplace-ul roman pentru gasirea celei mai bune locatii pentru evenimentul tau.
        </p>

        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: c.textPrimary, marginBottom: 12 }}>
            Cine suntem
          </h2>
          <p style={{ color: c.textSecondary, lineHeight: 1.7, marginBottom: 12 }}>
            Evenvy este o platforma marketplace dezvoltata in Romania, care isi propune sa simplifice procesul prin care oamenii gasesc locatii pentru evenimentele lor: nunti, botezuri, petreceri corporate, aniversari sau alte tipuri de celebrari.
          </p>
          <p style={{ color: c.textSecondary, lineHeight: 1.7 }}>
            Proiectul a fost creat de Vlad Trandafir, cu scopul de a oferi un spatiu transparent unde proprietarii de locatii pot lista gratuit serviciile, iar clientii pot compara optiunile si pot solicita oferte personalizate.
          </p>
        </div>

        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: c.textPrimary, marginBottom: 12 }}>
            Misiunea noastra
          </h2>
          <p style={{ color: c.textSecondary, lineHeight: 1.7 }}>
            Vrem ca planificarea unui eveniment sa nu mai fie o povara. Sa gasesti locatia potrivita ar trebui sa fie usor, rapid si transparent. Pe Evenvy, comparam locatii, citim recenzii reale si comunicam direct cu proprietarii, fara comisioane ascunse.
          </p>
        </div>

        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: c.textPrimary, marginBottom: 12 }}>
            Pentru proprietari
          </h2>
          <p style={{ color: c.textSecondary, lineHeight: 1.7, marginBottom: 12 }}>
            Listarea locatiei este complet gratuita pentru primele 3 luni. Fara comisioane, fara abonament. Doar adaugi locatia, primesti cereri de oferta de la clienti interesati si te ocupi de restul.
          </p>
          <Link href="/auth?role=owner" style={{ color: c.primary, fontWeight: 600, textDecoration: 'none' }}>
            Inscrie-te ca proprietar
          </Link>
        </div>

        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: c.textPrimary, marginBottom: 12 }}>
            Date legale
          </h2>
          <div style={{ color: c.textSecondary, lineHeight: 1.8 }}>
            <p><strong style={{ color: c.textPrimary }}>Operator:</strong> Vlad Trandafir (persoana fizica)</p>
            <p><strong style={{ color: c.textPrimary }}>Sediul:</strong> Bucuresti, Romania</p>
            <p><strong style={{ color: c.textPrimary }}>Email contact:</strong> contact@evenvy.ro</p>
            <p><strong style={{ color: c.textPrimary }}>Telefon:</strong> +40 731 177 299</p>
          </div>
          <p style={{ color: c.textTertiary, fontSize: 13, marginTop: 16, fontStyle: 'italic' }}>
            Aceste date vor fi actualizate cand Evenvy va fi inregistrata oficial ca societate comerciala.
          </p>
        </div>

        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: c.textPrimary, marginBottom: 16 }}>
            Linkuri utile
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/contact" style={{ color: c.primary, textDecoration: 'none', fontSize: 16 }}>
              Pagina de contact
            </Link>
            <Link href="/terms" style={{ color: c.primary, textDecoration: 'none', fontSize: 16 }}>
              Termeni si conditii
            </Link>
            <Link href="/privacy" style={{ color: c.primary, textDecoration: 'none', fontSize: 16 }}>
              Politica de confidentialitate
            </Link>
            <Link href="/cookies" style={{ color: c.primary, textDecoration: 'none', fontSize: 16 }}>
              Politica de cookies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
