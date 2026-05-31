import './globals.css';
import type { Metadata, Viewport } from 'next';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  metadataBase: new URL('https://evenvy.ro'),
  title: {
    default: 'Evenvy AI — Planificator Buget Nuntă România 2026',
    template: '%s | Evenvy AI',
  },
  description: 'Calculează gratuit bugetul nunții tale cu Evenvy AI. Plan brutal cinstit bazat pe prețuri reale România 2026: locație, meniu, foto, muzică, decor. Rezultat în 10 secunde.',
  keywords: [
    'buget nunta',
    'calculator buget nunta',
    'planificator nunta romania',
    'cat costa o nunta',
    'buget nunta 2026',
    'nunta bucuresti pret',
    'nunta cluj pret',
    'plan nunta ai',
    'evenvy ai',
    'wedding planner online romania',
    'buget estimativ nunta',
    'costuri nunta romania',
  ],
  authors: [{ name: 'Evenvy' }],
  creator: 'Evenvy',
  publisher: 'Evenvy',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: 'https://evenvy.ro',
    siteName: 'Evenvy AI',
    title: 'Evenvy AI — Planificator Buget Nuntă România 2026',
    description: 'Plan de buget pentru nuntă, generat de AI în 10 secunde. Prețuri reale, verdict brutal cinstit, plan de acțiune.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Evenvy AI — Planificator nuntă România',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Evenvy AI — Buget Nuntă România 2026',
    description: 'Plan de buget generat de AI în 10 secunde. Prețuri reale, verdict brutal cinstit.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: 'YgFNBXmOtEdIZZzo4rgOmY8I9X5hw5XfGcSVCxVDX9A',
  },
  category: 'business',
};

export const viewport: Viewport = {
  themeColor: '#D4AF37',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
