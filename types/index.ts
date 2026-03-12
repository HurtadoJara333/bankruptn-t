// ─── User ──────────────────────────────────────────────────
export interface User {
  id: string;
  phone: string;
  name: string;
  authMethod: 'password' | 'face' | 'both';
  accountId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

// ─── Account ───────────────────────────────────────────────
export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Transaction ───────────────────────────────────────────
export type TransactionType   = 'send' | 'receive' | 'deposit' | 'withdrawal';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  fromAccountId?: string;
  toAccountId?: string;
  fromUser?: Pick<User, 'id' | 'name' | 'phone'>;
  toUser?:   Pick<User, 'id' | 'name' | 'phone'>;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  reference: string;
  createdAt: string;
}

// ─── GraphQL Inputs ────────────────────────────────────────
export interface RegisterInput {
  phone: string;
  name: string;
  password?: string;
  faceDescriptor?: number[];
  authMethod: 'password' | 'face' | 'both';
}

export interface LoginInput {
  phone: string;
  password?: string;
  faceDescriptor?: number[];
}

export interface SendMoneyInput {
  toPhone: string;
  amount: number;
  description?: string;
}

// ─── Pagination ────────────────────────────────────────────
export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── Dashboard Stats ───────────────────────────────────────
export interface DashboardStats {
  balance: number;
  currency: string;
  totalSent: number;
  totalReceived: number;
  transactionCount: number;
  recentTransactions: Transaction[];
}
