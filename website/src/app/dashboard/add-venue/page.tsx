'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { apiCall, authHeaders, EVENT_TYPE_LABELS } from '@/lib/api';

const EVENT_TYPES = Object.entries(EVENT_TYPE_LABELS);
const STYLE_TAGS = ['Modern', 'Glamour', 'Rustic', 'Exclusivist', 'Natură', 'Panoramic', 'Istoric', 'Central'];
const AMENITIES = ['Parcare', 'Catering inclus', 'DJ / Muzică live', 'Decorațiuni', 'Fotograf', 'Bar', 'Terasă', 'Grădină', 'Piscină', 'WiFi', 'Climatizare', 'Cameră mirilor'];

export default function AddVenuePage() {
  const { theme } = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    rules: '',
    city: '',
    address: '',
    latitude: '',
    longitude: '',
    price_type: 'on_request',
    price_per_person: '',
    capacity_min: '',
    capacity_max: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    images: '',
  });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const toggleItem = (list: string[], setList: (val: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter(t => t !== id) : [...list, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      router.push('/auth?role=owner');
      return;
    }
    if (!form.name || !form.description || !form.city || !form.capacity_min || !form.capacity_max || selectedTypes.length === 0) {
      alert('Completează toate câmpurile obligatorii (*)');
      return;
    }
    setLoading(true);
    try {
      const images = form.images.split(',').map(u => u.trim()).filter(Boolean);
      await apiCall('/venues', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          rules: form.rules,
          city: form.city,
          address: form.address,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
          price_type: form.price_type,
          price_per_person: form.price_type === 'fixed' && form.price_per_person ? parseFloat(form.price_per_person) : null,
          capacity_min: parseInt(form.capacity_min),
          capacity_max: parseInt(form.capacity_max),
          event_types: selectedTypes,
          style_tags: selectedStyles,
          amenities: selectedAmenities,
          images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'],
          contact_person: form.contact_person,
          contact_phone: form.contact_phone,
          contact_email: form.contact_email,
          commission_tier: 'standard',
        }),
      });
      alert('Locația a fost publicată cu succes!');
      router.push('/dashboard');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: 14,
    borderRadius: 10,
    border: `1px solid ${c.border}`,
    background: c.surfaceHighlight,
    color: c.textPrimary,
    fontSize: 16,
  };

  return (
    <div style={{ minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <Link href="/dashboard" style={{ color: c.textSecondary, textDecoration: 'none', fontSize: 24 }}>←</Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: c.textPrimary }}>Adaugă Locație</h1>
        </div>

        {/* Free Period Banner */}
        <div style={{ background: `${c.success}20`, border: `1px solid ${c.success}`, borderRadius: 12, padding: 16, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🎁</span>
          <div>
            <div style={{ color: c.success, fontWeight: 700 }}>Listare GRATUITĂ!</div>
            <div style={{ color: c.textSecondary, fontSize: 14 }}>Primele 3 luni sunt gratuite. Fără comisioane!</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginBottom: 16 }}>Informații de bază</h2>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Numele locației *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ex: Palatul Regilor"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Descriere *</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descrie locația ta..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Reguli și informații importante</label>
            <textarea
              rows={3}
              value={form.rules}
              onChange={(e) => setForm({ ...form, rules: e.target.value })}
              placeholder="ex: Se interzice fumatul..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Location */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Locație</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Oraș *</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="București"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Adresă</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Strada, Număr"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Capacity & Pricing */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Capacitate și prețuri</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Capacitate min *</label>
              <input
                type="number"
                value={form.capacity_min}
                onChange={(e) => setForm({ ...form, capacity_min: e.target.value })}
                placeholder="50"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Capacitate max *</label>
              <input
                type="number"
                value={form.capacity_max}
                onChange={(e) => setForm({ ...form, capacity_max: e.target.value })}
                placeholder="300"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Tip preț</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setForm({ ...form, price_type: 'on_request' })}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 10,
                  border: `1px solid ${form.price_type === 'on_request' ? c.primary : c.border}`,
                  background: form.price_type === 'on_request' ? `${c.primary}15` : c.surfaceHighlight,
                  color: form.price_type === 'on_request' ? c.primary : c.textSecondary,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                La cerere
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, price_type: 'fixed' })}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 10,
                  border: `1px solid ${form.price_type === 'fixed' ? c.primary : c.border}`,
                  background: form.price_type === 'fixed' ? `${c.primary}15` : c.surfaceHighlight,
                  color: form.price_type === 'fixed' ? c.primary : c.textSecondary,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Preț fix
              </button>
            </div>
          </div>

          {form.price_type === 'fixed' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Preț per persoană (€)</label>
              <input
                type="number"
                value={form.price_per_person}
                onChange={(e) => setForm({ ...form, price_per_person: e.target.value })}
                placeholder="75"
                style={inputStyle}
              />
            </div>
          )}

          {/* Event Types */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Tip evenimente *</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {EVENT_TYPES.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleItem(selectedTypes, setSelectedTypes, id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 999,
                  border: `1px solid ${selectedTypes.includes(id) ? c.primary : c.border}`,
                  background: selectedTypes.includes(id) ? c.primary : c.surfaceHighlight,
                  color: selectedTypes.includes(id) ? c.background : c.textSecondary,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Style Tags */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Stil locație</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {STYLE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleItem(selectedStyles, setSelectedStyles, tag)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 999,
                  border: `1px solid ${selectedStyles.includes(tag) ? c.primary : c.border}`,
                  background: selectedStyles.includes(tag) ? c.primary : c.surfaceHighlight,
                  color: selectedStyles.includes(tag) ? c.background : c.textSecondary,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Amenities */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Facilități</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {AMENITIES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleItem(selectedAmenities, setSelectedAmenities, a)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 999,
                  border: `1px solid ${selectedAmenities.includes(a) ? c.primary : c.border}`,
                  background: selectedAmenities.includes(a) ? c.primary : c.surfaceHighlight,
                  color: selectedAmenities.includes(a) ? c.background : c.textSecondary,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Contact */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Informații contact</h2>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Persoană de contact</label>
            <input
              type="text"
              value={form.contact_person}
              onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
              placeholder="Ion Popescu"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Telefon</label>
              <input
                type="tel"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                placeholder="+40 7xx xxx xxx"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Email</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                placeholder="contact@locatie.ro"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Images */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Imagini</h2>
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>URL-uri imagini (separate prin virgulă)</label>
            <textarea
              rows={3}
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              placeholder="https://example.com/img1.jpg, https://..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 18,
              borderRadius: 999,
              border: 'none',
              background: c.primary,
              color: c.background,
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Se publică...' : 'Publică Locația'}
          </button>
        </form>
      </div>
    </div>
  );
}
