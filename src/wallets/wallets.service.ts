import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IWalletsRepository } from './wallets.repository.interface';
import { WalletBalanceResponse } from './schemas/wallet.schema';

@Injectable()
export class WalletsService {
  constructor(
    @Inject('IWalletsRepository')
    private readonly walletsRepository: IWalletsRepository,
  ) {}

  async getBalance(userId: string): Promise<WalletBalanceResponse> {
    const wallet = await this.walletsRepository.findByUserId(userId);

    if (!wallet) {
      throw new NotFoundException('Carteira não encontrada');
    }

    return {
      balance: Number(wallet.balance),
      userId: wallet.userId,
      updatedAt: wallet.updatedAt.toISOString(),
    };
  }
}
