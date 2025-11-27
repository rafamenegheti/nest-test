import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { WalletsService } from './wallets.service';

describe('WalletsService', () => {
  let service: WalletsService;

  const mockRepository = {
    findByUserId: jest.fn(),
    updateBalance: jest.fn(),
    decrementBalance: jest.fn(),
    incrementBalance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        {
          provide: 'IWalletsRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    const userId = 'user-id';
    const mockWallet = {
      id: 'wallet-id',
      userId: 'user-id',
      balance: new Prisma.Decimal(1000.5),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    it('deve retornar o saldo da carteira com sucesso', async () => {
      mockRepository.findByUserId.mockResolvedValue(mockWallet);

      const result = await service.getBalance(userId);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        balance: 1000.5,
        userId: mockWallet.userId,
        updatedAt: mockWallet.updatedAt.toISOString(),
      });
    });

    it('deve lançar NotFoundException se a carteira não existe', async () => {
      mockRepository.findByUserId.mockResolvedValue(null);

      await expect(service.getBalance(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('deve converter Decimal para number corretamente', async () => {
      const walletWithDecimal = {
        ...mockWallet,
        balance: new Prisma.Decimal(500.25),
      };
      mockRepository.findByUserId.mockResolvedValue(walletWithDecimal);

      const result = await service.getBalance(userId);

      expect(result.balance).toBe(500.25);
      expect(typeof result.balance).toBe('number');
    });
  });
});
