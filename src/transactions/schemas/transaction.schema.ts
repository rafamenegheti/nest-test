import { z } from 'zod';
import { openApiRegistry } from '../../common/openapi.helper';

export const TransferInputSchema = z.object({
  toUserId: z
    .string()
    .uuid('ID do destinatário inválido')
    .describe('ID do usuário destinatário'),
  amount: z
    .number()
    .positive('Valor deve ser maior que zero')
    .describe('Valor da transferência'),
});

export const TransactionResponseSchema = z.object({
  id: z.string().uuid().describe('ID da transação'),
  fromUserId: z.string().uuid().describe('ID do usuário remetente'),
  toUserId: z.string().uuid().describe('ID do usuário destinatário'),
  amount: z.number().positive().describe('Valor da transferência'),
  status: z
    .enum(['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'])
    .describe('Status da transação'),
  type: z.enum(['TRANSFER', 'REVERSAL']).describe('Tipo da transação'),
  createdAt: z.string().datetime().describe('Data de criação'),
});

export type TransferInput = z.infer<typeof TransferInputSchema>;
export type TransactionResponse = z.infer<typeof TransactionResponseSchema>;

openApiRegistry.register('TransferInput', TransferInputSchema);
openApiRegistry.register('TransactionResponse', TransactionResponseSchema);
