import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  TransferInput,
  TransferInputSchema,
  TransactionHistoryQuerySchema,
} from './schemas/transaction.schema';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transfer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Realizar transferência',
    description:
      'Transfere saldo entre usuários. A operação é atômica e pode ser revertida.',
  })
  @ApiBody({
    schema: {
      $ref: '#/components/schemas/TransferInput',
    } as any,
  })
  @ApiResponse({
    status: 201,
    description: 'Transferência realizada com sucesso',
    schema: {
      $ref: '#/components/schemas/TransactionResponse',
    } as any,
  })
  @ApiResponse({
    status: 400,
    description: 'Saldo insuficiente ou dados inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário ou carteira não encontrada',
  })
  async transfer(@CurrentUser() user: any, @Body() transferDto: TransferInput) {
    const validatedData = TransferInputSchema.parse(transferDto);
    return this.transactionsService.transfer(user.id, validatedData);
  }

  @Post(':id/reverse')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reverter transação',
    description:
      'Reverte uma transferência realizada. Apenas quem enviou pode reverter. A operação é atômica.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transação revertida com sucesso',
    schema: {
      $ref: '#/components/schemas/TransactionResponse',
    } as any,
  })
  @ApiResponse({
    status: 400,
    description:
      'Transação já revertida, não pode ser revertida, ou saldo insuficiente',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Apenas quem enviou pode reverter a transação',
  })
  @ApiResponse({
    status: 404,
    description: 'Transação não encontrada',
  })
  async reverse(@CurrentUser() user: any, @Param('id') transactionId: string) {
    return this.transactionsService.reverse(transactionId, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar histórico de transações',
    description:
      'Retorna o histórico de transações do usuário autenticado (enviadas e recebidas) com paginação e filtros opcionais',
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de transações retornado com sucesso',
    schema: {
      $ref: '#/components/schemas/TransactionHistoryResponse',
    } as any,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  async getHistory(@CurrentUser() user: any, @Query() query: any) {
    const validatedQuery = TransactionHistoryQuerySchema.parse(query);
    return this.transactionsService.getHistory(user.id, validatedQuery);
  }
}
