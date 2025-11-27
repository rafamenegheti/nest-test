import { z } from 'zod';
import { openApiRegistry } from '../../common/openapi.helper';

export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido').describe('Email do usuário'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .describe('Senha do usuário'),
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional()
    .describe('Nome do usuário'),
});

export const UserResponseSchema = z.object({
  id: z.string().uuid().describe('ID único do usuário'),
  email: z.string().email().describe('Email do usuário'),
  name: z.string().nullable().describe('Nome do usuário'),
  createdAt: z.string().datetime().describe('Data de criação'),
  updatedAt: z.string().datetime().describe('Data de atualização'),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;

openApiRegistry.register('CreateUser', CreateUserSchema);
openApiRegistry.register('UserResponse', UserResponseSchema);
