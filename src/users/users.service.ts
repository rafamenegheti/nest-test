import { Injectable, ConflictException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserInput, UserResponse } from './schemas/user.schema';
import { IUsersRepository } from './users.repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUsersRepository')
    private readonly usersRepository: IUsersRepository,
  ) {}

  async create(createUserDto: CreateUserInput): Promise<UserResponse> {
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.usersRepository.create({
      email: createUserDto.email,
      password: passwordHash,
      name: createUserDto.name,
    });

    return this.mapToUserResponse(user);
  }

  private mapToUserResponse(user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
