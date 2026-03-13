'use client';

import { useState }         from 'react';
import { useTransactions }  from '@/hooks/useTransactions';
import { useAccount }       from '@/hooks/useAccount';
import TransactionRow       from '@/components/transactions/TransactionRow';
import { cn }               from '@/lib/utils/cn';

type FilterType = 'all' | 'SEND' | 'RECEIVE' | 'DEPOSIT' | 'pending';

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all',     label: 'Todos'      },
  { id: 'RECEIVE', label: 'Recibidos'  },
  { id: 'SEND',    label: 'Enviados'   },
  { id: 'DEPOSIT', label: 'Depósitos'  },
  { id: 'pending', label: 'Pendientes' },
];

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`rounded-xl bg-white/5 animate-pulse ${className}`} />;
}

export default function TransactionsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage]     = useState(1);

  // Build query params from filter
  const queryParams = {
    page,
    limit:  15,
    type:   filter !== 'all' && filter !== 'pending' ? filter : undefined,
    status: filter === 'pending' ? 'PENDING' : undefined,
  };

  const { data, loading }     = useTransactions(queryParams);
  const { data: accountData } = useAccount();

  const accountId = accountData?.account?.id ?? '';
  const paginated = data;

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-white tracking-tight">Movimientos</h1>
          <p className="text-white/35 text-sm mt-0.5">Historial completo de transacciones</p>
        </div>
        {paginated && (
          <div className="bg-mint-400/8 border border-mint-400/15 rounded-xl px-4 py-2 self-start">
            <span className="text-mint-400 text-sm font-bold font-mono">{paginated.total}</span>
            <span className="text-mint-400/60 text-xs ml-1">transacciones</span>
          </div>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); setPage(1); }}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200',
              filter === f.id
                ? 'bg-mint-400/15 border-mint-400/30 text-mint-400'
                : 'bg-transparent border-border text-white/40 hover:text-white/60 hover:border-white/20'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="card overflow-hidden">

        {/* Desktop column headers */}
        <div className="hidden sm:grid grid-cols-[1fr_150px_130px_100px] px-5 py-3 border-b border-border bg-white/[0.02]">
          {['Descripción', 'Monto', 'Estado', 'Fecha'].map((h) => (
            <span key={h} className="text-[10px] font-bold text-white/30 uppercase tracking-[.6px]">{h}</span>
          ))}
        </div>

        {/* Loading */}
        {loading && !paginated && (
          <div className="p-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        )}

        {/* Empty */}
        {!loading && paginated?.transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-border flex items-center justify-center text-xl">📭</div>
            <p className="text-white/30 text-sm">Sin movimientos en este filtro</p>
          </div>
        )}

        {/* Desktop rows */}
        {paginated && paginated.transactions.length > 0 && (
          <>
            <div className="hidden sm:block divide-y divide-border/50">
              {paginated.transactions.map((tx) => {
                const isIncoming = tx.toAccountId === accountId || tx.type === 'DEPOSIT';
                const sign       = isIncoming ? '+' : '-';
                const color      = isIncoming ? 'text-mint-400' : 'text-danger';
                const peer       = isIncoming ? tx.fromAccount?.user : tx.toAccount?.user;
                const name       = peer?.name ?? (tx.type === 'DEPOSIT' ? 'Depósito' : 'Transferencia');
                const STATUS_STYLES: Record<string, string> = {
                  COMPLETED: 'bg-mint-400/8 border-mint-400/15 text-mint-400',
                  PENDING:   'bg-warning/8 border-warning/15 text-warning',
                  FAILED:    'bg-danger/8 border-danger/15 text-danger',
                };
                const STATUS_LABELS: Record<string, string> = {
                  COMPLETED: '✓ Completado',
                  PENDING:   '⏳ Pendiente',
                  FAILED:    '✕ Fallido',
                };
                return (
                  <div
                    key={tx.id}
                    className="grid grid-cols-[1fr_150px_130px_100px] px-5 items-center hover:bg-mint-400/[0.02] transition-colors"
                  >
                    {/* Name */}
                    <div className="py-3.5 flex items-center gap-3 min-w-0">
                      <div className={cn(
                        'w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold border',
                        isIncoming ? 'bg-mint-400/8 border-mint-400/15 text-mint-400' : 'bg-danger/6 border-danger/12 text-danger'
                      )}>
                        {name.split(' ').slice(0,2).map((w: string) => w[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{name}</p>
                        <p className="text-xs text-white/25 font-mono truncate">{tx.reference}</p>
                      </div>
                    </div>
                    {/* Amount */}
                    <p className={cn('font-mono font-bold text-sm', color)}>
                      {sign}{new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0}).format(Number(tx.amount))}
                    </p>
                    {/* Status */}
                    <div>
                      <span className={cn('text-[10px] font-bold px-2 py-1 rounded-lg border', STATUS_STYLES[tx.status] ?? STATUS_STYLES.PENDING)}>
                        {STATUS_LABELS[tx.status] ?? tx.status}
                      </span>
                    </div>
                    {/* Date */}
                    <p className="text-xs text-white/25">
                      {new Date(tx.createdAt).toLocaleDateString('es-CO', { day:'numeric', month:'short' })}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Mobile rows */}
            <div className="sm:hidden divide-y divide-border/50">
              {paginated.transactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} currentAccountId={accountId} />
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {paginated && paginated.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-white/[0.02]">
            <span className="text-xs text-white/30">
              Página {paginated.page} de {paginated.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-border text-xs text-white/40 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(paginated.totalPages, p + 1))}
                disabled={page === paginated.totalPages}
                className="px-3 py-1.5 rounded-lg border border-border text-xs text-white/40 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
