import prisma from './client';

/**
 * Genera un número de cuenta único de 10 dígitos
 */
export async function generateAccountNumber(): Promise<string> {
  let accountNumber: string;
  let exists = true;

  do {
    accountNumber = Math.floor(
      1_000_000_000 + Math.random() * 9_000_000_000
    ).toString();
    exists = !!(await prisma.account.findUnique({ where: { accountNumber } }));
  } while (exists);

  return accountNumber;
}

/**
 * Genera una referencia única tipo TXN-XXXXXXXX
 */
export async function generateReference(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let reference: string;
  let exists = true;

  do {
    const random = Array.from({ length: 8 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
    reference = `TXN-${random}`;
    exists = !!(await prisma.transaction.findUnique({ where: { reference } }));
  } while (exists);

  return reference;
}
