# NestJS API com Zod e OpenAPI

API construída com NestJS utilizando Zod para validação e geração automática de documentação OpenAPI através do `@asteasolutions/zod-to-openapi`.

## Características

- ✅ NestJS como framework
- ✅ Zod para validação e schemas
- ✅ Integração automática com Swagger/OpenAPI
- ✅ Type-safety completo
- ✅ Documentação automática gerada a partir dos schemas Zod

## Instalação

Clone o repositório

```bash
cd nest-test
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

### Prisma Studio

O Prisma Studio é uma interface visual para visualizar e editar dados no banco de dados.

Para abrir o Prisma Studio:

```bash
npx prisma studio
```

O Prisma Studio estará disponível em `http://localhost:51212`

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
