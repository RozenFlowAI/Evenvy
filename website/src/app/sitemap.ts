import type { MetadataRoute } from 'next';

const BASE_URL = 'https://evenvy.ro';

interface VenueMini {
  id: string;
  updated_at?: string;
}

async function getVenues(): Promise<VenueMini[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://evenvy.onrender.com/api';
    const res = await fetch(`${apiUrl}/venues`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const venues = await getVenues();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/auth`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const venuePages: MetadataRoute.Sitemap = venues.map((v) => ({
    url: `${BASE_URL}/venue/${v.id}`,
    lastModified: v.updated_at ? new Date(v.updated_at) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...venuePages];
}
