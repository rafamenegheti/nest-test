import { User } from '@prisma/client';

export interface CreateUserData {
  email: string;
  password: string;
  name?: string | null;
}

export interface IUsersRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
}
