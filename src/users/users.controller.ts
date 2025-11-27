import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserInput, CreateUserSchema } from './schemas/user.schema';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo usuário',
    description: 'Cria um novo usuário e sua carteira com saldo inicial zero',
  })
  @ApiBody({
    schema: {
      $ref: '#/components/schemas/CreateUser',
    } as any,
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      $ref: '#/components/schemas/UserResponse',
    } as any,
  })
  @ApiResponse({
    status: 409,
    description: 'Email já está em uso',
  })
  async create(@Body() createUserDto: CreateUserInput) {
    const validatedData = CreateUserSchema.parse(createUserDto);
    return this.usersService.create(validatedData);
  }
}
