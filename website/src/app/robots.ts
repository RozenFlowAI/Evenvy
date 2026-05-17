import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/auth',
          '/settings',
          '/my-quotes',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://evenvy.ro/sitemap.xml',
    host: 'https://evenvy.ro',
  };
}
