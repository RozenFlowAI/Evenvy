'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { apiCall, Venue, EVENT_TYPE_LABELS } from '@/lib/api';
import VenueCard from '@/components/VenueCard';

const CITIES = ['București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Brașov', 'Craiova', 'Sibiu'];

function SearchContent() {
  const { theme } = useTheme();
  const c = theme.colors;
  const searchParams = useSearchParams();
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    event_type: searchParams.get('event_type') || '',
    capacity_min: '',
    capacity_max: '',
    price_max: '',
    sort_by: 'recommended',
  });
  const [showFilters, setShowFilters] = useState(false);

  const loadVenues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.city) params.append('city', filters.city);
      if (filters.event_type) params.append('event_type', filters.event_type);
      if (filters.capacity_min) params.append('capacity_min', filters.capacity_min);
      if (filters.capacity_max) params.append('capacity_max', filters.capacity_max);
      if (filters.price_max) params.append('price_max', filters.price_max);
      params.append('sort_by', filters.sort_by);
      
      const data = await apiCall(`/venues?${params.toString()}`);
      setVenues(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, [filters.event_type, filters.city, filters.sort_by]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadVenues();
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Search Header */}
      <div style={{ background: c.surface, borderBottom: `1px solid ${c.border}`, padding: '24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Caută locații..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={{
                flex: 1,
                minWidth: 200,
                padding: '14px 20px',
                borderRadius: 12,
                border: `1px solid ${c.border}`,
                background: c.surfaceHighlight,
                color: c.textPrimary,
                fontSize: 16,
              }}
            />
            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              style={{
                padding: '14px 20px',
                borderRadius: 12,
                border: `1px solid ${c.border}`,
                background: c.surfaceHighlight,
                color: c.textPrimary,
                fontSize: 16,
                minWidth: 150,
              }}
            >
              <option value="">Toate orașele</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select
              value={filters.event_type}
              onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}
              style={{
                padding: '14px 20px',
                borderRadius: 12,
                border: `1px solid ${c.border}`,
                background: c.surfaceHighlight,
                color: c.textPrimary,
                fontSize: 16,
                minWidth: 150,
              }}
            >
              <option value="">Toate tipurile</option>
              {Object.entries(EVENT_TYPE_LABELS).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '14px 20px',
                borderRadius: 12,
                border: `1px solid ${c.border}`,
                background: showFilters ? c.primary : c.surfaceHighlight,
                color: showFilters ? c.background : c.textPrimary,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              ⚙️ Filtre
            </button>
            <button
              type="submit"
              style={{
                padding: '14px 32px',
                borderRadius: 12,
                border: 'none',
                background: c.primary,
                color: c.background,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Caută
            </button>
          </form>

          {/* Extended Filters */}
          {showFilters && (
            <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input
                type="number"
                placeholder="Capacitate min"
                value={filters.capacity_min}
                onChange={(e) => setFilters({ ...filters, capacity_min: e.target.value })}
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: `1px solid ${c.border}`,
                  background: c.surfaceHighlight,
                  color: c.textPrimary,
                  width: 130,
                }}
              />
              <input
                type="number"
                placeholder="Capacitate max"
                value={filters.capacity_max}
                onChange={(e) => setFilters({ ...filters, capacity_max: e.target.value })}
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: `1px solid ${c.border}`,
                  background: c.surfaceHighlight,
                  color: c.textPrimary,
                  width: 130,
                }}
              />
              <input
                type="number"
                placeholder="Preț max/pers"
                value={filters.price_max}
                onChange={(e) => setFilters({ ...filters, price_max: e.target.value })}
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: `1px solid ${c.border}`,
                  background: c.surfaceHighlight,
                  color: c.textPrimary,
                  width: 130,
                }}
              />
              <select
                value={filters.sort_by}
                onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: `1px solid ${c.border}`,
                  background: c.surfaceHighlight,
                  color: c.textPrimary,
                }}
              >
                <option value="recommended">Recomandate</option>
                <option value="price_asc">Preț crescător</option>
                <option value="price_desc">Preț descrescător</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <span style={{ color: c.textSecondary }}>
            {loading ? 'Se încarcă...' : `${venues.length} locații găsite`}
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{ background: c.surface, borderRadius: 12, height: 280 }} className="skeleton" />
            ))}
          </div>
        ) : venues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <span style={{ fontSize: 64 }}>🔍</span>
            <h3 style={{ color: c.textPrimary, fontSize: 22, marginTop: 16 }}>Nicio locație găsită</h3>
            <p style={{ color: c.textSecondary, marginTop: 8 }}>Încearcă să modifici filtrele de căutare</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: 48, textAlign: 'center' }}>Se încarcă...</div>}>
      <SearchContent />
    </Suspense>
  );
}
