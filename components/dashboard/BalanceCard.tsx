'use client';

import { useState } from 'react';
import { formatCurrency, maskAccountNumber } from '@/lib/utils/currency';

interface BalanceCardProps {
  balance: number;
  currency: string;
  accountNumber: string;
  totalSent: number;
  totalReceived: number;
  transactionCount: number;
}

export default function BalanceCard({
  balance, currency, accountNumber,
  totalSent, totalReceived, transactionCount,
}: BalanceCardProps) {
  const [visible, setVisible] = useState(true);

  return (
    <div
      className="relative rounded-2xl overflow-hidden p-7 border border-mint-500/15"
      style={{
        background: 'linear-gradient(135deg, rgba(19,19,43,0.95) 0%, rgba(14,14,36,0.98) 100%)',
        boxShadow: '0 0 0 1px rgba(61,245,176,0.08), 0 24px 48px rgba(0,0,0,0.4), 0 0 60px rgba(61,245,176,0.05)',
        animation: 'glowPulse 5s ease-in-out infinite',
      }}
    >
      {/* Background decorations */}
      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(61,245,176,.07) 0%, transparent 65%)' }} />
      <div className="absolute right-7 top-7 text-[90px] font-display font-black opacity-[0.025] pointer-events-none select-none leading-none">
        $
      </div>

      {/* Top row */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-white/35 uppercase tracking-[.6px]">Saldo disponible</span>
          <span className="text-[10px] bg-mint-400/10 border border-mint-400/20 text-mint-400 font-bold px-2 py-0.5 rounded-md">
            {currency}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-mint-400" style={{ animation: 'pulse 2s infinite' }} />
          <span className="text-[11px] text-mint-400 font-semibold">Activa</span>
        </div>
      </div>

      {/* Balance amount */}
      <button
        onClick={() => setVisible(!visible)}
        className="group flex items-end gap-3 mb-1.5"
      >
        <span
          className="font-mono font-black leading-none text-white transition-all duration-300"
          style={{ fontSize: 'clamp(28px, 6vw, 44px)', letterSpacing: '-1.5px' }}
        >
          {visible ? formatCurrency(balance, currency) : '$ ••••••••••'}
        </span>
        <span className="text-white/20 mb-1 group-hover:text-white/40 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {visible
              ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
              : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
            }
          </svg>
        </span>
      </button>

      {/* Account number */}
      <p className="font-mono text-sm text-white/25 mb-7">
        Cta: {maskAccountNumber(accountNumber)}
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 pt-5 border-t border-white/[0.06]">
        {[
          { label: 'Total enviado',   value: formatCurrency(totalSent, currency),   color: 'text-danger' },
          { label: 'Total recibido',  value: formatCurrency(totalReceived, currency), color: 'text-mint-400' },
          { label: 'Transacciones',   value: transactionCount.toString(),            color: 'text-white/60' },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-[10px] text-white/30 font-semibold uppercase tracking-[.4px] mb-1">{s.label}</p>
            <p className={`font-mono font-bold text-base ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 0 1px rgba(61,245,176,.08), 0 24px 48px rgba(0,0,0,.4), 0 0 40px rgba(61,245,176,.04); }
          50%      { box-shadow: 0 0 0 1px rgba(61,245,176,.15), 0 24px 48px rgba(0,0,0,.4), 0 0 60px rgba(61,245,176,.09); }
        }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
      `}</style>
    </div>
  );
}
