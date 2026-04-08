'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

function AuthContent() {
  const { theme } = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState(searchParams.get('role') || 'client');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        if (form.password !== form.confirm_password) {
          throw new Error('Parolele nu coincid');
        }
        await register({ ...form, role });
      }
      router.push(role === 'owner' ? '/dashboard' : '/');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440, background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 32, color: c.primary }}>◆</span>
          </Link>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: c.textPrimary, marginTop: 16 }}>
            {isLogin ? 'Autentificare' : 'Înregistrare'}
          </h1>
          <p style={{ color: c.textSecondary, marginTop: 8 }}>
            {isLogin ? 'Bine ai revenit pe Evenvy' : 'Creează un cont pentru a începe'}
          </p>
        </div>

        {error && (
          <div style={{ background: `${c.error}20`, border: `1px solid ${c.error}`, borderRadius: 8, padding: 12, marginBottom: 20, color: c.error, fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection (Register only) */}
          {!isLogin && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, color: c.textSecondary, marginBottom: 8 }}>Sunt un...</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    border: `1px solid ${role === 'client' ? c.primary : c.border}`,
                    background: role === 'client' ? `${c.primary}15` : c.surfaceHighlight,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: 24 }}>🔍</span>
                  <div style={{ color: role === 'client' ? c.primary : c.textSecondary, fontWeight: 600, marginTop: 8 }}>Client</div>
                  <div style={{ color: c.textTertiary, fontSize: 12, marginTop: 4 }}>Caut locații</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    border: `1px solid ${role === 'owner' ? c.primary : c.border}`,
                    background: role === 'owner' ? `${c.primary}15` : c.surfaceHighlight,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: 24 }}>🏢</span>
                  <div style={{ color: role === 'owner' ? c.primary : c.textSecondary, fontWeight: 600, marginTop: 8 }}>Proprietar</div>
                  <div style={{ color: c.textTertiary, fontSize: 12, marginTop: 4 }}>Am locații</div>
                </button>
              </div>
            </div>
          )}

          {/* Name Fields */}
          {!isLogin && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 14, color: c.textSecondary, marginBottom: 8 }}>Prenume *</label>
                <input
                  type="text"
                  required={!isLogin}
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  style={{ width: '100%', padding: 14, borderRadius: 10, border: `1px solid ${c.border}`, background: c.surfaceHighlight, color: c.textPrimary }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 14, color: c.textSecondary, marginBottom: 8 }}>Nume *</label>
                <input
                  type="text"
                  required={!isLogin}
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  style={{ width: '100%', padding: 14, borderRadius: 10, border: `1px solid ${c.border}`, background: c.surfaceHighlight, color: c.textPrimary }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, color: c.textSecondary, marginBottom: 8 }}>Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ width: '100%', padding: 14, borderRadius: 10, border: `1px solid ${c.border}`, background: c.surfaceHighlight, color: c.textPrimary }}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, color: c.textSecondary, marginBottom: 8 }}>Telefon</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+40 7xx xxx xxx"
                style={{ width: '100%', padding: 14, borderRadius: 10, border: `1px solid ${c.border}`, background: c.surfaceHighlight, color: c.textPrimary }}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, color: c.textSecondary, marginBottom: 8 }}>Parolă *</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ width: '100%', padding: 14, borderRadius: 10, border: `1px solid ${c.border}`, background: c.surfaceHighlight, color: c.textPrimary }}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, color: c.textSecondary, marginBottom: 8 }}>Confirmă parola *</label>
              <input
                type="password"
                required={!isLogin}
                value={form.confirm_password}
                onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                style={{ width: '100%', padding: 14, borderRadius: 10, border: `1px solid ${c.border}`, background: c.surfaceHighlight, color: c.textPrimary }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: 16, borderRadius: 999, border: 'none', background: c.primary, color: c.background, fontSize: 16, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Se procesează...' : (isLogin ? 'Autentifică-te' : 'Înregistrează-te')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <span style={{ color: c.textSecondary }}>
            {isLogin ? 'Nu ai cont? ' : 'Ai deja cont? '}
          </span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', border: 'none', color: c.primary, fontWeight: 600, cursor: 'pointer' }}
          >
            {isLogin ? 'Înregistrează-te' : 'Autentifică-te'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Se încarcă...</div>}>
      <AuthContent />
    </Suspense>
  );
}
