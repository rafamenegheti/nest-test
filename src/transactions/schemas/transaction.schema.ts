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
  reversed: z.boolean().describe('Indica se a transação foi revertida'),
  reversedAt: z
    .string()
    .datetime()
    .nullable()
    .describe('Data da reversão, se aplicável'),
  createdAt: z.string().datetime().describe('Data de criação'),
});

export const TransactionHistoryQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive().default(1))
    .describe('Número da página'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().positive().max(100).default(10))
    .describe('Itens por página (máximo 100)'),
  status: z
    .enum(['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'])
    .optional()
    .describe('Filtrar por status'),
  type: z
    .enum(['TRANSFER', 'REVERSAL'])
    .optional()
    .describe('Filtrar por tipo'),
});

export const TransactionHistoryResponseSchema = z.object({
  transactions: z
    .array(TransactionResponseSchema)
    .describe('Lista de transações'),
  pagination: z.object({
    page: z.number().int().positive().describe('Página atual'),
    limit: z.number().int().positive().describe('Itens por página'),
    total: z.number().int().nonnegative().describe('Total de transações'),
    totalPages: z.number().int().nonnegative().describe('Total de páginas'),
  }),
});

export type TransferInput = z.infer<typeof TransferInputSchema>;
export type TransactionResponse = z.infer<typeof TransactionResponseSchema>;
export type TransactionHistoryQuery = z.infer<
  typeof TransactionHistoryQuerySchema
>;
export type TransactionHistoryResponse = z.infer<
  typeof TransactionHistoryResponseSchema
>;

openApiRegistry.register('TransferInput', TransferInputSchema);
openApiRegistry.register('TransactionResponse', TransactionResponseSchema);
openApiRegistry.register(
  'TransactionHistoryResponse',
  TransactionHistoryResponseSchema,
);
