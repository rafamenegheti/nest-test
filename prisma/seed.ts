import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      password: passwordHash,
      name: 'Alice Silva',
      wallet: {
        create: {
          balance: 1000.0,
        },
      },
    },
    include: {
      wallet: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      password: passwordHash,
      name: 'Bob Santos',
      wallet: {
        create: {
          balance: 500.0,
        },
      },
    },
    include: {
      wallet: true,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      password: passwordHash,
      name: 'Charlie Oliveira',
      wallet: {
        create: {
          balance: 2000.0,
        },
      },
    },
    include: {
      wallet: true,
    },
  });

  const transaction1 = await prisma.transaction.create({
    data: {
      fromUserId: user1.id,
      toUserId: user2.id,
      amount: 100.0,
      type: 'TRANSFER',
      status: 'COMPLETED',
    },
  });

  const transaction2 = await prisma.transaction.create({
    data: {
      fromUserId: user3.id,
      toUserId: user1.id,
      amount: 250.0,
      type: 'TRANSFER',
      status: 'COMPLETED',
    },
  });
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
