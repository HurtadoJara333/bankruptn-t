import { NextRequest } from 'next/server';
import prisma          from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/jwt';
import { ok, unauthorized, withErrorHandler } from '@/lib/utils/api';

export const GET = withErrorHandler(async (req: NextRequest) => {
  let payload;
  try { payload = requireAuth(req); } catch { return unauthorized(); }

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
  const limit  = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
  const type   = searchParams.get('type')?.toUpperCase();
  const status = searchParams.get('status')?.toUpperCase();
  const skip   = (page - 1) * limit;

  const account = await prisma.account.findUnique({
    where:  { userId: payload.userId },
    select: { id: true },
  });

  if (!account) return unauthorized('Cuenta no encontrada');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    OR: [{ fromAccountId: account.id }, { toAccountId: account.id }],
    ...(type   ? { type }   : {}),
    ...(status ? { status } : {}),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        fromAccount: { include: { user: { select: { id: true, name: true, phone: true } } } },
        toAccount:   { include: { user: { select: { id: true, name: true, phone: true } } } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return ok({ transactions, total, page, totalPages: Math.ceil(total / limit) });
});