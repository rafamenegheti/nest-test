import { z } from 'zod';
import {
  OpenAPIRegistry,
  extendZodWithOpenApi,
  OpenApiGeneratorV31,
} from '@asteasolutions/zod-to-openapi';

// estende o Zod com métodos OpenAPI
extendZodWithOpenApi(z);

// registry global para os schemas
export const openApiRegistry = new OpenAPIRegistry();

// obter as definições do registry no formato OpenAPI
export function getOpenApiDefinitions() {
  if (
    !openApiRegistry.definitions ||
    openApiRegistry.definitions.length === 0
  ) {
    return {};
  }

  // converte as definições do registry para o formato OpenAPI
  const generator = new OpenApiGeneratorV31(openApiRegistry.definitions);
  const openApiDocument = generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'API',
      version: '1.0.0',
    },
  });

  return openApiDocument.components?.schemas || {};
}
