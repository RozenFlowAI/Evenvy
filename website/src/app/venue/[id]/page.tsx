'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { apiCall, Venue, EVENT_TYPE_LABELS } from '@/lib/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

export default function VenueDetailPage() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    event_date: '',
    guest_count: '',
    event_type: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);

  useEffect(() => {
    apiCall(`/venues/${id}`)
      .then(setVenue)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Blochează scroll-ul când lightbox e deschis
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      router.push('/auth');
      return;
    }
    setSubmitting(true);
    try {
      await apiCall('/quotes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          venue_id: id,
          event_date: quoteForm.event_date,
          guest_count: parseInt(quoteForm.guest_count),
          event_type: quoteForm.event_type,
          message: quoteForm.message,
        }),
      });
      setQuoteSent(true);
      setShowQuoteForm(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: c.textSecondary }}>Se încarcă...</div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <span style={{ fontSize: 64 }}>😕</span>
        <h2 style={{ color: c.textPrimary }}>Locația nu a fost găsită</h2>
        <button onClick={() => router.push('/search')} style={{ background: c.primary, color: c.background, padding: '12px 32px', borderRadius: 999, border: 'none', cursor: 'pointer' }}>
          Înapoi la căutare
        </button>
      </div>
    );
  }

  const canSeeContact = quoteSent;
  const images = venue.images && venue.images.length > 0 ? venue.images : [];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Image Gallery with Swiper */}
      <div style={{ position: 'relative', height: 480, background: c.surface }}>
        {images.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination, Keyboard]}
            navigation
            pagination={{ clickable: true, dynamicBullets: true }}
            keyboard={{ enabled: true }}
            loop={images.length > 1}
            spaceBetween={0}
            slidesPerView={1}
            style={{
              width: '100%',
              height: '100%',
              ['--swiper-navigation-color' as any]: '#fff',
              ['--swiper-pagination-color' as any]: c.primary,
              ['--swiper-navigation-size' as any]: '28px',
            }}
          >
            {images.map((src, idx) => (
              <SwiperSlide key={idx}>
                <div
                  onClick={() => openLightbox(idx)}
                  style={{ width: '100%', height: '100%', cursor: 'zoom-in' }}
                >
                  <img
                    src={src}
                    alt={`${venue.name} - poza ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 64, color: c.textTertiary }}>🏢</span>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            width: 44,
            height: 44,
            borderRadius: 22,
            background: 'rgba(0,0,0,0.6)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 20,
            zIndex: 10,
            backdropFilter: 'blur(4px)',
          }}
        >
          ←
        </button>

        {/* Counter */}
        {images.length > 1 && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 500,
              zIndex: 10,
              backdropFilter: 'blur(4px)',
            }}
          >
            📷 {images.length} {images.length === 1 ? 'poză' : 'poze'}
          </div>
        )}
      </div>

      {/* LIGHTBOX FULLSCREEN */}
      {lightboxOpen && images.length > 0 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 48,
              height: 48,
              borderRadius: 24,
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 24,
              zIndex: 1001,
              backdropFilter: 'blur(8px)',
            }}
          >
            ×
          </button>

          <Swiper
            modules={[Navigation, Pagination, Keyboard, Zoom]}
            navigation
            pagination={{ clickable: true }}
            keyboard={{ enabled: true }}
            zoom={{ maxRatio: 3 }}
            loop={images.length > 1}
            initialSlide={lightboxIndex}
            style={{
              width: '100%',
              height: '100%',
              ['--swiper-navigation-color' as any]: '#fff',
              ['--swiper-pagination-color' as any]: '#fff',
            }}
          >
            {images.map((src, idx) => (
              <SwiperSlide key={idx}>
                <div className="swiper-zoom-container" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={src}
                    alt={`${venue.name} - poza ${idx + 1}`}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 48 }} className="venue-grid">
          {/* Left - Info */}
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: c.textPrimary, marginBottom: 8 }}>{venue.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: c.textSecondary, marginBottom: 24 }}>
              <span>📍</span>
              <span>{venue.city}{venue.address ? `, ${venue.address}` : ''}</span>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 32, padding: '20px 0', borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}`, marginBottom: 32, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 600, color: c.textPrimary }}>{venue.capacity_min}-{venue.capacity_max}</div>
                <div style={{ fontSize: 14, color: c.textSecondary }}>persoane</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 600, color: c.primary }}>
                  {venue.price_type === 'fixed' && venue.price_per_person ? `€${venue.price_per_person}` : '—'}
                </div>
                <div style={{ fontSize: 14, color: c.textSecondary }}>{venue.price_type === 'fixed' ? '/persoană' : 'la cerere'}</div>
              </div>
              {venue.avg_rating && venue.avg_rating > 0 && (
                <div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: c.textPrimary, display: 'flex', alignItems: 'center', gap: 4 }}>
                    ⭐ {venue.avg_rating.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 14, color: c.textSecondary }}>{venue.review_count} recenzii</div>
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginBottom: 12 }}>Despre locație</h3>
              <p style={{ color: c.textSecondary, lineHeight: 1.7 }}>{venue.description || 'Fără descriere disponibilă.'}</p>
            </div>

            {/* Rules */}
            {venue.rules && (
              <div style={{ marginBottom: 32, padding: 20, background: `${c.warning}15`, borderRadius: 12, borderLeft: `3px solid ${c.warning}` }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: c.textPrimary, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  📋 Reguli și informații
                </h3>
                <p style={{ color: c.textSecondary, lineHeight: 1.7 }}>{venue.rules}</p>
              </div>
            )}

            {/* Event Types */}
            {venue.event_types && venue.event_types.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: c.textPrimary, marginBottom: 12 }}>Tipuri de evenimente</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {venue.event_types.map((t) => (
                    <span key={t} style={{ background: `${c.primary}20`, color: c.primary, padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 500 }}>
                      {EVENT_TYPE_LABELS[t] || t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {venue.amenities && venue.amenities.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: c.textPrimary, marginBottom: 12 }}>Facilități</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                  {venue.amenities.map((a) => (
                    <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, color: c.textSecondary }}>
                      <span style={{ color: c.success }}>✓</span> {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact - HIDDEN until quote sent */}
            <div style={{ marginBottom: 32, padding: 20, background: c.surface, borderRadius: 12, border: `1px solid ${c.border}` }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: c.textPrimary, marginBottom: 12 }}>Contact</h3>
              {canSeeContact ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {venue.contact_person && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: c.textSecondary }}>
                      <span>👤</span> {venue.contact_person}
                    </div>
                  )}
                  {venue.contact_phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: c.textSecondary }}>
                      <span>📞</span> {venue.contact_phone}
                    </div>
                  )}
                  {venue.contact_email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: c.textSecondary }}>
                      <span>✉️</span> {venue.contact_email}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <span style={{ fontSize: 32 }}>🔒</span>
                  <p style={{ color: c.textSecondary, marginTop: 8 }}>
                    Trimite o cerere de ofertă pentru a vedea datele de contact
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right - Quote Card */}
          <div>
            <div style={{ position: 'sticky', top: 100, background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: 24 }}>
              {quoteSent ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <span style={{ fontSize: 48 }}>✅</span>
                  <h3 style={{ color: c.textPrimary, fontSize: 20, marginTop: 16 }}>Cerere trimisă!</h3>
                  <p style={{ color: c.textSecondary, marginTop: 8 }}>
                    Proprietarul va fi notificat și te va contacta cu o ofertă personalizată.
                  </p>
                  <p style={{ color: c.success, marginTop: 16, fontWeight: 500 }}>
                    Acum poți vedea datele de contact! 👆
                  </p>
                </div>
              ) : showQuoteForm ? (
                <form onSubmit={handleSubmitQuote}>
                  <h3 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginBottom: 20 }}>Cere ofertă de preț</h3>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 14, color: c.textSecondary, marginBottom: 8 }}>Data evenimentului *</label>
                    <input
                      type="date"
                      required
                      value={quoteForm.event_date}
                      onChange={(e) => setQuoteForm({ ...quoteForm, event_date: e.target.value })}
                      style={{ width: '100%', padding: 12, borderRadius: 8, border: `1px solid ${c.border}`, background: c.surfaceHighlight, color: c.textPrimary, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 14, color: c.textSecondary, marginBottom: 8 }}>Număr invitați *</label>
                    <input
                      type="number"
                      required
                      placeholder="ex: 150"
                      value={quoteForm.guest_count}
                      onChange={(e) => setQuoteForm({ ...quoteForm, guest_count: e.target.value })}
                      style={{ width: '100%', padding: 12, borderRadius: 8, border: `1px solid ${c.border}`, background: c.surfaceHighlight, color: c.textPrimary, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 14, color: c.textSecondary, marginBottom: 8 }}>Tip eveniment *</label>
                    <select
                      required
                      value={quoteForm.event_type}
                      onChange={(e) => setQuoteForm({ ...quoteForm, event_type: e.target.value })}
                      style={{ width: '100%', padding: 12, borderRadius: 8, border: `1px solid ${c.border}`, background: c.surfaceHighlight, color: c.textPrimary, boxSizing: 'border-box' }}
                    >
                      <option value="">Selectează...</option>
                      {Object.entries(EVENT_TYPE_LABELS).map(([id, label]) => (
                        <option key={id} value={id}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 14, color: c.textSecondary, marginBottom: 8 }}>Mesaj (opțional)</label>
                    <textarea
                      rows={3}
                      placeholder="Detalii despre evenimentul tău..."
                      value={quoteForm.message}
                      onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                      style={{ width: '100%', padding: 12, borderRadius: 8, border: `1px solid ${c.border}`, background: c.surfaceHighlight, color: c.textPrimary, resize: 'vertical', boxSizing: 'border-box' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{ width: '100%', padding: 16, borderRadius: 999, border: 'none', background: c.primary, color: c.background, fontSize: 16, fontWeight: 600, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting ? 'Se trimite...' : 'Trimite cererea'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQuoteForm(false)}
                    style={{ width: '100%', padding: 12, marginTop: 12, borderRadius: 999, border: `1px solid ${c.border}`, background: 'transparent', color: c.textSecondary, cursor: 'pointer' }}
                  >
                    Anulează
                  </button>
                </form>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: c.primary }}>
                      {venue.price_type === 'fixed' && venue.price_per_person
                        ? `de la €${venue.price_per_person}/pers.`
                        : 'Preț la cerere'}
                    </div>
                    <div style={{ color: c.textSecondary, marginTop: 4 }}>
                      {venue.capacity_min}-{venue.capacity_max} persoane
                    </div>
                  </div>
                  <button
                    onClick={() => user ? setShowQuoteForm(true) : router.push('/auth')}
                    style={{ width: '100%', padding: 16, borderRadius: 999, border: 'none', background: c.primary, color: c.background, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cere ofertă de preț
                  </button>
                  <p style={{ color: c.textTertiary, fontSize: 13, textAlign: 'center', marginTop: 12 }}>
                    Gratuit și fără obligații
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS responsive */}
      <style jsx>{`
        @media (max-width: 768px) {
          .venue-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
