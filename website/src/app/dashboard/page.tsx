'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { theme } = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'owner')) {
      router.push('/auth?role=owner');
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: c.textSecondary }}>Se încarcă...</div>
      </div>
    );
  }

  if (!user || user.role !== 'owner') return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 24 }}>🔧</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: c.textPrimary, marginBottom: 16 }}>
          Dashboard temporar dezactivat
        </h1>
        <p style={{ fontSize: 17, color: c.textSecondary, lineHeight: 1.7, marginBottom: 36 }}>
          Dashboard-ul de proprietari e temporar dezactivat în timp ce pregătim noile features AI.
          Revino în curând — te vom anunța când e gata.
        </p>
        <Link
          href="/budget-planner"
          style={{
            display: 'inline-block',
            background: c.primary,
            color: c.background,
            padding: '16px 36px',
            borderRadius: 999,
            fontSize: 16,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Mergi la AI Budget Planner →
        </Link>
      </div>
    </div>
  );
}
