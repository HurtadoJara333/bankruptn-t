'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, type ApiUser } from '@/lib/api/client';

interface AuthContextValue {
  user: ApiUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login:    (input: { phone: string; password?: string; faceDescriptor?: number[] }) => Promise<void>;
  register: (input: { phone: string; name: string; password?: string; faceDescriptor?: number[]; authMethod: 'PASSWORD' | 'FACE' | 'BOTH' }) => Promise<void>;
  logout:   () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY   = 'bankruptnt_token';
const USER_KEY    = 'bankruptnt_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser]         = useState<ApiUser | null>(null);
  const [isLoading, setLoading] = useState(true);

  // Restaurar sesión desde localStorage
  useEffect(() => {
    const token    = localStorage.getItem(TOKEN_KEY);
    const userData = localStorage.getItem(USER_KEY);
    if (token && userData) {
      try { setUser(JSON.parse(userData)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const persist = useCallback((token: string, userData: ApiUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    document.cookie = `bankruptnt_token=${token}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
  }, []);

  const login = useCallback(async (input: Parameters<typeof authApi.login>[0]) => {
    const { token, user: userData } = await authApi.login(input);
    persist(token, userData);
    setUser(userData);
    router.push('/dashboard');
  }, [persist, router]);

  const register = useCallback(async (input: Parameters<typeof authApi.register>[0]) => {
    const { token, user: userData } = await authApi.register(input);
    persist(token, userData);
    setUser(userData);
    router.push('/dashboard');
  }, [persist, router]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = 'bankruptnt_token=; path=/; max-age=0';
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
