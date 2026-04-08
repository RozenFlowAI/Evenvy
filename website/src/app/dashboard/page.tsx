'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { apiCall, authHeaders, Quote, Venue, EVENT_TYPE_LABELS } from '@/lib/api';

type Stats = {
  total_venues: number;
  total_quotes: number;
  pending_quotes: number;
  responded_quotes: number;
  total_views: number;
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending: { color: '#F59E0B', label: 'În așteptare' },
  responded: { color: '#22C55E', label: 'Răspuns' },
  rejected: { color: '#EF4444', label: 'Refuzat' },
};

export default function DashboardPage() {
  const { theme } = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'quotes' | 'venues'>('quotes');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'owner')) {
      router.push('/auth?role=owner');
      return;
    }
    if (token) {
      const headers = authHeaders(token);
      Promise.all([
        apiCall('/stats/owner', { headers }),
        apiCall('/quotes/owner', { headers }),
        apiCall('/venues/owner/mine', { headers }),
      ])
        .then(([s, q, v]) => {
          setStats(s);
          setQuotes(q);
          setVenues(v);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token, authLoading, user, router]);

  const updateQuoteStatus = async (quoteId: string, status: string) => {
    if (!token) return;
    try {
      await apiCall(`/quotes/${quoteId}/status?status=${status}`, {
        method: 'PUT',
        headers: authHeaders(token),
      });
      setQuotes(quotes.map(q => q.id === quoteId ? { ...q, status } : q));
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: c.textSecondary }}>Se încarcă...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: c.textPrimary }}>Dashboard Proprietar</h1>
          <Link
            href="/dashboard/add-venue"
            style={{ background: c.primary, color: c.background, padding: '12px 24px', borderRadius: 999, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            + Adaugă locație
          </Link>
        </div>

        {/* Free Period Banner */}
        <div style={{ background: `${c.success}20`, border: `1px solid ${c.success}`, borderRadius: 12, padding: 20, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 32 }}>🎁</span>
          <div>
            <div style={{ color: c.success, fontWeight: 700, fontSize: 16 }}>Listare GRATUITĂ!</div>
            <div style={{ color: c.textSecondary, fontSize: 14 }}>Primele 3 luni sunt gratuite pentru toți proprietarii. Fără comisioane!</div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <div style={{ background: `${c.primary}15`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: c.textPrimary }}>{stats.total_venues}</div>
              <div style={{ color: c.textSecondary, marginTop: 4 }}>Locații</div>
            </div>
            <div style={{ background: `${c.info}15`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: c.textPrimary }}>{stats.total_quotes}</div>
              <div style={{ color: c.textSecondary, marginTop: 4 }}>Cereri totale</div>
            </div>
            <div style={{ background: `${c.warning}15`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: c.textPrimary }}>{stats.pending_quotes}</div>
              <div style={{ color: c.textSecondary, marginTop: 4 }}>În așteptare</div>
            </div>
            <div style={{ background: `${c.success}15`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: c.textPrimary }}>{stats.total_views}</div>
              <div style={{ color: c.textSecondary, marginTop: 4 }}>Vizualizări</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: c.surface, borderRadius: 12, padding: 4, marginBottom: 24 }}>
          <button
            onClick={() => setActiveTab('quotes')}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'quotes' ? c.primary : 'transparent',
              color: activeTab === 'quotes' ? c.background : c.textSecondary,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cereri de ofertă ({quotes.length})
          </button>
          <button
            onClick={() => setActiveTab('venues')}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'venues' ? c.primary : 'transparent',
              color: activeTab === 'venues' ? c.background : c.textSecondary,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Locațiile mele ({venues.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'quotes' ? (
          <div>
            {quotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: c.surface, borderRadius: 12 }}>
                <span style={{ fontSize: 48 }}>📩</span>
                <h3 style={{ color: c.textPrimary, marginTop: 16 }}>Nicio cerere de ofertă</h3>
                <p style={{ color: c.textSecondary }}>Cererile clienților vor apărea aici</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {quotes.map((quote) => {
                  const status = STATUS_CONFIG[quote.status] || STATUS_CONFIG.pending;
                  return (
                    <div key={quote.id} style={{ background: c.surface, borderRadius: 12, border: `1px solid ${c.border}`, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 600, color: c.textPrimary, fontSize: 16 }}>{(quote as any).client_name || 'Client'}</div>
                          <div style={{ color: c.primary, fontSize: 14, marginTop: 4 }}>{quote.venue_name}</div>
                        </div>
                        <span style={{ background: `${status.color}20`, color: status.color, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500 }}>
                          {status.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 12 }}>
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
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, color: c.textSecondary, fontSize: 14 }}>
                        <span>✉️ {(quote as any).client_email}</span>
                        {(quote as any).client_phone && <span>📞 {(quote as any).client_phone}</span>}
                      </div>
                      {quote.message && (
                        <p style={{ color: c.textSecondary, fontSize: 14, fontStyle: 'italic', marginBottom: 16 }}>"{quote.message}"</p>
                      )}
                      {quote.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 12 }}>
                          <button
                            onClick={() => updateQuoteStatus(quote.id, 'responded')}
                            style={{ flex: 1, padding: 12, borderRadius: 999, border: 'none', background: c.success, color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                          >
                            ✓ Am răspuns
                          </button>
                          <button
                            onClick={() => updateQuoteStatus(quote.id, 'rejected')}
                            style={{ flex: 1, padding: 12, borderRadius: 999, border: `1px solid ${c.error}`, background: 'transparent', color: c.error, fontWeight: 600, cursor: 'pointer' }}
                          >
                            ✕ Refuză
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            {venues.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: c.surface, borderRadius: 12 }}>
                <span style={{ fontSize: 48 }}>🏢</span>
                <h3 style={{ color: c.textPrimary, marginTop: 16 }}>Nicio locație adăugată</h3>
                <Link
                  href="/dashboard/add-venue"
                  style={{ display: 'inline-block', marginTop: 16, background: c.primary, color: c.background, padding: '14px 32px', borderRadius: 999, textDecoration: 'none', fontWeight: 600 }}
                >
                  Adaugă prima ta locație
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {venues.map((venue) => (
                  <div key={venue.id} style={{ background: c.surface, borderRadius: 12, border: `1px solid ${c.border}`, overflow: 'hidden' }}>
                    <div style={{ height: 140, background: c.surfaceHighlight }}>
                      {venue.images?.[0] && (
                        <img src={venue.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div style={{ padding: 16 }}>
                      <Link href={`/venue/${venue.id}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{ color: c.textPrimary, fontWeight: 600, margin: 0 }}>{venue.name}</h3>
                      </Link>
                      <p style={{ color: c.textSecondary, fontSize: 14, margin: '4px 0 0' }}>{venue.city}</p>
                      <div style={{ display: 'flex', gap: 16, marginTop: 12, color: c.textTertiary, fontSize: 14 }}>
                        <span>⭐ {venue.avg_rating || '—'}</span>
                        <span>💬 {(venue as any).quote_count || 0} cereri</span>
                      </div>
                      <div style={{ marginTop: 12, background: `${c.success}15`, padding: '8px 12px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span>🎁</span>
                        <span style={{ color: c.success, fontSize: 12, fontWeight: 600 }}>Gratuit</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
