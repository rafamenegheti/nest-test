import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { IWalletsRepository } from '../wallets/wallets.repository.interface';
import { IUsersRepository } from '../users/users.repository.interface';
import { ITransactionsRepository } from './transactions.repository.interface';
import { PrismaService } from '../prisma/prisma.service';
import {
  TransferInput,
  TransactionResponse,
} from './schemas/transaction.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject('IWalletsRepository')
    private readonly walletsRepository: IWalletsRepository,
    @Inject('IUsersRepository')
    private readonly usersRepository: IUsersRepository,
    @Inject('ITransactionsRepository')
    private readonly transactionsRepository: ITransactionsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async transfer(
    fromUserId: string,
    transferDto: TransferInput,
  ): Promise<TransactionResponse> {
    const toUser = await this.usersRepository.findById(transferDto.toUserId);
    if (!toUser) {
      throw new NotFoundException('Usuário destinatário não encontrado');
    }

    // valida se não está tentando transferir para si mesmo
    if (fromUserId === transferDto.toUserId) {
      throw new BadRequestException('Não é possível transferir para si mesmo');
    }

    const fromWallet = await this.walletsRepository.findByUserId(fromUserId);
    if (!fromWallet) {
      throw new NotFoundException('Carteira do remetente não encontrada');
    }

    // valida se tem saldo suficiente
    const currentBalance = Number(fromWallet.balance);
    if (currentBalance < transferDto.amount) {
      throw new BadRequestException('Saldo insuficiente');
    }

    // busca a carteira do destinatário
    const toWallet = await this.walletsRepository.findByUserId(
      transferDto.toUserId,
    );
    if (!toWallet) {
      throw new NotFoundException('Carteira do destinatário não encontrada');
    }

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          fromUserId,
          toUserId: transferDto.toUserId,
          amount: transferDto.amount,
          type: 'TRANSFER',
          status: 'PENDING',
        },
      });

      try {
        await tx.wallet.update({
          where: { userId: fromUserId },
          data: {
            balance: {
              decrement: transferDto.amount,
            },
          },
        });

        await tx.wallet.update({
          where: { userId: transferDto.toUserId },
          data: {
            balance: {
              increment: transferDto.amount,
            },
          },
        });

        const completedTransaction = await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: 'COMPLETED' },
        });

        return this.mapToTransactionResponse(completedTransaction);
      } catch (error) {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: 'FAILED' },
        });
        throw error;
      }
    });
  }

  async reverse(transactionId: string, userId: string): Promise<TransactionResponse> {
    const originalTransaction = await this.transactionsRepository.findById(
      transactionId,
    );

    if (!originalTransaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    // valida se o usuário é quem enviou a transação
    if (originalTransaction.fromUserId !== userId) {
      throw new ForbiddenException(
        'Apenas quem enviou a transferência pode revertê-la',
      );
    }

    // valida se a transação pode ser revertida
    if (originalTransaction.reversed) {
      throw new BadRequestException('Transação já foi revertida');
    }

    if (originalTransaction.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Apenas transações completadas podem ser revertidas',
      );
    }

    if (originalTransaction.type !== 'TRANSFER') {
      throw new BadRequestException('Apenas transferências podem ser revertidas');
    }

    // valida se as carteiras existem
    const fromWallet = await this.walletsRepository.findByUserId(
      originalTransaction.toUserId,
    );
    if (!fromWallet) {
      throw new NotFoundException('Carteira do destinatário não encontrada');
    }

    const toWallet = await this.walletsRepository.findByUserId(
      originalTransaction.fromUserId,
    );
    if (!toWallet) {
      throw new NotFoundException('Carteira do remetente não encontrada');
    }

    // valida se o destinatário tem saldo suficiente para reverter
    const recipientBalance = Number(fromWallet.balance);
    const amount = Number(originalTransaction.amount);
    if (recipientBalance < amount) {
      throw new BadRequestException(
        'Destinatário não possui saldo suficiente para reverter a transação',
      );
    }

    // executa a reversão em uma transação do banco
    return this.prisma.$transaction(async (tx) => {
      // cria a transação de reversão
      const reversalTransaction = await tx.transaction.create({
        data: {
          fromUserId: originalTransaction.toUserId,
          toUserId: originalTransaction.fromUserId,
          amount: amount,
          type: 'REVERSAL',
          status: 'PENDING',
        },
      });

      try {
        // decrementa o saldo do destinatário original (que recebeu)
        await tx.wallet.update({
          where: { userId: originalTransaction.toUserId },
          data: {
            balance: {
              decrement: amount,
            },
          },
        });

        // incrementa o saldo do remetente original (que enviou)
        await tx.wallet.update({
          where: { userId: originalTransaction.fromUserId },
          data: {
            balance: {
              increment: amount,
            },
          },
        });

        // marca a transação original como revertida
        const reversedAt = new Date();
        await tx.transaction.update({
          where: { id: originalTransaction.id },
          data: {
            reversed: true,
            reversedAt,
            status: 'REVERSED',
          },
        });

        // atualiza o status da transação de reversão para COMPLETED
        const completedReversal = await tx.transaction.update({
          where: { id: reversalTransaction.id },
          data: { status: 'COMPLETED' },
        });

        return this.mapToTransactionResponse(completedReversal);
      } catch (error) {
        // em caso de erro, marca a transação de reversão como FAILED
        await tx.transaction.update({
          where: { id: reversalTransaction.id },
          data: { status: 'FAILED' },
        });
        throw error;
      }
    });
  }

  private mapToTransactionResponse(transaction: {
    id: string;
    fromUserId: string;
    toUserId: string;
    amount: any;
    status: string;
    type: string;
    createdAt: Date;
  }): TransactionResponse {
    return {
      id: transaction.id,
      fromUserId: transaction.fromUserId,
      toUserId: transaction.toUserId,
      amount: Number(transaction.amount),
      status: transaction.status as any,
      type: transaction.type as any,
      createdAt: transaction.createdAt.toISOString(),
    };
  }
}
