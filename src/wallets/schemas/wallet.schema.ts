import { z } from 'zod';
import { openApiRegistry } from '../../common/openapi.helper';

export const WalletBalanceResponseSchema = z.object({
  balance: z.number().nonnegative().describe('Saldo atual da carteira'),
  userId: z.string().uuid().describe('ID do usuário'),
  updatedAt: z.string().datetime().describe('Data da última atualização'),
});

export type WalletBalanceResponse = z.infer<typeof WalletBalanceResponseSchema>;

openApiRegistry.register('WalletBalanceResponse', WalletBalanceResponseSchema);
