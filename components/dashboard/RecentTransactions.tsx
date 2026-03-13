'use client';

import Link from 'next/link';
import TransactionRow      from '@/components/transactions/TransactionRow';
import type { ApiTransaction } from '@/lib/api/client';

interface RecentTransactionsProps {
  transactions:     ApiTransaction[];
  currentAccountId: string;
  onRefetch?:       () => void;
}

export default function RecentTransactions({
  transactions, currentAccountId, onRefetch,
}: RecentTransactionsProps) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="font-display font-bold text-white text-base">Recent transactions</h3>
          <p className="text-white/30 text-xs mt-0.5">Latest account activity</p>
        </div>
        <div className="flex items-center gap-2">
          {onRefetch && (
            <button onClick={onRefetch} title="Refresh"
              className="text-white/20 hover:text-white/50 transition-colors p-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
          )}
          <Link href="/transactions"
            className="text-xs text-mint-400 font-semibold hover:text-mint-300 border border-mint-400/20 hover:border-mint-400/40 px-3 py-1.5 rounded-lg transition-all">
            View all
          </Link>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-border flex items-center justify-center text-2xl">📭</div>
          <p className="text-white/30 text-sm">No transactions yet</p>
          <Link href="/send" className="text-mint-400 text-xs font-semibold hover:text-mint-300 transition-colors">
            Make your first transfer →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} currentAccountId={currentAccountId} />
          ))}
        </div>
      )}
    </div>
  );
}
