import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'IUsersRepository',
      useClass: UsersRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
