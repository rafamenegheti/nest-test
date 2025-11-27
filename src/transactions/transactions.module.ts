import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionsRepository } from './transactions.repository';
import { WalletsRepository } from '../wallets/wallets.repository';
import { UsersRepository } from '../users/users.repository';

@Module({
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    {
      provide: 'ITransactionsRepository',
      useClass: TransactionsRepository,
    },
    {
      provide: 'IWalletsRepository',
      useClass: WalletsRepository,
    },
    {
      provide: 'IUsersRepository',
      useClass: UsersRepository,
    },
  ],
  exports: [TransactionsService],
})
export class TransactionsModule {}
