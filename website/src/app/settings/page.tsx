'use client';

import { useTheme, ThemePreference } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SettingsPage() {
  const { theme, preference, setPreference } = useTheme();
  const { user, loading } = useAuth();
  const router = useRouter();
  const c = theme.colors;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: c.textSecondary }}>
        Se încarcă...
      </div>
    );
  }

  const themeOptions: { value: ThemePreference; label: string; icon: string; desc: string }[] = [
    { value: 'light', label: 'Luminos', icon: '☀', desc: 'Fundal alb, text închis' },
    { value: 'dark', label: 'Întunecat', icon: '🌙', desc: 'Fundal închis, text deschis' },
    { value: 'system', label: 'Automat', icon: '💻', desc: 'Urmărește setarea sistemului tău' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: c.background, padding: '32px 16px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: c.textPrimary, marginBottom: 8 }}>
          Setări
        </h1>
        <p style={{ color: c.textSecondary, marginBottom: 32 }}>
          Personalizează experiența ta pe Evenvy
        </p>

        {/* Card Temă */}
        <div style={{
          background: c.surface,
          border: `1px solid ${c.border}`,
          borderRadius: 12,
          padding: 24,
          marginBottom: 16,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: c.textPrimary, marginBottom: 4 }}>
            Temă
          </h2>
          <p style={{ fontSize: 13, color: c.textSecondary, marginBottom: 20 }}>
            Alege cum vrei să arate aplicația
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {themeOptions.map((option) => {
              const isSelected = preference === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setPreference(option.value)}
                  style={{
                    background: isSelected ? c.surfaceHighlight : 'transparent',
                    border: `2px solid ${isSelected ? c.primary : c.border}`,
                    borderRadius: 10,
                    padding: '14px 16px',
                    cursor: 'pointer',
                    color: c.textPrimary,
                    fontSize: 15,
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{option.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: c.textPrimary }}>
                      {option.label}
                    </div>
                    <div style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>
                      {option.desc}
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: c.primary,
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                    }}>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Cont */}
        <div style={{
          background: c.surface,
          border: `1px solid ${c.border}`,
          borderRadius: 12,
          padding: 24,
          marginBottom: 16,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: c.textPrimary, marginBottom: 16 }}>
            Cont
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: c.textSecondary }}>Nume</div>
              <div style={{ fontSize: 15, color: c.textPrimary }}>
                {user.first_name} {user.last_name}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: c.textSecondary }}>Email</div>
              <div style={{ fontSize: 15, color: c.textPrimary }}>{user.email}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: c.textSecondary }}>Tip cont</div>
              <div style={{ fontSize: 15, color: c.textPrimary }}>
                {user.role === 'owner' ? 'Proprietar locație' : 'Client'}
              </div>
            </div>
          </div>
        </div>

        {/* Card Notificări (placeholder) */}
        <div style={{
          background: c.surface,
          border: `1px solid ${c.border}`,
          borderRadius: 12,
          padding: 24,
          opacity: 0.6,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: c.textPrimary, marginBottom: 8 }}>
            Notificări
          </h2>
          <p style={{ fontSize: 13, color: c.textSecondary }}>
            În curând — vei putea alege ce notificări să primești pe email.
          </p>
        </div>
      </div>
    </div>
  );
}
