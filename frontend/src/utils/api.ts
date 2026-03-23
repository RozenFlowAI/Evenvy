const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${BACKEND_URL}/api${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Cererea a eșuat' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Nuntă',
  baptism: 'Botez',
  corporate: 'Corporate',
  civil_wedding: 'Cununie Civilă',
  party: 'Petrecere',
  birthday: 'Aniversare',
  conference: 'Conferință',
};

export const EVENT_TYPE_ICONS: Record<string, string> = {
  wedding: 'heart',
  baptism: 'water',
  corporate: 'briefcase',
  civil_wedding: 'ribbon',
  party: 'musical-notes',
  birthday: 'gift',
  conference: 'people',
};

// Loyalty Tiers
export const LOYALTY_TIERS: Record<string, { name: string; color: string; icon: string }> = {
  bronze: { name: 'Bronze', color: '#CD7F32', icon: 'shield' },
  argint: { name: 'Argint', color: '#C0C0C0', icon: 'shield' },
  aur: { name: 'Aur', color: '#FFD700', icon: 'shield' },
  platina: { name: 'Platină', color: '#E5E4E2', icon: 'diamond' },
};

// Commission tier badges
export const COMMISSION_BADGES: Record<string, { label: string; color: string }> = {
  premium: { label: 'Recomandat', color: '#3B82F6' },
  elite: { label: 'Top Alegere', color: '#8B5CF6' },
};

// Promotion badges
export const PROMOTION_BADGES: Record<string, { color: string }> = {
  'Promovat': { color: '#F59E0B' },
  'Top Promovat': { color: '#EF4444' },
};

export type LoyaltyTier = {
  id: string;
  name: string;
  min_requests: number;
  discount: number;
  color: string;
};

export type User = {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'client' | 'owner';
  loyalty_tier?: LoyaltyTier;
  total_requests?: number;
};

export type Venue = {
  id: string;
  name: string;
  description: string;
  rules: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  price_per_person: number | null;
  price_type: string;
  capacity_min: number;
  capacity_max: number;
  event_types: string[];
  style_tags: string[];
  amenities: string[];
  images: string[];
  contact_phone: string;
  contact_email: string;
  contact_person: string;
  avg_rating: number;
  review_count: number;
  quote_count: number;
  owner_name: string;
  commission_tier: string;
  commission_badge?: string;
  promotion_badge?: string;
  visibility_score?: number;
  active_promotion?: {
    package: string;
    name: string;
    badge?: string;
    expires_at: string;
  };
};

export type Quote = {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_loyalty_tier: string;
  client_discount: number;
  venue_id: string;
  venue_name: string;
  venue_image: string;
  venue_city: string;
  owner_id: string;
  event_type: string;
  event_date: string;
  guest_count: number;
  message: string;
  status: 'pending' | 'responded' | 'rejected';
  created_at: string;
};

export type Review = {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
};
