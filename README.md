# NestJS API com Zod e OpenAPI

API construída com NestJS utilizando Zod para validação e geração automática de documentação OpenAPI através do `@asteasolutions/zod-to-openapi`.

## Características

- ✅ NestJS como framework
- ✅ Zod para validação e schemas
- ✅ Integração automática com Swagger/OpenAPI
- ✅ Type-safety completo
- ✅ Documentação automática gerada a partir dos schemas Zod

## Instalação

```bash
cd api
npm install
```

## Executar

### Modo desenvolvimento
```bash
npm run start:dev
```

O servidor estará disponível em `http://localhost:3000`

### Modo produção
```bash
npm run build
npm run start:prod
```

## Documentação Swagger

A documentação Swagger está disponível em: `http://localhost:3000/docs`

A documentação é gerada automaticamente a partir dos schemas Zod definidos nos controllers.

## Endpoints

### Health Check
- `GET /health` - Verifica o status da aplicação

  **Resposta:**
  ```json
  {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 12345,
    "environment": "development"
  }
  ```

## Estrutura do Projeto

```
api/
├── src/
│   ├── main.ts                 # Bootstrap da aplicação e configuração do Swagger
│   ├── app.module.ts           # Módulo raiz da aplicação
│   └── health/
│       ├── health.module.ts    # Módulo de health check
│       ├── health.controller.ts # Controller com rota /health
│       └── schemas/
│           └── health.schema.ts # Schema Zod para resposta
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Como Funciona

1. **Schemas Zod** são definidos em `schemas/health.schema.ts`
2. O schema é convertido para OpenAPI usando `zodToOpenAPI` do `@asteasolutions/zod-to-openapi`
3. O schema OpenAPI é aplicado no decorator `@ApiResponse` do NestJS Swagger
4. A documentação é gerada automaticamente e disponibilizada em `/docs`

## Exemplo de Uso

```typescript
// Definir schema Zod
const HealthCheckResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string().datetime(),
  uptime: z.number(),
  environment: z.string(),
});

// Converter para OpenAPI
const healthCheckOpenApiSchema = zodToOpenAPI(HealthCheckResponseSchema);

// Usar no controller
@ApiResponse({
  status: 200,
  description: 'Service is healthy',
  schema: healthCheckOpenApiSchema as any,
})
```

