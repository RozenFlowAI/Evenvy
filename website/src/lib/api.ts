// API utility functions
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://party-place-finder.preview.emergentagent.com/api';

export const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Nuntă',
  baptism: 'Botez',
  corporate: 'Corporate',
  civil_wedding: 'Cununie',
  party: 'Petrecere',
  birthday: 'Aniversare',
  conference: 'Conferință',
};

export const EVENT_TYPE_ICONS: Record<string, string> = {
  wedding: 'ring',
  baptism: 'candle',
  corporate: 'office-building',
  civil_wedding: 'file-document-outline',
  party: 'party-popper',
  birthday: 'cake-variant',
  conference: 'presentation',
};

export interface Venue {
  id: string;
  name: string;
  description: string;
  rules?: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  price_per_person?: number;
  price_type: string;
  capacity_min: number;
  capacity_max: number;
  event_types: string[];
  style_tags?: string[];
  amenities?: string[];
  images: string[];
  avg_rating?: number;
  review_count?: number;
  is_promoted?: boolean;
  promotion_badge?: string;
  commission_badge?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_person?: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  loyalty_tier: string;
}

export interface Quote {
  id: string;
  venue_id: string;
  venue_name: string;
  venue_city: string;
  venue_image?: string;
  event_date: string;
  guest_count: number;
  event_type: string;
  message?: string;
  status: string;
  created_at: string;
}

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || 'An error occurred');
  }
  
  return response.json();
}

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}
