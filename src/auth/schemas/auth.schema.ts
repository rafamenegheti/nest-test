import { z } from 'zod';
import { openApiRegistry } from '../../common/openapi.helper';

// schema para login
export const LoginSchema = z.object({
  email: z.string().email('Email inválido').describe('Email do usuário'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .describe('Senha do usuário'),
});

// schema para resposta de login (com token)
export const LoginResponseSchema = z.object({
  access_token: z.string().describe('Token JWT de acesso'),
  user: z.object({
    id: z.string().uuid().describe('ID do usuário'),
    email: z.string().email().describe('Email do usuário'),
    name: z.string().nullable().describe('Nome do usuário'),
  }),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

openApiRegistry.register('Login', LoginSchema);
openApiRegistry.register('LoginResponse', LoginResponseSchema);
