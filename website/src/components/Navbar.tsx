'use client';

import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const c = theme.colors;

  return (
    <nav style={{ 
      background: c.surface, 
      borderBottom: `1px solid ${c.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: 24, color: c.primary }}>◆</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: c.textPrimary }}>Evenvy</span>
        </Link>

        {/* Desktop Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hidden md:flex">
          <Link href="/search" style={{ color: c.textSecondary, textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>
            Caută locații
          </Link>
          
          {user?.role === 'owner' && (
            <Link href="/dashboard" style={{ color: c.textSecondary, textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>
              Dashboard
            </Link>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: c.surfaceHighlight,
              border: `1px solid ${c.border}`,
              borderRadius: 8,
              padding: '8px 12px',
              cursor: 'pointer',
              color: c.textSecondary,
              fontSize: 14,
            }}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link href="/my-quotes" style={{ color: c.textSecondary, textDecoration: 'none', fontSize: 15 }}>
                Cererile mele
              </Link>
              <button
                onClick={logout}
                style={{
                  background: 'transparent',
                  border: `1px solid ${c.border}`,
                  borderRadius: 999,
                  padding: '8px 20px',
                  cursor: 'pointer',
                  color: c.textSecondary,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Deconectare
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              style={{
                background: c.primary,
                color: c.background,
                borderRadius: 999,
                padding: '10px 24px',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Autentificare
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
          className="md:hidden"
        >
          <span style={{ fontSize: 24, color: c.textPrimary }}>{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ background: c.surface, borderTop: `1px solid ${c.border}`, padding: 24 }} className="md:hidden">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Link href="/search" style={{ color: c.textPrimary, textDecoration: 'none', fontSize: 16 }} onClick={() => setMenuOpen(false)}>
              Caută locații
            </Link>
            {user?.role === 'owner' && (
              <Link href="/dashboard" style={{ color: c.textPrimary, textDecoration: 'none', fontSize: 16 }} onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
            )}
            {user ? (
              <>
                <Link href="/my-quotes" style={{ color: c.textPrimary, textDecoration: 'none', fontSize: 16 }} onClick={() => setMenuOpen(false)}>
                  Cererile mele
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} style={{ color: c.error, background: 'none', border: 'none', textAlign: 'left', fontSize: 16, cursor: 'pointer' }}>
                  Deconectare
                </button>
              </>
            ) : (
              <Link href="/auth" style={{ color: c.primary, textDecoration: 'none', fontSize: 16, fontWeight: 600 }} onClick={() => setMenuOpen(false)}>
                Autentificare
              </Link>
            )}
            <button onClick={toggleTheme} style={{ color: c.textSecondary, background: 'none', border: 'none', textAlign: 'left', fontSize: 16, cursor: 'pointer' }}>
              {isDark ? '☀️ Mod Light' : '🌙 Mod Dark'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
