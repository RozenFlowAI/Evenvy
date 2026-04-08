'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { apiCall, Venue, EVENT_TYPE_LABELS } from '@/lib/api';
import VenueCard from '@/components/VenueCard';

const EVENT_ICONS: Record<string, string> = {
  wedding: '💍',
  baptism: '🕯️',
  corporate: '🏢',
  civil_wedding: '📜',
  party: '🎉',
  birthday: '🎂',
  conference: '🎤',
};

export default function HomePage() {
  const { theme } = useTheme();
  const c = theme.colors;
  const [venues, setVenues] = useState<Venue[]>([]);
  const [promoted, setPromoted] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiCall('/venues?sort_by=recommended&limit=6'),
      apiCall('/venues/promoted'),
    ])
      .then(([v, p]) => {
        setVenues(v);
        setPromoted(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const eventTypes = Object.entries(EVENT_TYPE_LABELS);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: `linear-gradient(135deg, ${c.surface} 0%, ${c.background} 100%)`,
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 48, fontWeight: 700, color: c.textPrimary, marginBottom: 16 }}>
            Găsește locația perfectă pentru <span style={{ color: c.primary }}>evenimentul tău</span>
          </h1>
          <p style={{ fontSize: 20, color: c.textSecondary, marginBottom: 32 }}>
            Marketplace cu sute de locații pentru nunți, botezuri, petreceri corporate și multe altele.
          </p>
          <Link
            href="/search"
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
            Caută locații
          </Link>
        </div>
      </section>

      {/* Event Types */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, color: c.textPrimary, marginBottom: 32, textAlign: 'center' }}>
          Ce tip de eveniment planifici?
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 16,
          }}
        >
          {eventTypes.map(([id, label]) => (
            <Link
              key={id}
              href={`/search?event_type=${id}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                padding: 24,
                background: c.surface,
                borderRadius: 12,
                border: `1px solid ${c.primary}40`,
                textDecoration: 'none',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = c.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = `${c.primary}40`;
              }}
            >
              <span style={{ fontSize: 32 }}>{EVENT_ICONS[id]}</span>
              <span style={{ color: c.textPrimary, fontWeight: 500 }}>{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Promoted Venues */}
      {promoted.length > 0 && (
        <section style={{ background: c.surface, padding: '64px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
              <span style={{ fontSize: 24 }}>⭐</span>
              <h2 style={{ fontSize: 28, fontWeight: 600, color: c.textPrimary }}>Locații Recomandate</h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 24,
              }}
            >
              {promoted.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Venues */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 600, color: c.textPrimary }}>Locații Populare</h2>
          <Link href="/search" style={{ color: c.primary, textDecoration: 'none', fontWeight: 500 }}>
            Vezi toate →
          </Link>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: c.surface, borderRadius: 12, height: 280 }} className="skeleton" />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 24,
            }}
          >
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section
        style={{
          background: `linear-gradient(135deg, ${c.primary}20 0%, ${c.surface} 100%)`,
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: 32, fontWeight: 600, color: c.textPrimary, marginBottom: 16 }}>
          Ești proprietar de locație?
        </h2>
        <p style={{ fontSize: 18, color: c.textSecondary, marginBottom: 32 }}>
          Listează-ți locația gratuit și primește cereri de ofertă de la clienți.
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
          Înregistrează-te ca proprietar
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ background: c.surface, borderTop: `1px solid ${c.border}`, padding: '48px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 24, color: c.primary }}>◆</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: c.textPrimary }}>Evenvy</span>
            </div>
            <p style={{ color: c.textSecondary, fontSize: 14 }}>Marketplace pentru locații de evenimente în România</p>
          </div>
          <div style={{ display: 'flex', gap: 48 }}>
            <div>
              <h4 style={{ color: c.textPrimary, fontWeight: 600, marginBottom: 12 }}>Categorii</h4>
              {eventTypes.slice(0, 4).map(([id, label]) => (
                <Link key={id} href={`/search?event_type=${id}`} style={{ display: 'block', color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 8 }}>
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <h4 style={{ color: c.textPrimary, fontWeight: 600, marginBottom: 12 }}>Legal</h4>
              <Link href="/terms" style={{ display: 'block', color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 8 }}>Termeni și condiții</Link>
              <Link href="/privacy" style={{ display: 'block', color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 8 }}>Politica de confidențialitate</Link>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '32px auto 0', paddingTop: 24, borderTop: `1px solid ${c.border}`, textAlign: 'center' }}>
          <p style={{ color: c.textTertiary, fontSize: 14 }}>© 2025 Evenvy. Toate drepturile rezervate.</p>
        </div>
      </footer>
    </div>
  );
}
