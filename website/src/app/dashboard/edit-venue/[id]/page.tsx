'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { apiCall, authHeaders, EVENT_TYPE_LABELS } from '@/lib/api';

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

const EVENT_TYPES = Object.entries(EVENT_TYPE_LABELS);

const STYLE_TAGS = [
  'Modern', 'Glamour', 'Rustic', 'Exclusivist', 'Natura', 'Panoramic', 'Istoric', 'Central',
  'Minimalist', 'Vintage', 'Industrial', 'Boho', 'Clasic', 'Traditional', 'Elegant', 'Romantic',
  'Tematic', 'Open-air', 'Indoor', 'Cu vedere la lac', 'Cu vedere la munte', 'In padure',
  'La tara', 'In oras', 'Cabana', 'Castel', 'Conac', 'Vila', 'Restaurant', 'Sala evenimente',
  'Terasa', 'Gradina', 'Rooftop', 'Subteran', 'Loft', 'Hambar', 'Pensiune', 'Hotel',
];

const AMENITIES = [
  'Parcare', 'Catering inclus', 'DJ / Muzica live', 'Decoratiuni', 'Fotograf', 'Bar', 'Terasa',
  'Gradina', 'Piscina', 'WiFi', 'Climatizare', 'Camera mirilor', 'Loc de joaca copii', 'Acces persoane cu dizabilitati',
  'Animale acceptate', 'Cazare inclusa', 'Camere de hotel', 'Lift', 'Generator de curent',
  'Bucatarie proprie', 'Vestiar', 'Toalete separate', 'Sistem sonorizare', 'Lumini profesionale',
  'Ecran proiectie', 'Microfon', 'Scena', 'Ringul de dans', 'Bar deschis', 'Bar inclus in meniu',
  'Welcome drink', 'Tort de nunta inclus', 'Meniu degustare', 'Catering meniu copii', 'Catering meniu vegetarian',
  'Catering meniu fara gluten', 'Catering kosher', 'Catering halal', 'Paza', 'Camere supraveghere',
  'Foisor', 'Filigorie', 'Zona pentru ceremonia religioasa', 'Zona pentru cununia civila',
  'Servicii babysitting', 'Magie / Animatie copii', 'Foto booth', 'Confetti shooter', 'Artificii',
  'Lampioane', 'Floral design', 'Coordonator nunta', 'Asistenta tehnica', 'Translator',
  'Curier flori', 'Limuzina / Masina de epoca', 'Traditii si obiceiuri locale', 'Spatiu pentru cadouri',
];

const INITIAL_VISIBLE = 8;

interface UploadedImage {
  url: string;
  publicId: string;
}

