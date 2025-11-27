import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ITransactionsRepository,
  CreateTransactionData,
  FindTransactionsFilters,
} from './transactions.repository.interface';
import { Transaction } from '@prisma/client';

@Injectable()
export class TransactionsRepository implements ITransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTransactionData): Promise<Transaction> {
    return this.prisma.transaction.create({
      data: {
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        amount: data.amount,
        type: data.type,
        status: data.status || 'PENDING',
      },
    });
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({
      where: { id },
    });
  }

  async updateStatus(
    id: string,
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED',
  ): Promise<Transaction> {
    return this.prisma.transaction.update({
      where: { id },
      data: { status },
    });
  }

  async markAsReversed(id: string, reversedAt: Date): Promise<Transaction> {
    return this.prisma.transaction.update({
      where: { id },
      data: {
        reversed: true,
        reversedAt,
        status: 'REVERSED',
      },
    });
  }

  async findMany(filters: FindTransactionsFilters): Promise<Transaction[]> {
    const where: any = {
      OR: [{ fromUserId: filters.userId }, { toUserId: filters.userId }],
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    return this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });
  }

  async count(
    filters: Omit<FindTransactionsFilters, 'page' | 'limit'>,
  ): Promise<number> {
    const where: any = {
      OR: [{ fromUserId: filters.userId }, { toUserId: filters.userId }],
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    return this.prisma.transaction.count({ where });
  }
}
