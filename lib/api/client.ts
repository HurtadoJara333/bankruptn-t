/**
 * Cliente HTTP para las API Routes de bankruptn't
 * Replaces Apollo Client — simple fetch with automatic JWT
 */

const BASE = '/api';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('bankruptnt_token') ?? '';
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? `Error ${res.status}`);
  }

  return json.data as T;
}

// ─── Auth ─────────────────────────────────────────────────
export const authApi = {
  register: (body: {
    phone: string; name: string;
    password?: string; faceDescriptor?: number[];
    authMethod: 'PASSWORD' | 'FACE' | 'BOTH';
  }) =>
    fetch(`${BASE}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }).then(r => handleResponse<{ token: string; user: ApiUser }>(r)),

  login: (body: { phone: string; password?: string; faceDescriptor?: number[] }) =>
    fetch(`${BASE}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }).then(r => handleResponse<{ token: string; user: ApiUser }>(r)),
};

// ─── Account ──────────────────────────────────────────────
export const accountApi = {
  get: () =>
    fetch(`${BASE}/account`, { headers: authHeaders() })
      .then(r => handleResponse<AccountData>(r)),
};

// ─── Transactions ─────────────────────────────────────────
export const transactionsApi = {
  list: (params?: { page?: number; limit?: number; type?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page)   qs.set('page',   String(params.page));
    if (params?.limit)  qs.set('limit',  String(params.limit));
    if (params?.type)   qs.set('type',   params.type);
    if (params?.status) qs.set('status', params.status);
    return fetch(`${BASE}/transactions?${qs}`, { headers: authHeaders() })
      .then(r => handleResponse<TransactionsData>(r));
  },

  send: (body: { toPhone: string; amount: number; description?: string }) =>
    fetch(`${BASE}/transactions/send`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify(body),
    }).then(r => handleResponse<ApiTransaction>(r)),
};

// ─── Users ────────────────────────────────────────────────
export const usersApi = {
  findByPhone: (phone: string) =>
    fetch(`${BASE}/user/find?phone=${encodeURIComponent(phone)}`, { headers: authHeaders() })
      .then(r => handleResponse<ApiUserBasic>(r)),
};

// ─── Types ────────────────────────────────────────────────
export interface ApiUser {
  id:         string;
  phone:      string;
  name:       string;
  authMethod: string;
  createdAt:  string;
  account?:   { id: string; accountNumber: string };
}

export interface ApiUserBasic {
  id:    string;
  name:  string;
  phone: string;
}

export interface ApiAccount {
  id:            string;
  accountNumber: string;
  balance:       number;
  currency:      string;
  isActive:      boolean;
  createdAt:     string;
  user:          ApiUser;
}

export interface AccountData {
  account:            ApiAccount;
  stats: {
    balance:          number;
    currency:         string;
    totalSent:        number;
    totalReceived:    number;
    transactionCount: number;
  };
  recentTransactions: ApiTransaction[];
}

export interface ApiTransaction {
  id:            string;
  amount:        number;
  type:          string;
  status:        string;
  description?:  string;
  reference:     string;
  createdAt:     string;
  fromAccountId?: string;
  toAccountId?:  string;
  fromAccount?:  { id: string; user: ApiUserBasic };
  toAccount?:    { id: string; user: ApiUserBasic };
}

export interface TransactionsData {
  transactions: ApiTransaction[];
  total:        number;
  page:         number;
  totalPages:   number;
}
