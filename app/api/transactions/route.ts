import { NextRequest }  from 'next/server';
import prisma           from '@/lib/prisma/client';
import { requireAuth }  from '@/lib/auth/jwt';
import { ok, unauthorized, withErrorHandler } from '@/lib/utils/api';
import type { Prisma }  from '@prisma/client';

export const GET = withErrorHandler(async (req: NextRequest) => {
  let payload;
  try { payload = requireAuth(req); } catch { return unauthorized(); }

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
  const limit  = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
  const type   = searchParams.get('type');    // send | receive | deposit
  const status = searchParams.get('status');  // PENDING | COMPLETED | FAILED
  const skip   = (page - 1) * limit;

  const account = await prisma.account.findUnique({
    where:  { userId: payload.userId },
    select: { id: true },
  });

  if (!account) return unauthorized('Cuenta no encontrada');

  // Build dynamic filter
  const baseWhere: Prisma.TransactionWhereInput = {
    OR: [{ fromAccountId: account.id }, { toAccountId: account.id }],
  };

  if (type)   baseWhere.type   = type.toUpperCase()   as Prisma.EnumTransactionTypeFilter;
  if (status) baseWhere.status = status.toUpperCase() as Prisma.EnumTransactionStatusFilter;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where:   baseWhere,
      orderBy: { createdAt: 'desc' },
      skip,
      take:    limit,
      include: {
        fromAccount: { include: { user: { select: { id: true, name: true, phone: true } } } },
        toAccount:   { include: { user: { select: { id: true, name: true, phone: true } } } },
      },
    }),
    prisma.transaction.count({ where: baseWhere }),
  ]);

  return ok({
    transactions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});
