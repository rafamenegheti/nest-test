import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('Users Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /users', () => {
    it('deve criar um usuário com sucesso', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(createUserDto.email);
      expect(response.body.name).toBe(createUserDto.name);
      expect(response.body).not.toHaveProperty('password');

      const userInDb = await prisma.user.findUnique({
        where: { email: createUserDto.email },
        include: { wallet: true },
      });

      expect(userInDb).toBeTruthy();
      expect(userInDb?.wallet).toBeTruthy();
      expect(Number(userInDb?.wallet?.balance)).toBe(0);
    });

    it('deve retornar erro se email já existe', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(409);
    });
  });
});
