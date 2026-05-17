import './globals.css';
import type { Metadata, Viewport } from 'next';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  metadataBase: new URL('https://evenvy.ro'),
  title: {
    default: 'Evenvy - Sali de Nunta si Locatii Evenimente in Romania',
    template: '%s | Evenvy',
  },
  description: 'Marketplace pentru locatii de evenimente in Romania. Gaseste sala perfecta pentru nunta, botez, petrecere corporate sau aniversare. Compara preturi si rezerva online.',
  keywords: [
    'sali de nunta',
    'sala nunta',
    'locatii evenimente',
    'sala botez',
    'restaurant nunta',
    'nunta Bucuresti',
    'sala nunta Cluj',
    'sala nunta Timisoara',
    'marketplace evenimente Romania',
    'rezervare sala evenimente',
    'locatie petrecere',
    'sala corporate',
    'evenvy',
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
    siteName: 'Evenvy',
    title: 'Evenvy - Sali de Nunta si Locatii Evenimente in Romania',
    description: 'Marketplace pentru locatii de evenimente. Gaseste sala perfecta pentru nunta, botez sau petrecere corporate.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Evenvy - Marketplace locatii evenimente',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Evenvy - Sali de Nunta si Locatii Evenimente',
    description: 'Gaseste sala perfecta pentru evenimentul tau in Romania.',
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
