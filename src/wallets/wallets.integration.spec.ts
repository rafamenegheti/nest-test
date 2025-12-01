import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Wallets Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;

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
    const user = await prisma.user.create({
      data: {
        email: 'wallet@example.com',
        password: passwordHash,
        name: 'Wallet User',
        wallet: {
          create: {
            balance: 1500.5,
          },
        },
      },
    });

    userId = user.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'wallet@example.com',
        password: 'password123',
      })
      .expect(200);

    accessToken = loginResponse.body.access_token;
    expect(accessToken).toBeDefined();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('GET /wallets/balance', () => {
    it('deve retornar o saldo da carteira do usuário autenticado', async () => {
      const response = await request(app.getHttpServer())
        .get('/wallets/balance')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('balance');
      expect(response.body.balance).toBe(1500.5);
      expect(response.body.userId).toBe(userId);
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('deve retornar erro 401 sem token de autenticação', async () => {
      await request(app.getHttpServer()).get('/wallets/balance').expect(401);
    });

    it('deve retornar erro 401 com token inválido', async () => {
      await request(app.getHttpServer())
        .get('/wallets/balance')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
