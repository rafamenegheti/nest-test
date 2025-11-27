import { Wallet } from '@prisma/client';

export interface IWalletsRepository {
  findByUserId(userId: string): Promise<Wallet | null>;
  updateBalance(userId: string, amount: number): Promise<Wallet>;
  decrementBalance(userId: string, amount: number): Promise<Wallet>;
  incrementBalance(userId: string, amount: number): Promise<Wallet>;
}
