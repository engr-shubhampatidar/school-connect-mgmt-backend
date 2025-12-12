<!-- Copilot instructions for `schoolconnect-mgmt` -->

# Quick Context

This repository is a small NestJS monolith (TypeScript) implementing public/onboarding APIs for SchoolConnect.

- Entry: `src/main.ts` (global ValidationPipe, Swagger at `/api/docs`, reads `.env` via `dotenv.config()`)
- Root module: `src/app.module.ts` (imports `ConfigModule.forRoot()` and TypeORM via `src/config/typeorm.config`)
- Domain modules live under `src/modules/*` (each module often has `controller.ts`, `service.ts`, `dto/`, and `entities/`)

# Architecture & Dataflow (what matters for code changes)

- HTTP controllers live in `src/modules/*/*controller.ts` and call corresponding `*service.ts` methods.
- Services use TypeORM repositories injected with `@InjectRepository(...)` and operate on entities in `src/modules/*/entities/`.
- DTOs (validation + transformation) are in module `dto/` folders; global validation is enabled in `main.ts` (`ValidationPipe({ whitelist: true, transform: true })`).
- Config is environment-driven (`ConfigModule.forRoot()` + `dotenv`), and database uses `pg` + `typeorm` (see `src/config/typeorm.config`).

# Developer workflows (commands you should use)

- Install dependencies: `npm install`
- Run in dev (watch): `npm run start:dev` — uses Nest CLI to reload on changes.
- Run prod: `npm run start:prod` (runs built `dist/main.js`).
- Build: `npm run build` (runs `nest build`).
- Unit tests: `npm run test` (Jest, tests look for `*.spec.ts` under `src/`).
- E2E tests: `npm run test:e2e` (uses `test/jest-e2e.json`).
- Lint and format: `npm run lint`, `npm run format`.

# Project-specific conventions & patterns

- Module layout: keep `controller`, `service`, `dto/`, and `entities/` co-located in `src/modules/<feature>/`.
- Register TypeORM entities in a module using `TypeOrmModule.forFeature([EntityA, EntityB])` (see `src/modules/public/public.module.ts`).
- Repositories are used directly in services (no custom repository layer yet). Example pattern in `PublicService`:
  - `constructor(@InjectRepository(School) private schoolRepo: Repository<School>) {}`
- Password handling: use `bcrypt` within services (e.g., `public.service.ts` uses `bcrypt.hash` with saltRounds = 10).
- Swagger: use `@ApiTags()` and `@ApiOperation()` on controllers to generate docs via `main.ts`'s Swagger setup.
- Errors: controllers/services throw Nest exceptions (e.g., `BadRequestException`) — let Nest handle HTTP mapping.

# Integration points & external dependencies

- Database: Postgres via `pg` + TypeORM. The TypeORM config is the single place to adjust DB connection params (`src/config/typeorm.config`).
- Env vars: `.env` at project root (loaded by `dotenv.config()` in `main.ts` and by `ConfigModule`). Expect `PORT` and DB-related envs.
- Authentication: project includes `@nestjs/jwt`, `passport` dependencies but public module uses unauthenticated endpoints; authenticated modules will use `@nestjs/passport` patterns.

# How to add a new API (exact steps)

1. Create `src/modules/<feature>/` with `feature.controller.ts`, `feature.service.ts`, `dto/`, and `entities/`.
2. Add entity class under `entities/` and register it in the module via `TypeOrmModule.forFeature([MyEntity])`.
3. Use `@Body()` DTOs in controller; ensure DTO uses `class-validator` decorators so global `ValidationPipe` applies.
4. Wire service methods to perform repository calls and throw Nest exceptions for HTTP errors.
5. Add Swagger decorators (`@ApiTags`, `@ApiOperation`) on controllers.
6. Add unit tests as `feature.service.spec.ts` or `feature.controller.spec.ts` under same folder; run `npm run test`.

# Files to consult/examples

- Swagger & app init: `src/main.ts`
- Global wiring: `src/app.module.ts` and `src/config/typeorm.config` (DB)
- Public onboarding flow: `src/modules/public/public.controller.ts` and `src/modules/public/public.service.ts`
- Entities and DTOs: `src/modules/*/entities/*.entity.ts` and `src/modules/*/dto/*`
- E2E example: `test/app.e2e-spec.ts` and `test/jest-e2e.json`

# What NOT to change without CI runs

- Do not change TypeORM connection options or entity names without verifying the database state/migrations.
- Avoid removing global `ValidationPipe` or altering `transform`/`whitelist` settings without updating DTOs.

If anything here is unclear or you want more detail (example DTOs, TypeORM config content, or test examples), tell me which area to expand and I will iterate.
