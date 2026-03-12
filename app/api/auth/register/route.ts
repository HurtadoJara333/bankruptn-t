import { NextRequest }  from 'next/server';
import bcrypt           from 'bcryptjs';
import { z }            from 'zod';
import prisma           from '@/lib/prisma/client';
import { generateAccountNumber } from '@/lib/prisma/helpers';
import { signToken }    from '@/lib/auth/jwt';
import { ok, error, withErrorHandler } from '@/lib/utils/api';

const schema = z.object({
  phone:          z.string().min(7),
  name:           z.string().min(2).max(60),
  password:       z.string().min(6).optional(),
  faceDescriptor: z.array(z.number()).length(128).optional(),
  authMethod:     z.enum(['PASSWORD', 'FACE', 'BOTH']),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body   = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return error(parsed.error.errors[0].message);
  }

  const { phone, name, password, faceDescriptor, authMethod } = parsed.data;

  // Validar según método
  if ((authMethod === 'PASSWORD' || authMethod === 'BOTH') && !password) {
    return error('Se requiere contraseña para este método');
  }
  if ((authMethod === 'FACE' || authMethod === 'BOTH') && !faceDescriptor) {
    return error('Se requiere el descriptor facial para este método');
  }

  // Verificar teléfono único
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) return error('El número de celular ya está registrado');

  // Hash de contraseña
  const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;

  // Crear usuario + cuenta en una transacción atómica
  const accountNumber = await generateAccountNumber();

  const user = await prisma.user.create({
    data: {
      phone,
      name,
      passwordHash,
      faceDescriptor: faceDescriptor ?? [],
      authMethod,
      account: {
        create: {
          accountNumber,
          balance:  0,
          currency: 'COP',
        },
      },
    },
    select: {
      id: true, phone: true, name: true,
      authMethod: true, createdAt: true,
      account: { select: { id: true, accountNumber: true } },
    },
  });

  const token = signToken({ userId: user.id, phone: user.phone });

  return ok({ token, user }, 201);
});
