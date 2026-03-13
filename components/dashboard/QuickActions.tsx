'use client';

import Link from 'next/link';

const ACTIONS = [
  {
    href:    '/send',
    label:   'Enviar dinero',
    sub:     'Transfiere al instante',
    emoji:   '↗',
    color:   'from-mint-500/15 to-mint-400/5',
    border:  'border-mint-500/20 hover:border-mint-500/50',
    iconBg:  'bg-mint-400/10 border-mint-400/20',
    iconClr: 'text-mint-400',
  },
  {
    href:    '/receive',
    label:   'Recibir dinero',
    sub:     'Comparte tu número o QR',
    emoji:   '↙',
    color:   'from-night-800/60 to-night-900/40',
    border:  'border-border hover:border-mint-500/30',
    iconBg:  'bg-white/5 border-white/10',
    iconClr: 'text-white/50',
  },
] as const;

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ACTIONS.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className={`
            group relative flex items-center gap-3 p-4 rounded-2xl border
            bg-gradient-to-br ${a.color} ${a.border}
            transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card
          `}
        >
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
            border text-xl font-bold ${a.iconBg} ${a.iconClr}
          `}>
            {a.emoji}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{a.label}</p>
            <p className="text-xs text-white/35 mt-0.5">{a.sub}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
