import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginInput, LoginSchema } from './schemas/auth.schema';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autenticar usuário',
    description: 'Autentica um usuário e retorna um token JWT',
  })
  @ApiBody({
    schema: {
      $ref: '#/components/schemas/Login',
    } as any,
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      $ref: '#/components/schemas/LoginResponse',
    } as any,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
  })
  async login(@Body() loginDto: LoginInput) {
    const validatedData = LoginSchema.parse(loginDto);
    return this.authService.login(validatedData);
  }
}
