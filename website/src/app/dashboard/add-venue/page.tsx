'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { apiCall, authHeaders, EVENT_TYPE_LABELS } from '@/lib/api';

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

const EVENT_TYPES = Object.entries(EVENT_TYPE_LABELS);

const STYLE_TAGS = [
  'Modern', 'Glamour', 'Rustic', 'Exclusivist', 'Natură', 'Panoramic', 'Istoric', 'Central',
  'Minimalist', 'Vintage', 'Industrial', 'Boho', 'Clasic', 'Tradițional', 'Elegant', 'Romantic',
  'Tematic', 'Open-air', 'Indoor', 'Cu vedere la lac', 'Cu vedere la munte', 'În pădure',
  'La țară', 'În oraș', 'Cabană', 'Castel', 'Conac', 'Vilă', 'Restaurant', 'Sală evenimente',
  'Terasă', 'Grădină', 'Rooftop', 'Subteran', 'Loft', 'Hambar', 'Pensiune', 'Hotel',
];

const AMENITIES = [
  'Parcare', 'Catering inclus', 'DJ / Muzică live', 'Decorațiuni', 'Fotograf', 'Bar', 'Terasă',
  'Grădină', 'Piscină', 'WiFi', 'Climatizare', 'Cameră mirilor', 'Loc de joacă copii', 'Acces persoane cu dizabilități',
  'Animale acceptate', 'Cazare inclusă', 'Camere de hotel', 'Lift', 'Generator de curent',
  'Bucătărie proprie', 'Vestiar', 'Toalete separate', 'Sistem sonorizare', 'Lumini profesionale',
  'Ecran proiecție', 'Microfon', 'Scenă', 'Ringul de dans', 'Bar deschis', 'Bar inclus în meniu',
  'Welcome drink', 'Tort de nuntă inclus', 'Meniu degustare', 'Catering meniu copii', 'Catering meniu vegetarian',
  'Catering meniu fără gluten', 'Catering kosher', 'Catering halal', 'Pază', 'Camere supraveghere',
  'Foișor', 'Filigorie', 'Zonă pentru ceremonia religioasă', 'Zonă pentru cununia civilă',
  'Servicii babysitting', 'Magie / Animație copii', 'Foto booth', 'Confetti shooter', 'Artificii',
  'Lampioane', 'Floral design', 'Coordonator nuntă', 'Asistență tehnică', 'Translator',
  'Curier flori', 'Limuzină / Mașină de epocă', 'Tradiții și obiceiuri locale', 'Spațiu pentru cadouri',
];

const INITIAL_VISIBLE = 8;

interface UploadedImage {
  url: string;
  publicId: string;
}

