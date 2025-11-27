import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckResponseSchema,
  type HealthCheckResponse,
} from './schemas/health.schema';
import { openApiRegistry } from '../common/openapi.helper';

// registra o schema no OpenAPI Registry
openApiRegistry.register('HealthCheckResponse', HealthCheckResponseSchema);

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Verifica o status e saúde da aplicação',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      $ref: '#/components/schemas/HealthCheckResponse',
    } as any,
  })
  check(): HealthCheckResponse {
    // validação usando o Zod
    return HealthCheckResponseSchema.parse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  }
}
