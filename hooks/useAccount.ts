'use client';

import { useState, useEffect, useCallback } from 'react';
import { accountApi, type AccountData } from '@/lib/api/client';

interface UseAccountReturn {
  data:    AccountData | null;
  loading: boolean;
  error:   string | null;
  refetch: () => Promise<void>;
}

export function useAccount(): UseAccountReturn {
  const [data, setData]       = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await accountApi.get();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading account');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
