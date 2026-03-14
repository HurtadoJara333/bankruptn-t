import { NextRequest }  from 'next/server';
import prisma           from '@/lib/prisma/client';
import { requireAuth }  from '@/lib/auth/jwt';
import { ok, unauthorized, notFound, withErrorHandler } from '@/lib/utils/api';

export const GET = withErrorHandler(async (req: NextRequest) => {
  let payload;
  try {
    payload = requireAuth(req);
  } catch {
    return unauthorized();
  }

  const account = await prisma.account.findUnique({
    where: { userId: payload.userId },
    select: {
      id:            true,
      accountNumber: true,
      balance:       true,
      currency:      true,
      isActive:      true,
      createdAt:     true,
      user: {
        select: { id: true, name: true, phone: true, authMethod: true, createdAt: true },
      },
    },
  });

  if (!account) return notFound('Account not found');

  // Aggregated statistics
  const [sentAgg, receivedAgg, txCount] = await Promise.all([
    prisma.transaction.aggregate({
      where:   { fromAccountId: account.id, status: 'COMPLETED', type: 'SEND' },
      _sum:    { amount: true },
    }),
    prisma.transaction.aggregate({
      where:   { toAccountId: account.id, status: 'COMPLETED' },
      _sum:    { amount: true },
    }),
    prisma.transaction.count({
      where: {
        OR: [{ fromAccountId: account.id }, { toAccountId: account.id }],
      },
    }),
  ]);

  // Last 5 transactions
  const recentTransactions = await prisma.transaction.findMany({
    where: {
      OR: [{ fromAccountId: account.id }, { toAccountId: account.id }],
    },
    orderBy: { createdAt: 'desc' },
    take:    5,
    include: {
      fromAccount: { include: { user: { select: { id: true, name: true, phone: true } } } },
      toAccount:   { include: { user: { select: { id: true, name: true, phone: true } } } },
    },
  });

  return ok({
    account,
    stats: {
      balance:          Number(account.balance),
      currency:         account.currency,
      totalSent:        Number(sentAgg._sum.amount ?? 0),
      totalReceived:    Number(receivedAgg._sum.amount ?? 0),
      transactionCount: txCount,
    },
    recentTransactions,
  });
});
