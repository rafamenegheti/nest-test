import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Wallets')
@Controller('wallets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('balance')
  @ApiOperation({
    summary: 'Consultar saldo da carteira',
    description: 'Retorna o saldo atual da carteira do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Saldo consultado com sucesso',
    schema: {
      $ref: '#/components/schemas/WalletBalanceResponse',
    } as any,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  @ApiResponse({
    status: 404,
    description: 'Carteira não encontrada',
  })
  async getBalance(@CurrentUser() user: any) {
    return this.walletsService.getBalance(user.id);
  }
}
