import { Wallet } from '@prisma/client';

export interface IWalletsRepository {
  findByUserId(userId: string): Promise<Wallet | null>;
}
