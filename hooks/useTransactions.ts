'use client';

import { useState, useEffect, useCallback } from 'react';
import { transactionsApi, type TransactionsData } from '@/lib/api/client';

interface UseTransactionsParams {
  page?:   number;
  limit?:  number;
  type?:   string;
  status?: string;
}

interface UseTransactionsReturn {
  data:    TransactionsData | null;
  loading: boolean;
  error:   string | null;
  refetch: () => Promise<void>;
}

export function useTransactions(params: UseTransactionsParams = {}): UseTransactionsReturn {
  const [data, setData]       = useState<TransactionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Stringify params to use as dep
  const paramKey = JSON.stringify(params);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await transactionsApi.list(JSON.parse(paramKey));
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading transactions');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
