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
  if (!parsed.success) return error(parsed.data?.[0]?.message ?? 'Datos inválidos');

  const { toPhone, amount, description } = parsed.data;

  // Obtener cuenta origen
  const fromAccount = await prisma.account.findUnique({
    where:   { userId: payload.userId },
    include: { user: { select: { id: true, phone: true } } },
  });

  if (!fromAccount)         return error('Tu cuenta no fue encontrada');
  if (!fromAccount.isActive) return error('Tu cuenta está inactiva');

  // Verificar que no se envíe a sí mismo
  if (fromAccount.user.phone === toPhone) {
    return error('No puedes enviarte dinero a ti mismo');
  }

  // Obtener cuenta destino
  const toUser = await prisma.user.findUnique({
    where:   { phone: toPhone, isActive: true },
    include: { account: true },
  });

  if (!toUser)          return error('El destinatario no existe');
  if (!toUser.account)  return error('El destinatario no tiene cuenta activa');

  // Verificar saldo suficiente
  if (new Decimal(fromAccount.balance).lessThan(amount)) {
    return error('Saldo insuficiente');
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
