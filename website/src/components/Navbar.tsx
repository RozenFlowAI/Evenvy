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

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav style={{
      background: c.surface,
      borderBottom: `1px solid ${c.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontSize: 22, color: c.primary }}>◆</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: c.textPrimary }}>Evenvy</span>
        </Link>

        {/* Desktop Navigation */}
        <div style={{ alignItems: 'center', gap: 24 }} className="hidden md:flex">
          <Link href="/search" style={{ color: c.textSecondary, textDecoration: 'none', fontSize: 15 }}>
            Caută locații
          </Link>
          {user?.role === 'owner' && (
            <Link href="/dashboard" style={{ color: c.textSecondary, textDecoration: 'none', fontSize: 15 }}>
              Dashboard
            </Link>
          )}
          <button
            onClick={toggleTheme}
            style={{
              background: c.surfaceHighlight,
              border: `1px solid ${c.border}`,
              borderRadius: 8,
              padding: '6px 12px',
              cursor: 'pointer',
              color: c.textSecondary,
              fontSize: 13,
            }}
          >
            {isDark ? '☀ Light' : '🌙 Dark'}
          </button>
          {user ? (
            <>
              <Link href="/my-quotes" style={{ color: c.textSecondary, textDecoration: 'none', fontSize: 14 }}>
                Cererile mele
              </Link>
              <button
                onClick={logout}
                style={{
                  background: 'transparent',
                  border: `1px solid ${c.border}`,
                  borderRadius: 999,
                  padding: '6px 16px',
                  cursor: 'pointer',
                  color: c.textSecondary,
                  fontSize: 13,
                }}
              >
                Deconectare
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              style={{
                background: c.primary,
                color: '#000',
                padding: '8px 20px',
                borderRadius: 999,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Autentificare
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Meniu"
          className="md:hidden"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ width: 24, height: 2, background: c.textPrimary, borderRadius: 2, transition: 'transform 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ width: 24, height: 2, background: c.textPrimary, borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
          <span style={{ width: 24, height: 2, background: c.textPrimary, borderRadius: 2, transition: 'transform 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{
            borderTop: `1px solid ${c.border}`,
            background: c.surface,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <Link href="/search" onClick={closeMenu} style={{ color: c.textSecondary, textDecoration: 'none', fontSize: 16, padding: '10px 0' }}>
            Caută locații
          </Link>
          {user?.role === 'owner' && (
            <Link href="/dashboard" onClick={closeMenu} style={{ color: c.textSecondary, textDecoration: 'none', fontSize: 16, padding: '10px 0' }}>
              Dashboard
            </Link>
          )}
          {user && (
            <Link href="/my-quotes" onClick={closeMenu} style={{ color: c.textSecondary, textDecoration: 'none', fontSize: 16, padding: '10px 0' }}>
              Cererile mele
            </Link>
          )}
          <button
            onClick={() => { toggleTheme(); }}
            style={{
              background: c.surfaceHighlight,
              border: `1px solid ${c.border}`,
              borderRadius: 8,
              padding: '12px',
              cursor: 'pointer',
              color: c.textSecondary,
              fontSize: 15,
              textAlign: 'left',
            }}
          >
            {isDark ? '☀ Schimbă în Light' : '🌙 Schimbă în Dark'}
          </button>
          {user ? (
            <button
              onClick={() => { logout(); closeMenu(); }}
              style={{
                background: 'transparent',
                border: `1px solid ${c.border}`,
                borderRadius: 999,
                padding: '12px',
                cursor: 'pointer',
                color: c.textSecondary,
                fontSize: 15,
              }}
            >
              Deconectare
            </button>
          ) : (
            <Link
              href="/auth"
              onClick={closeMenu}
              style={{
                background: c.primary,
                color: '#000',
                padding: '14px',
                borderRadius: 999,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 15,
                textAlign: 'center',
              }}
            >
              Autentificare
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}