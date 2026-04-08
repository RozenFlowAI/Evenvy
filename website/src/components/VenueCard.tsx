'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import { Venue } from '@/lib/api';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800';

export default function VenueCard({ venue }: { venue: Venue }) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <Link href={`/venue/${venue.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: c.surface,
          borderRadius: 12,
          overflow: 'hidden',
          border: `1px solid ${c.border}`,
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', width: '100%', height: 180 }}>
          <img
            src={venue.images?.[0] || PLACEHOLDER_IMAGE}
            alt={venue.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Badges */}
          {(venue.promotion_badge || venue.commission_badge) && (
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>
              {venue.promotion_badge && (
                <span style={{ background: c.warning, color: '#000', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
                  {venue.promotion_badge}
                </span>
              )}
              {venue.commission_badge && (
                <span style={{ background: c.primary, color: '#000', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
                  {venue.commission_badge}
                </span>
              )}
            </div>
          )}
          {/* Price badge */}
          <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.8)', padding: '6px 12px', borderRadius: 8 }}>
            <span style={{ color: c.primary, fontWeight: 700, fontSize: 14 }}>
              {venue.price_type === 'fixed' && venue.price_per_person
                ? `€${venue.price_per_person}/pers.`
                : 'La cerere'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: 16 }}>
          <h3 style={{ color: c.textPrimary, fontSize: 17, fontWeight: 600, margin: 0, marginBottom: 4 }}>
            {venue.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: c.textSecondary, fontSize: 14 }}>
            <span>📍</span>
            <span>{venue.city}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: c.textTertiary, fontSize: 13 }}>
              <span>👥</span>
              <span>{venue.capacity_min}-{venue.capacity_max}</span>
            </div>
            {venue.avg_rating && venue.avg_rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: c.primary, fontSize: 13 }}>
                <span>⭐</span>
                <span>{venue.avg_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
