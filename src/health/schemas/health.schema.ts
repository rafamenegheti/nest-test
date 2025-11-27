import { z } from 'zod';

export const HealthCheckResponseSchema = z.object({
  status: z.string().describe('Status do serviço'),
  timestamp: z
    .string()
    .datetime()
    .describe('Timestamp da requisição em ISO 8601'),
  uptime: z.number().describe('Tempo de execução do serviço em segundos'),
  environment: z
    .string()
    .describe('Ambiente de execução (development, production, etc)'),
});

export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;
