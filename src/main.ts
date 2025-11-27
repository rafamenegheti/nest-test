import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { getOpenApiDefinitions } from './common/openapi.helper';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // configuração do Swagger com OpenAPI
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('API construída com NestJS, Zod e OpenAPI')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // integra os schemas do registry com o documento Swagger
  if (!document.components) {
    document.components = {};
  }
  if (!document.components.schemas) {
    document.components.schemas = {};
  }

  // adiciona os schemas registrados ao documento Swagger
  const registryDefinitions = getOpenApiDefinitions();
  if (registryDefinitions && Object.keys(registryDefinitions).length > 0) {
    Object.assign(document.components.schemas, registryDefinitions);
  }

  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/docs`);
}
bootstrap();
