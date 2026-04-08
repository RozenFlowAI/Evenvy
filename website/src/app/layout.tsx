import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title: 'Evenvy - Găsește locația perfectă pentru evenimentul tău',
  description: 'Platformă marketplace pentru locații de evenimente: nunți, botezuri, petreceri corporate și multe altele.',
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
