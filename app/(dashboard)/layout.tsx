'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState }    from 'react';
import { useAuth }     from '@/lib/auth/context';
import { cn }          from '@/lib/utils/cn';

const NAV_ITEMS = [
  {
    href:  '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href:  '/transactions',
    label: 'Movimientos',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6"  x2="3.01" y2="6"  strokeWidth="3" strokeLinecap="round"/>
        <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="3" strokeLinecap="round"/>
        <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href:  '/send',
    label: 'Enviar',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    ),
  },
  {
    href:  '/receive',
    label: 'Recibir',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
  },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname       = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Initials from user name
  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '??';

  return (
    <div className="min-h-screen bg-night-950 flex flex-col">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 h-16 border-b border-border bg-night-900/80 backdrop-blur-xl flex items-center px-4 md:px-6 gap-4">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-mint-400 to-mint-500 flex items-center justify-center text-base shadow-mint-sm">
            💸
          </div>
          <span className="font-display font-extrabold text-lg tracking-tight hidden sm:block">
            bankrupt<span className="text-mint-400">n't</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                  active
                    ? 'bg-mint-400/12 text-mint-400'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                )}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-3">

          {/* User chip */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-border">
            <div className="w-6 h-6 rounded-full bg-mint-400/20 border border-mint-400/20 flex items-center justify-center text-[10px] font-bold text-mint-400">
              {initials}
            </div>
            <span className="text-xs text-white/50 font-medium max-w-[120px] truncate">
              {user?.name ?? 'Usuario'}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="hidden md:flex items-center gap-1.5 text-xs text-white/30 hover:text-danger border border-border hover:border-danger/30 rounded-lg px-3 py-2 transition-all duration-200"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Salir
          </button>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/50 p-1.5"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-border bg-night-900/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1 animate-slide-up">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                  active ? 'bg-mint-400/12 text-mint-400' : 'text-white/50 hover:text-white/80'
                )}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-border mt-1">
            <div className="px-4 py-2 text-xs text-white/25">
              {user?.phone}
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-danger/70 hover:text-danger w-full transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-8">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden sticky bottom-0 border-t border-border bg-night-900/90 backdrop-blur-xl flex">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-all',
                active ? 'text-mint-400' : 'text-white/30'
              )}
            >
              {item.icon} {item.label}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
