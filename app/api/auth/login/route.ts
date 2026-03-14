import { NextRequest } from 'next/server';
import bcrypt          from 'bcryptjs';
import { z }           from 'zod';
import prisma          from '@/lib/prisma/client';
import { signToken }   from '@/lib/auth/jwt';
import { ok, error, withErrorHandler } from '@/lib/utils/api';

const schema = z.object({
  phone:          z.string().min(7),
  password:       z.string().optional(),
  faceDescriptor: z.array(z.number()).length(128).optional(),
});

// Distancia euclidiana entre dos descriptores faciales
function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body   = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return error(parsed.error.errors[0].message);
  }

  const { phone, password, faceDescriptor } = parsed.data;

  if (!password && !faceDescriptor) {
    return error('You must provide password or facial descriptor');
  }

  const user = await prisma.user.findUnique({
    where: { phone, isActive: true },
    select: {
      id: true, phone: true, name: true, authMethod: true,
      passwordHash: true, faceDescriptor: true, createdAt: true,
      account: { select: { id: true, accountNumber: true } },
    },
  });

  if (!user) return error('Invalid credentials', 401);

  let authenticated = false;

  // Auth with password
  if (password && user.passwordHash) {
    authenticated = await bcrypt.compare(password, user.passwordHash);
  }

  // Auth facial — comparar descriptores
  if (!authenticated && faceDescriptor && user.faceDescriptor.length === 128) {
    const threshold = parseFloat(process.env.FACE_MATCH_THRESHOLD ?? '0.55');
    const distance  = euclideanDistance(faceDescriptor, user.faceDescriptor);
    authenticated   = distance <= threshold;
  }

  if (!authenticated) return error('Invalid credentials', 401);

  const token = signToken({ userId: user.id, phone: user.phone });

  // Do not send sensitive data
  const { passwordHash: _, faceDescriptor: __, ...safeUser } = user;

  return ok({ token, user: safeUser });
});
