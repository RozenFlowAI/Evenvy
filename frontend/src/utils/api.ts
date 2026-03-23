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
