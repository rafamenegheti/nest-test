import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('Transactions Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let fromUserId: string;
  let toUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  beforeEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('password123', 10);

    const fromUser = await prisma.user.create({
      data: {
        email: 'from@example.com',
        password: passwordHash,
        name: 'From User',
        wallet: {
          create: {
            balance: 1000.0,
          },
        },
      },
    });

    const toUser = await prisma.user.create({
      data: {
        email: 'to@example.com',
        password: passwordHash,
        name: 'To User',
        wallet: {
          create: {
            balance: 500.0,
          },
        },
      },
    });

    fromUserId = fromUser.id;
    toUserId = toUser.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'from@example.com',
        password: 'password123',
      })
      .expect(200);

    accessToken = loginResponse.body.access_token;
    expect(accessToken).toBeDefined();
  });

  afterEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /transactions/transfer', () => {
    it('deve realizar transferência com sucesso', async () => {
      const transferDto = {
        toUserId,
        amount: 100.5,
      };

      const response = await request(app.getHttpServer())
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transferDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.fromUserId).toBe(fromUserId);
      expect(response.body.toUserId).toBe(toUserId);
      expect(response.body.amount).toBe(100.5);
      expect(response.body.status).toBe('COMPLETED');
      expect(response.body.type).toBe('TRANSFER');

      const fromWallet = await prisma.wallet.findUnique({
        where: { userId: fromUserId },
      });

      const toWallet = await prisma.wallet.findUnique({
        where: { userId: toUserId },
      });

      expect(Number(fromWallet?.balance)).toBe(899.5);
      expect(Number(toWallet?.balance)).toBe(600.5);
    });

    it('deve retornar erro se saldo insuficiente', async () => {
      const transferDto = {
        toUserId,
        amount: 2000.0,
      };

      const response = await request(app.getHttpServer())
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transferDto);

      expect([400, 401]).toContain(response.status);
      if (response.status === 400) {
        expect(response.body.message).toContain('Saldo insuficiente');
      }
    });
  });

  describe('GET /wallets/balance', () => {
    it('deve retornar o saldo da carteira', async () => {
      const response = await request(app.getHttpServer())
        .get('/wallets/balance')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('balance');
      expect(response.body).toHaveProperty('userId');
      expect(response.body.userId).toBe(fromUserId);
      expect(response.body.balance).toBe(1000.0);
    });
  });
});
