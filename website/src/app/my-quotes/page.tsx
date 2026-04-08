'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { apiCall, authHeaders, Quote, EVENT_TYPE_LABELS } from '@/lib/api';

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending: { color: '#F59E0B', label: 'În așteptare' },
  responded: { color: '#22C55E', label: 'Răspuns primit' },
  rejected: { color: '#EF4444', label: 'Refuzat' },
};

export default function MyQuotesPage() {
  const { theme } = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }
    if (token) {
      apiCall('/quotes/mine', { headers: authHeaders(token) })
        .then(setQuotes)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token, authLoading, user, router]);

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: c.textSecondary }}>Se încarcă...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: c.textPrimary, marginBottom: 32 }}>Cererile Mele de Ofertă</h1>

        {quotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <span style={{ fontSize: 64 }}>📋</span>
            <h3 style={{ color: c.textPrimary, fontSize: 22, marginTop: 16 }}>Nicio cerere de ofertă</h3>
            <p style={{ color: c.textSecondary, marginTop: 8 }}>Găsește locația perfectă și cere o ofertă personalizată.</p>
            <Link
              href="/search"
              style={{ display: 'inline-block', marginTop: 24, background: c.primary, color: c.background, padding: '14px 32px', borderRadius: 999, textDecoration: 'none', fontWeight: 600 }}
            >
              Caută locații
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {quotes.map((quote) => {
              const status = STATUS_CONFIG[quote.status] || STATUS_CONFIG.pending;
              return (
                <Link
                  key={quote.id}
                  href={`/venue/${quote.venue_id}`}
                  style={{
                    display: 'block',
                    background: c.surface,
                    borderRadius: 12,
                    border: `1px solid ${c.border}`,
                    overflow: 'hidden',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ display: 'flex' }}>
                    {quote.venue_image && (
                      <img src={quote.venue_image} alt="" style={{ width: 140, height: 140, objectFit: 'cover' }} />
                    )}
                    <div style={{ flex: 1, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ color: c.textPrimary, fontSize: 18, fontWeight: 600, margin: 0 }}>{quote.venue_name}</h3>
                          <p style={{ color: c.textSecondary, fontSize: 14, margin: '4px 0 0' }}>{quote.venue_city}</p>
                        </div>
                        <span style={{ background: `${status.color}20`, color: status.color, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500 }}>
                          {status.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: c.textTertiary, fontSize: 14 }}>
                          <span>📅</span> {quote.event_date}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: c.textTertiary, fontSize: 14 }}>
                          <span>👥</span> {quote.guest_count} invitați
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: c.textTertiary, fontSize: 14 }}>
                          <span>🏷️</span> {EVENT_TYPE_LABELS[quote.event_type] || quote.event_type}
                        </div>
                      </div>
                      {quote.message && (
                        <p style={{ color: c.textSecondary, fontSize: 14, fontStyle: 'italic', marginTop: 12 }}>"{quote.message}"</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
