import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  TransferInput,
  TransactionHistoryQuery,
} from './schemas/transaction.schema';

describe('TransactionsService', () => {
  let service: TransactionsService;

  const mockWalletsRepository = {
    findByUserId: jest.fn(),
    updateBalance: jest.fn(),
    decrementBalance: jest.fn(),
    incrementBalance: jest.fn(),
  };

  const mockUsersRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  const mockTransactionsRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
    markAsReversed: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  };

  const mockPrismaService = {
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: 'IWalletsRepository',
          useValue: mockWalletsRepository,
        },
        {
          provide: 'IUsersRepository',
          useValue: mockUsersRepository,
        },
        {
          provide: 'ITransactionsRepository',
          useValue: mockTransactionsRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('transfer', () => {
    const fromUserId = 'user-from-id';
    const transferDto: TransferInput = {
      toUserId: 'user-to-id',
      amount: 100.5,
    };

    const mockFromWallet = {
      id: 'wallet-from-id',
      userId: 'user-from-id',
      balance: 1000.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockToWallet = {
      id: 'wallet-to-id',
      userId: 'user-to-id',
      balance: 500.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockToUser = {
      id: 'user-to-id',
      email: 'to@example.com',
      password: 'hashed',
      name: 'To User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockTransaction = {
      id: 'transaction-id',
      fromUserId: 'user-from-id',
      toUserId: 'user-to-id',
      amount: 100.5,
      type: 'TRANSFER',
      status: 'COMPLETED',
      reversed: false,
      reversedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('deve realizar transferência com sucesso', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockToUser);
      mockWalletsRepository.findByUserId
        .mockResolvedValueOnce(mockFromWallet)
        .mockResolvedValueOnce(mockToWallet);

      const mockTransactionCallback = jest.fn(async (callback) => {
        const tx = {
          transaction: {
            create: jest.fn().mockResolvedValue({
              ...mockTransaction,
              status: 'PENDING',
            }),
            update: jest.fn().mockResolvedValue(mockTransaction),
          },
          wallet: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      mockPrismaService.$transaction.mockImplementation(
        mockTransactionCallback,
      );

      const result = await service.transfer(fromUserId, transferDto);

      expect(mockUsersRepository.findById).toHaveBeenCalledWith(
        transferDto.toUserId,
      );
      expect(mockWalletsRepository.findByUserId).toHaveBeenCalledWith(
        fromUserId,
      );
      expect(mockWalletsRepository.findByUserId).toHaveBeenCalledWith(
        transferDto.toUserId,
      );
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result.status).toBe('COMPLETED');
    });

    it('deve lançar NotFoundException se o destinatário não existe', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.transfer(fromUserId, transferDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersRepository.findById).toHaveBeenCalledWith(
        transferDto.toUserId,
      );
    });

    it('deve lançar BadRequestException se tentar transferir para si mesmo', async () => {
      const selfTransferDto: TransferInput = {
        toUserId: fromUserId,
        amount: 100.5,
      };

      const selfUser = {
        id: fromUserId,
        email: 'self@example.com',
        password: 'hashed',
        name: 'Self User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersRepository.findById.mockResolvedValue(selfUser);

      await expect(
        service.transfer(fromUserId, selfTransferDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se saldo insuficiente', async () => {
      const insufficientWallet = {
        ...mockFromWallet,
        balance: 50.0,
      };

      mockUsersRepository.findById.mockResolvedValue(mockToUser);
      mockWalletsRepository.findByUserId.mockResolvedValue(insufficientWallet);

      await expect(service.transfer(fromUserId, transferDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('reverse', () => {
    const userId = 'user-from-id';
    const transactionId = 'transaction-id';

    const mockOriginalTransaction = {
      id: transactionId,
      fromUserId: 'user-from-id',
      toUserId: 'user-to-id',
      amount: 100.5,
      type: 'TRANSFER',
      status: 'COMPLETED',
      reversed: false,
      reversedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockReversalTransaction = {
      id: 'reversal-id',
      fromUserId: 'user-to-id',
      toUserId: 'user-from-id',
      amount: 100.5,
      type: 'REVERSAL',
      status: 'COMPLETED',
      reversed: false,
      reversedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('deve reverter transação com sucesso', async () => {
      mockTransactionsRepository.findById.mockResolvedValue(
        mockOriginalTransaction,
      );
      mockWalletsRepository.findByUserId
        .mockResolvedValueOnce({
          id: 'wallet-to-id',
          userId: 'user-to-id',
          balance: 500.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: 'wallet-from-id',
          userId: 'user-from-id',
          balance: 900.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      const mockTransactionCallback = jest.fn(async (callback) => {
        const tx = {
          transaction: {
            create: jest.fn().mockResolvedValue({
              ...mockReversalTransaction,
              status: 'PENDING',
            }),
            update: jest.fn().mockResolvedValue(mockReversalTransaction),
          },
          wallet: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      mockPrismaService.$transaction.mockImplementation(
        mockTransactionCallback,
      );

      const result = await service.reverse(transactionId, userId);

      expect(mockTransactionsRepository.findById).toHaveBeenCalledWith(
        transactionId,
      );
      expect(result.type).toBe('REVERSAL');
      expect(result.status).toBe('COMPLETED');
    });

    it('deve lançar NotFoundException se a transação não existe', async () => {
      mockTransactionsRepository.findById.mockResolvedValue(null);

      await expect(service.reverse(transactionId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar ForbiddenException se não for o remetente', async () => {
      mockTransactionsRepository.findById.mockResolvedValue(
        mockOriginalTransaction,
      );

      await expect(
        service.reverse(transactionId, 'other-user-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar BadRequestException se já foi revertida', async () => {
      const reversedTransaction = {
        ...mockOriginalTransaction,
        reversed: true,
      };
      mockTransactionsRepository.findById.mockResolvedValue(
        reversedTransaction,
      );

      await expect(service.reverse(transactionId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException se status não é COMPLETED', async () => {
      const pendingTransaction = {
        ...mockOriginalTransaction,
        status: 'PENDING',
      };
      mockTransactionsRepository.findById.mockResolvedValue(pendingTransaction);

      await expect(service.reverse(transactionId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getHistory', () => {
    const userId = 'user-id';
    const query: TransactionHistoryQuery = {
      page: 1,
      limit: 10,
    };

    const mockTransactions = [
      {
        id: 'transaction-1',
        fromUserId: 'user-id',
        toUserId: 'other-user-id',
        amount: 100.5,
        type: 'TRANSFER',
        status: 'COMPLETED',
        reversed: false,
        reversedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('deve retornar histórico de transações com sucesso', async () => {
      mockTransactionsRepository.findMany.mockResolvedValue(mockTransactions);
      mockTransactionsRepository.count.mockResolvedValue(1);

      const result = await service.getHistory(userId, query);

      expect(mockTransactionsRepository.findMany).toHaveBeenCalledWith({
        userId,
        status: undefined,
        type: undefined,
        page: 1,
        limit: 10,
      });
      expect(mockTransactionsRepository.count).toHaveBeenCalledWith({
        userId,
        status: undefined,
        type: undefined,
      });
      expect(result.transactions).toHaveLength(1);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('deve aplicar filtros quando fornecidos', async () => {
      const queryWithFilters: TransactionHistoryQuery = {
        page: 1,
        limit: 10,
        status: 'COMPLETED',
        type: 'TRANSFER',
      };

      mockTransactionsRepository.findMany.mockResolvedValue(mockTransactions);
      mockTransactionsRepository.count.mockResolvedValue(1);

      await service.getHistory(userId, queryWithFilters);

      expect(mockTransactionsRepository.findMany).toHaveBeenCalledWith({
        userId,
        status: 'COMPLETED',
        type: 'TRANSFER',
        page: 1,
        limit: 10,
      });
    });

    it('deve calcular totalPages corretamente', async () => {
      mockTransactionsRepository.findMany.mockResolvedValue(mockTransactions);
      mockTransactionsRepository.count.mockResolvedValue(25);

      const result = await service.getHistory(userId, query);

      expect(result.pagination.totalPages).toBe(3); // 25 / 10 = 2.5, arredondado para 3
    });
  });
});
