import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IWalletsRepository } from './wallets.repository.interface';
import { Wallet } from '@prisma/client';

@Injectable()
export class WalletsRepository implements IWalletsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({
      where: { userId },
    });
  }

  async updateBalance(userId: string, amount: number): Promise<Wallet> {
    return this.prisma.wallet.update({
      where: { userId },
      data: {
        balance: amount,
      },
    });
  }

  async decrementBalance(userId: string, amount: number): Promise<Wallet> {
    return this.prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });
  }

  async incrementBalance(userId: string, amount: number): Promise<Wallet> {
    return this.prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }
}
