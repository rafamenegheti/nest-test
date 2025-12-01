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
npm install
```

## Configuração do Banco de Dados

### Usando Docker Compose

O projeto inclui um `docker-compose.yml` para facilitar a configuração do banco de dados PostgreSQL.

1. **Subir o banco de dados:**

```bash
docker-compose up -d
```

Isso irá iniciar um container PostgreSQL na porta `5432`

2. **Configurar variáveis de ambiente:**

Eu subi o .env já que não tem nenhum dado crítico para facilitar a configuração

3. **Executar migrações:**

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. **Popular o banco (opcional):**

```bash
npm run prisma:seed
```

## Executar

### Modo desenvolvimento

```bash
npm run start:dev
```

O servidor estará disponível em `http://localhost:3000`

## Documentação Swagger

A documentação Swagger está disponível em: `http://localhost:3000/docs`

## Como Funciona

1. **Schemas Zod** são definidos
2. O schema é convertido para OpenAPI usando `zodToOpenAPI` do `@asteasolutions/zod-to-openapi`
3. O schema OpenAPI é aplicado no decorator `@ApiResponse` do NestJS Swagger
4. A documentação é gerada automaticamente e disponibilizada em `/docs`

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
