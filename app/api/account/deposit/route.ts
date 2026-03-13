import { NextRequest } from 'next/server';
import { z }           from 'zod';
import prisma          from '@/lib/prisma/client';
import { generateReference } from '@/lib/prisma/helpers';
import { requireAuth } from '@/lib/auth/jwt';
import { ok, error, unauthorized, withErrorHandler } from '@/lib/utils/api';

const schema = z.object({
  amount:      z.number().positive(),
  description: z.string().max(200).optional(),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  let payload;
  try { payload = requireAuth(req); } catch { return unauthorized(); }

  const body   = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error('Datos inválidos');

  const { amount, description } = parsed.data;

  const account = await prisma.account.findUnique({
    where: { userId: payload.userId },
  });

  if (!account) return error('Cuenta no encontrada');

  const reference = await generateReference();

  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        amount,
        type:        'DEPOSIT',
        status:      'COMPLETED',
        description: description ?? 'Balance recharge',
        reference,
        toAccountId: account.id,
      },
    }),
    prisma.account.update({
      where: { id: account.id },
      data:  { balance: { increment: amount } },
    }),
  ]);

  return ok(transaction, 201);
});
