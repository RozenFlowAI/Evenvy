import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Evenvy - Găsește locația perfectă pentru evenimentul tău',
  description: 'Platformă marketplace pentru locații de evenimente: nunți, botezuri, petreceri corporate și multe altele.',
  keywords: 'locații evenimente, săli nunți, locații botez, petreceri corporate, închiriere săli',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
