import { NextRequest }  from 'next/server';
import prisma           from '@/lib/prisma/client';
import { requireAuth }  from '@/lib/auth/jwt';
import { ok, unauthorized, notFound, withErrorHandler } from '@/lib/utils/api';

export const GET = withErrorHandler(async (req: NextRequest) => {
  let payload;
  try { payload = requireAuth(req); } catch { return unauthorized(); }

  const phone = new URL(req.url).searchParams.get('phone');
  if (!phone) return notFound('Phone required');

  const user = await prisma.user.findUnique({
    where:  { phone, isActive: true },
    select: { id: true, name: true, phone: true },
  });

  if (!user) return notFound('User not found');

  // Do not return the own user
  if (user.id === payload.userId) {
    return notFound('You cannot send money to yourself');
  }

  return ok(user);
});
