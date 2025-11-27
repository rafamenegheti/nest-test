import { Transaction } from '@prisma/client';

export interface CreateTransactionData {
  fromUserId: string;
  toUserId: string;
  amount: number;
  type: 'TRANSFER' | 'REVERSAL';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
}

export interface ITransactionsRepository {
  create(data: CreateTransactionData): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  updateStatus(
    id: string,
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED',
  ): Promise<Transaction>;
  markAsReversed(id: string, reversedAt: Date): Promise<Transaction>;
}
