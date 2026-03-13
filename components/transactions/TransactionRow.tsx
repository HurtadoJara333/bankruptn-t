'use client';

import { formatCurrency, formatRelativeDate } from '@/lib/utils/currency';
import { cn }          from '@/lib/utils/cn';
import type { ApiTransaction } from '@/lib/api/client';

interface TransactionRowProps {
  tx:               ApiTransaction;
  currentAccountId: string;
  compact?:         boolean;
}

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-mint-400/8 text-mint-400 border-mint-400/15',
  PENDING:   'bg-warning/8 text-warning border-warning/15',
  FAILED:    'bg-danger/8 text-danger border-danger/15',
};
const STATUS_LABELS: Record<string, string> = {
  COMPLETED: '✓ Completado',
  PENDING:   '⏳ Pendiente',
  FAILED:    '✕ Fallido',
};

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function TransactionRow({ tx, currentAccountId, compact = false }: TransactionRowProps) {
  const isIncoming  = tx.toAccountId === currentAccountId || tx.type === 'DEPOSIT';
  const sign        = isIncoming ? '+' : '-';
  const colorClass  = isIncoming ? 'text-mint-400' : 'text-danger';
  const bgClass     = isIncoming ? 'bg-mint-400/10' : 'bg-danger/8';
  const borderClass = isIncoming ? 'border-mint-400/15' : 'border-danger/12';

  const peer        = isIncoming ? tx.fromAccount?.user : tx.toAccount?.user;
  const displayName = peer?.name ?? (tx.type === 'DEPOSIT' ? 'Depósito' : 'Transferencia');
  const displaySub  = peer?.phone ?? tx.reference;

  return (
    <div className={cn(
      'flex items-center gap-3 transition-colors',
      compact ? 'py-3' : 'py-3.5 px-5 hover:bg-mint-400/[0.02]'
    )}>
      <div className={cn(
        'flex-shrink-0 flex items-center justify-center rounded-xl font-bold text-xs border',
        compact ? 'w-9 h-9' : 'w-10 h-10',
        bgClass, borderClass,
      )}>
        <span className={colorClass}>{initials(displayName)}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{displayName}</p>
        <p className="text-xs text-white/30 font-mono truncate">{displaySub}</p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={cn('font-mono font-bold text-sm', colorClass)}>
          {sign}{formatCurrency(Number(tx.amount), 'COP')}
        </p>
        {!compact && (
          <span className={cn(
            'text-[10px] font-bold px-1.5 py-0.5 rounded border mt-0.5 inline-block',
            STATUS_STYLES[tx.status] ?? STATUS_STYLES.PENDING
          )}>
            {STATUS_LABELS[tx.status] ?? tx.status}
          </span>
        )}
        <p className="text-[10px] text-white/25 mt-0.5">{formatRelativeDate(tx.createdAt)}</p>
      </div>
    </div>
  );
}
