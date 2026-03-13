'use client';

import { useAccount }        from '@/hooks/useAccount';
import BalanceCard           from '@/components/dashboard/BalanceCard';
import QuickActions          from '@/components/dashboard/QuickActions';
import RecentTransactions    from '@/components/dashboard/RecentTransactions';

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`rounded-2xl bg-white/[0.05] animate-pulse ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-52" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading, error, refetch } = useAccount();

  if (loading && !data) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center text-2xl">
          ⚠️
        </div>
        <p className="text-white/50 text-sm">{error}</p>
        <button
          onClick={refetch}
          className="text-mint-400 text-xs font-semibold border border-mint-400/20 px-4 py-2 rounded-lg hover:border-mint-400/50 transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { account, stats, recentTransactions } = data!;

  return (
    <div className="space-y-5 animate-slide-up">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-white tracking-tight">
            Mi cuenta
          </h1>
          <p className="text-white/35 text-sm mt-0.5">
            Resumen de tu actividad financiera
          </p>
        </div>
        <p className="text-[11px] text-white/20 font-mono hidden sm:block">
          {new Date().toLocaleDateString('es-CO', {
            weekday: 'long', day: 'numeric', month: 'long',
          })}
        </p>
      </div>

      {/* Balance card */}
      <div className="animate-slide-up [animation-delay:50ms]">
        <BalanceCard
          balance={stats.balance}
          currency={stats.currency}
          accountNumber={account.accountNumber}
          totalSent={stats.totalSent}
          totalReceived={stats.totalReceived}
          transactionCount={stats.transactionCount}
        />
      </div>

      {/* Quick actions */}
      <div className="animate-slide-up [animation-delay:100ms]">
        <QuickActions />
      </div>

      {/* Recent transactions */}
      <div className="animate-slide-up [animation-delay:150ms]">
        <RecentTransactions
          transactions={recentTransactions}
          currentAccountId={account.id}
          onRefetch={refetch}
        />
      </div>

    </div>
  );
}
