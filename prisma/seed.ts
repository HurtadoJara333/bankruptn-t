import { PrismaClient } from '@prisma/client';
import bcrypt           from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Demo user
  const passwordHash = await bcrypt.hash('demo123', 12);

  const user1 = await prisma.user.upsert({
    where:  { phone: '+573001234567' },
    update: {},
    create: {
      phone:        '+573001234567',
      name:         'Juan Demo',
      passwordHash,
      authMethod:   'PASSWORD',
      account: {
        create: {
          accountNumber: '1234567890',
          balance:       2_500_000,
          currency:      'COP',
        },
      },
    },
    include: { account: true },
  });

  const user2 = await prisma.user.upsert({
    where:  { phone: '+573009876543' },
    update: {},
    create: {
      phone:        '+573009876543',
      name:         'Valentina Ríos',
      passwordHash: await bcrypt.hash('demo456', 12),
      authMethod:   'PASSWORD',
      account: {
        create: {
          accountNumber: '0987654321',
          balance:       500_000,
          currency:      'COP',
        },
      },
    },
    include: { account: true },
  });

  // Example transactions
  if (user1.account && user2.account) {
    await prisma.transaction.createMany({
      skipDuplicates: true,
      data: [
        {
          amount:        150_000,
          type:          'SEND',
          status:        'COMPLETED',
          description:   'Fee payment',
          reference:     'TXN-DEMO0001',
          fromAccountId: user1.account.id,
          toAccountId:   user2.account.id,
        },
        {
          amount:        500_000,
          type:          'DEPOSIT',
          status:        'COMPLETED',
          description:   'Initial recharge',
          reference:     'TXN-DEMO0002',
          toAccountId:   user1.account.id,
        },
        {
          amount:        85_000,
          type:          'SEND',
          status:        'COMPLETED',
          description:   'Almuerzo',
          reference:     'TXN-DEMO0003',
          fromAccountId: user2.account.id,
          toAccountId:   user1.account.id,
        },
      ],
    });
  }

  console.log('✅ Seed completed');
  console.log('   📱 Login demo: +573001234567 / demo123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
