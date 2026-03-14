import { NextRequest }  from 'next/server';
import { z }            from 'zod';
import prisma           from '@/lib/prisma/client';
import { generateReference } from '@/lib/prisma/helpers';
import { requireAuth }  from '@/lib/auth/jwt';
import { ok, error, unauthorized, withErrorHandler } from '@/lib/utils/api';
import { Decimal }      from '@prisma/client/runtime/library';

const schema = z.object({
  toPhone:     z.string().min(7),
  amount:      z.number().positive(),
  description: z.string().max(200).optional(),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  let payload;
  try { payload = requireAuth(req); } catch { return unauthorized(); }

  const body   = await req.json();
  const parsed = schema.safeParse(body);
if (!parsed.success) return error(parsed.error.errors[0]?.message ?? 'invalid data');

  const { toPhone, amount, description } = parsed.data;

  // Obtener cuenta origen
  const fromAccount = await prisma.account.findUnique({
    where:   { userId: payload.userId },
    include: { user: { select: { id: true, phone: true } } },
  });

  if (!fromAccount)         return error('Your account was not found');
  if (!fromAccount.isActive) return error('Your account is inactive');

  // Check that not sending to self
  if (fromAccount.user.phone === toPhone) {
    return error('You cannot send money to yourself');
  }

  // Get destination account
  const toUser = await prisma.user.findUnique({
    where:   { phone: toPhone, isActive: true },
    include: { account: true },
  });

  if (!toUser)          return error('Recipient does not exist');
  if (!toUser.account)  return error('Recipient does not have an active account');

  // Check sufficient balance
  if (new Decimal(fromAccount.balance).lessThan(amount)) {
    return error('Insufficient balance');
  }

  const reference = await generateReference();

  // Transacción atómica con Prisma $transaction
  const [transaction] = await prisma.$transaction([
    // 1. Crear registro de transacción
    prisma.transaction.create({
      data: {
        amount,
        type:          'SEND',
        status:        'COMPLETED',
        description,
        reference,
        fromAccountId: fromAccount.id,
        toAccountId:   toUser.account.id,
      },
      include: {
        toAccount: { include: { user: { select: { id: true, name: true, phone: true } } } },
      },
    }),
    // 2. Debitar cuenta origen
    prisma.account.update({
      where: { id: fromAccount.id },
      data:  { balance: { decrement: amount } },
    }),
    // 3. Acreditar cuenta destino
    prisma.account.update({
      where: { id: toUser.account.id },
      data:  { balance: { increment: amount } },
    }),
  ]);

  return ok(transaction, 201);
});