export default function EditVenuePage() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pageLoading, setPageLoading] = useState(true);
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

  useEffect(() => {
    if (!token || !id) return;
    apiCall(`/venues/${id}`, { headers: authHeaders(token) })
      .then((venue: any) => {
        setForm({
          name: venue.name || '',
          description: venue.description || '',
          rules: venue.rules || '',
          city: venue.city || '',
          address: venue.address || '',
          latitude: venue.latitude != null ? String(venue.latitude) : '',
          longitude: venue.longitude != null ? String(venue.longitude) : '',
          price_type: venue.price_type || 'on_request',
          price_per_person: venue.price_per_person != null ? String(venue.price_per_person) : '',
          capacity_min: venue.capacity_min != null ? String(venue.capacity_min) : '',
          capacity_max: venue.capacity_max != null ? String(venue.capacity_max) : '',
          contact_person: venue.contact_person || '',
          contact_phone: venue.contact_phone || '',
          contact_email: venue.contact_email || '',
        });
        setSelectedTypes(venue.event_types || []);
        setSelectedStyles(venue.style_tags || []);
        setSelectedAmenities(venue.amenities || []);
        setImages((venue.images || []).map((url: string) => ({ url, publicId: url })));
      })
      .catch(() => {
        alert('Eroare la incarcarea locatiei.');
        router.push('/dashboard');
      })
      .finally(() => setPageLoading(false));
  }, [token, id, router]);

  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(t => t !== item) : [...list, item]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!CLOUDINARY_CLOUD || !CLOUDINARY_PRESET) {
      alert('Eroare configurare upload. Contacteaza administratorul.');
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

    setImages(prev => [...prev, ...uploaded]);
    setUploadingImages(false);
    setUploadProgress({ current: 0, total: 0 });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      router.push('/auth?role=owner');
      return;
    }
    if (!form.name || !form.description || !form.city || !form.capacity_min || !form.capacity_max || selectedTypes.length === 0) {
      alert('Completeaza toate campurile obligatorii (*)');
      return;
    }
    if (images.length === 0) {
      alert('Adauga cel putin o poza a locatiei.');
      return;
    }
    setLoading(true);
    try {
      const imageUrls = images.map(img => img.url);
      await apiCall(`/venues/${id}`, {
        method: 'PUT',
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
        }),
      });
      alert('Locatia a fost actualizata cu succes!');
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

  if (pageLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: c.textSecondary }}>Se incarca...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '32px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <Link href="/dashboard" style={{ color: c.textSecondary, textDecoration: 'none', fontSize: 24 }}>&#8592;</Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: c.textPrimary }}>Editeaza Locatia</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginBottom: 16 }}>Informatii de baza</h2>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Numele locatiei *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex: Palatul Regilor" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Descriere *</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrie locatia ta..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Reguli si informatii importante</label>
            <textarea rows={3} value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} placeholder="ex: Se interzice fumatul..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {/* Location */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Locatie</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Oras *</label>
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Bucuresti" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Adresa</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Strada, Numar" style={inputStyle} />
            </div>
          </div>

          {/* Capacity & Pricing */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Capacitate si preturi</h2>

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
            <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Tip pret</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setForm({ ...form, price_type: 'on_request' })} style={{ flex: 1, padding: 14, borderRadius: 10, border: `1px solid ${form.price_type === 'on_request' ? c.primary : c.border}`, background: form.price_type === 'on_request' ? `${c.primary}15` : c.surfaceHighlight, color: form.price_type === 'on_request' ? c.primary : c.textSecondary, cursor: 'pointer', fontWeight: 500 }}>La cerere</button>
              <button type="button" onClick={() => setForm({ ...form, price_type: 'fixed' })} style={{ flex: 1, padding: 14, borderRadius: 10, border: `1px solid ${form.price_type === 'fixed' ? c.primary : c.border}`, background: form.price_type === 'fixed' ? `${c.primary}15` : c.surfaceHighlight, color: form.price_type === 'fixed' ? c.primary : c.textSecondary, cursor: 'pointer', fontWeight: 500 }}>Pret fix</button>
            </div>
          </div>

          {form.price_type === 'fixed' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Pret per persoana (EUR)</label>
              <input type="number" value={form.price_per_person} onChange={(e) => setForm({ ...form, price_per_person: e.target.value })} placeholder="75" style={inputStyle} />
            </div>
          )}

          {/* Event Types */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Tip evenimente *</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {EVENT_TYPES.map(([typeId, label]) => (
              <button key={typeId} type="button" onClick={() => toggleItem(selectedTypes, setSelectedTypes, typeId)} style={{ padding: '10px 20px', borderRadius: 999, border: `1px solid ${selectedTypes.includes(typeId) ? c.primary : c.border}`, background: selectedTypes.includes(typeId) ? c.primary : c.surfaceHighlight, color: selectedTypes.includes(typeId) ? c.background : c.textSecondary, cursor: 'pointer', fontWeight: 500 }}>{label}</button>
            ))}
          </div>

          {/* Style Tags */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Stil locatie</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {visibleStyles.map((tag) => (
              <button key={tag} type="button" onClick={() => toggleItem(selectedStyles, setSelectedStyles, tag)} style={{ padding: '10px 20px', borderRadius: 999, border: `1px solid ${selectedStyles.includes(tag) ? c.primary : c.border}`, background: selectedStyles.includes(tag) ? c.primary : c.surfaceHighlight, color: selectedStyles.includes(tag) ? c.background : c.textSecondary, cursor: 'pointer', fontWeight: 500 }}>{tag}</button>
            ))}
          </div>
          {STYLE_TAGS.length > INITIAL_VISIBLE && (
            <button type="button" onClick={() => setShowAllStyles(!showAllStyles)} style={{ background: 'transparent', border: 'none', color: c.primary, cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '8px 0', marginBottom: 8 }}>
              {showAllStyles ? 'Arata mai putine' : `Vezi toate (${STYLE_TAGS.length - INITIAL_VISIBLE} in plus)`}
            </button>
          )}

          {/* Amenities */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Facilitati</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {visibleAmenities.map((amenity) => (
              <button key={amenity} type="button" onClick={() => toggleItem(selectedAmenities, setSelectedAmenities, amenity)} style={{ padding: '10px 20px', borderRadius: 999, border: `1px solid ${selectedAmenities.includes(amenity) ? c.primary : c.border}`, background: selectedAmenities.includes(amenity) ? c.primary : c.surfaceHighlight, color: selectedAmenities.includes(amenity) ? c.background : c.textSecondary, cursor: 'pointer', fontWeight: 500 }}>{amenity}</button>
            ))}
          </div>
          {AMENITIES.length > INITIAL_VISIBLE && (
            <button type="button" onClick={() => setShowAllAmenities(!showAllAmenities)} style={{ background: 'transparent', border: 'none', color: c.primary, cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '8px 0', marginBottom: 8 }}>
              {showAllAmenities ? 'Arata mai putine' : `Vezi toate (${AMENITIES.length - INITIAL_VISIBLE} in plus)`}
            </button>
          )}

          {/* Contact */}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.textPrimary, marginTop: 32, marginBottom: 16 }}>Informatii contact</h2>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: c.textSecondary, marginBottom: 8 }}>Persoana de contact</label>
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
          <p style={{ color: c.textSecondary, fontSize: 14, marginBottom: 16 }}>Poti sterge pozele existente sau adauga unele noi. Recomandam minim 5 poze.</p>

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
            <span style={{ fontSize: 32 }}>{uploadingImages ? '&#8987;' : '+'}</span>
            <span>
              {uploadingImages
                ? `Se incarca ${uploadProgress.current} din ${uploadProgress.total}...`
                : images.length === 0
                  ? 'Adauga poze'
                  : 'Adauga mai multe poze'}
            </span>
            <span style={{ fontSize: 12, color: c.textSecondary, fontWeight: 400 }}>Poti selecta mai multe deodata</span>
          </button>

          {images.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <p style={{ color: c.textSecondary, fontSize: 14, marginBottom: 12 }}>{images.length} {images.length === 1 ? 'poza' : 'poze'}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                {images.map((img, idx) => (
                  <div key={`${img.publicId}-${idx}`} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: c.surfaceHighlight }}>
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
                    >&#215;</button>
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
            {loading ? 'Se salveaza...' : 'Salveaza modificarile'}
          </button>
        </form>
      </div>
    </div>
  );
}
