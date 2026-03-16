# Sabilouna - Best Practices

> For developers and interns — follow these practices in all code.

## Clean Architecture

### Backend (NestJS)
- `domain/` → `application/` → `infrastructure/` → `presentation/` (controllers + **resolvers**, **graphql/** types)
- **API:** REST + GraphQL (Apollo, code-first). Playground: `http://localhost:3001/graphql`

### Frontend (Next.js)
- `domain/` → `application/` → `infrastructure/` → `components/` → `app/` (routes only)
- **Components:** Use `src/components/`, not `app/components/`. Keep `app/` for routes. Import: `import { X } from '@/components/...'`

## Coding Standards
- TypeScript strict — no `any`
- camelCase (variables), PascalCase (classes/types)

## Security
- Never commit `.env` — use `.env.example`
- Validate all inputs (DTOs + validation pipes)

## Git
- Commits: `feat:`, `fix:`, `refactor:`, `docs:`
- Branches: `feature/`, `fix/`, `hotfix/`