export default function AddVenuePage() {
  const { theme } = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [images, setImages] = useState<UploadedImage[]>([]);

  const [form, setForm] = useState({
    name: '', description: '', rules: '', city: '', address: '',
    latitude: '', longitude: '', price_type: 'on_request', price_per_person: '',
    capacity_min: '', capacity_max: '', contact_person: '', contact_phone: '', contact_email: '',
  });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showAllStyles, setShowAllStyles] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const toggleItem = (list: string[], setList: (val: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter(t => t !== id) : [...list, id]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!CLOUDINARY_CLOUD || !CLOUDINARY_PRESET) {
      alert('Eroare configurare upload. Contactează administratorul.');
      return;
    }

    setUploadingImages(true);
    setUploadProgress({ current: 0, total: files.length });
    const uploaded: UploadedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_PRESET);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) {
          uploaded.push({ url: data.secure_url, publicId: data.public_id });
        } else {
          console.error('Upload failed:', data);
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
      setUploadProgress({ current: i + 1, total: files.length });
    }

    setImages([...images, ...uploaded]);
    setUploadingImages(false);
    setUploadProgress({ current: 0, total: 0 });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
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
    if (images.length === 0) {
      alert('Adaugă cel puțin o poză a locației.');
      return;
    }
    setLoading(true);
    try {
      const imageUrls = images.map(img => img.url);
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
          images: imageUrls,
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
    boxSizing: 'border-box' as const,
  };

  const visibleStyles = showAllStyles ? STYLE_TAGS : STYLE_TAGS.slice(0, INITIAL_VISIBLE);
  const visibleAmenities = showAllAmenities ? AMENITIES : AMENITIES.slice(0, INITIAL_VISIBLE);

  return (
    <div style={{ minHeight: '100vh', padding: '32px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <Link href="/dashboard" style={{ color: c.textSecondary, textDecoration: 'none', fontSize: 24 }}>←</Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: c.textPrimary }}>Adaugă Locație</h1>
        </div>

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
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex: Palatul Regilor" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Descriere *</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrie locația ta..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Reguli și informații importante</label>
            <textarea rows={3} value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} placeholder="ex: Se interzice fumatul..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {/* Location */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Locație</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Oraș *</label>
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="București" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Adresă</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Strada, Număr" style={inputStyle} />
            </div>
          </div>

          {/* Capacity & Pricing */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Capacitate și prețuri</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Capacitate min *</label>
              <input type="number" value={form.capacity_min} onChange={(e) => setForm({ ...form, capacity_min: e.target.value })} placeholder="50" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Capacitate max *</label>
              <input type="number" value={form.capacity_max} onChange={(e) => setForm({ ...form, capacity_max: e.target.value })} placeholder="300" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Tip preț</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setForm({ ...form, price_type: 'on_request' })} style={{ flex: 1, padding: 14, borderRadius: 10, border: `1px solid ${form.price_type === 'on_request' ? c.primary : c.border}`, background: form.price_type === 'on_request' ? `${c.primary}15` : c.surfaceHighlight, color: form.price_type === 'on_request' ? c.primary : c.textSecondary, cursor: 'pointer', fontWeight: 500 }}>La cerere</button>
              <button type="button" onClick={() => setForm({ ...form, price_type: 'fixed' })} style={{ flex: 1, padding: 14, borderRadius: 10, border: `1px solid ${form.price_type === 'fixed' ? c.primary : c.border}`, background: form.price_type === 'fixed' ? `${c.primary}15` : c.surfaceHighlight, color: form.price_type === 'fixed' ? c.primary : c.textSecondary, cursor: 'pointer', fontWeight: 500 }}>Preț fix</button>
            </div>
          </div>

          {form.price_type === 'fixed' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Preț per persoană (€)</label>
              <input type="number" value={form.price_per_person} onChange={(e) => setForm({ ...form, price_per_person: e.target.value })} placeholder="75" style={inputStyle} />
            </div>
          )}

          {/* Event Types */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Tip evenimente *</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {EVENT_TYPES.map(([id, label]) => (
              <button key={id} type="button" onClick={() => toggleItem(selectedTypes, setSelectedTypes, id)} style={{ padding: '10px 20px', borderRadius: 999, border: `1px solid ${selectedTypes.includes(id) ? c.primary : c.border}`, background: selectedTypes.includes(id) ? c.primary : c.surfaceHighlight, color: selectedTypes.includes(id) ? c.background : c.textSecondary, cursor: 'pointer', fontWeight: 500 }}>{label}</button>
            ))}
          </div>

          {/* Style Tags */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Stil locație</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {visibleStyles.map((tag) => (
              <button key={tag} type="button" onClick={() => toggleItem(selectedStyles, setSelectedStyles, tag)} style={{ padding: '10px 20px', borderRadius: 999, border: `1px solid ${selectedStyles.includes(tag) ? c.primary : c.border}`, background: selectedStyles.includes(tag) ? c.primary : c.surfaceHighlight, color: selectedStyles.includes(tag) ? c.background : c.textSecondary, cursor: 'pointer', fontWeight: 500 }}>{tag}</button>
            ))}
          </div>
          {STYLE_TAGS.length > INITIAL_VISIBLE && (
            <button type="button" onClick={() => setShowAllStyles(!showAllStyles)} style={{ background: 'transparent', border: 'none', color: c.primary, cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '8px 0', marginBottom: 8 }}>
              {showAllStyles ? '↑ Arată mai puține' : `↓ Vezi toate (${STYLE_TAGS.length - INITIAL_VISIBLE} în plus)`}
            </button>
          )}

          {/* Amenities */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Facilități</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {visibleAmenities.map((a) => (
              <button key={a} type="button" onClick={() => toggleItem(selectedAmenities, setSelectedAmenities, a)} style={{ padding: '10px 20px', borderRadius: 999, border: `1px solid ${selectedAmenities.includes(a) ? c.primary : c.border}`, background: selectedAmenities.includes(a) ? c.primary : c.surfaceHighlight, color: selectedAmenities.includes(a) ? c.background : c.textSecondary, cursor: 'pointer', fontWeight: 500 }}>{a}</button>
            ))}
          </div>
          {AMENITIES.length > INITIAL_VISIBLE && (
            <button type="button" onClick={() => setShowAllAmenities(!showAllAmenities)} style={{ background: 'transparent', border: 'none', color: c.primary, cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '8px 0', marginBottom: 8 }}>
              {showAllAmenities ? '↑ Arată mai puține' : `↓ Vezi toate (${AMENITIES.length - INITIAL_VISIBLE} în plus)`}
            </button>
          )}

          {/* Contact */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Informații contact</h2>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Persoană de contact</label>
            <input type="text" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} placeholder="Ion Popescu" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Telefon</label>
              <input type="tel" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} placeholder="+40 7xx xxx xxx" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Email</label>
              <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} placeholder="contact@locatie.ro" style={inputStyle} />
            </div>
          </div>

          {/* Images */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 8 }}>Imagini *</h2>
          <p style={{ color: c.textSecondary, fontSize: 14, marginBottom: 16 }}>Adaugă oricâte poze vrei. Recomandăm minim 5 pentru cele mai bune rezultate.</p>

          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} style={{ display: 'none' }} />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImages}
            style={{
              width: '100%',
              padding: 24,
              borderRadius: 12,
              border: `2px dashed ${c.primary}`,
              background: `${c.primary}10`,
              color: c.primary,
              cursor: uploadingImages ? 'not-allowed' : 'pointer',
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              opacity: uploadingImages ? 0.6 : 1,
            }}
          >
            <span style={{ fontSize: 32 }}>{uploadingImages ? '⏳' : '➕'}</span>
            <span>
              {uploadingImages
                ? `Se încarcă ${uploadProgress.current} din ${uploadProgress.total}...`
                : images.length === 0
                  ? 'Adaugă poze'
                  : 'Adaugă mai multe poze'}
            </span>
            <span style={{ fontSize: 12, color: c.textSecondary, fontWeight: 400 }}>Poți selecta mai multe deodată</span>
          </button>

          {images.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <p style={{ color: c.textSecondary, fontSize: 14, marginBottom: 12 }}>{images.length} {images.length === 1 ? 'poză adăugată' : 'poze adăugate'}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                {images.map((img, idx) => (
                  <div key={img.publicId} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: c.surfaceHighlight }}>
                    <img src={img.url} alt={`Poza ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      style={{
                        position: 'absolute', top: 6, right: 6, width: 28, height: 28,
                        borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.7)',
                        color: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', padding: 0,
                      }}
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || uploadingImages}
            style={{
              width: '100%',
              padding: 18,
              borderRadius: 999,
              border: 'none',
              background: c.primary,
              color: c.background,
              fontSize: 18,
              fontWeight: 700,
              cursor: loading || uploadingImages ? 'not-allowed' : 'pointer',
              opacity: loading || uploadingImages ? 0.7 : 1,
              marginTop: 16,
            }}
          >
            {loading ? 'Se publică...' : 'Publică Locația'}
          </button>
        </form>
      </div>
    </div>
  );
}
