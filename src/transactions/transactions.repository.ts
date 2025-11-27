import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ITransactionsRepository,
  CreateTransactionData,
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
}
