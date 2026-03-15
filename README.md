# Sabilouna

Project & Journey Tracking SaaS — Clean Architecture

## Stack
- **Frontend**: Next.js 15+
- **Backend**: NestJS 11 — **REST + GraphQL** (Apollo, code-first)

## Quick Start
```bash
npm install
npm run dev:frontend   # port 3000
npm run dev:backend    # port 3001
```

**GraphQL:** `http://localhost:3001/graphql`

## Project Structure

```
sabilouna/
├── apps/
│   ├── frontend/                 # Next.js (App Router)
│   │   └── src/
│   │       ├── domain/models/
│   │       ├── application/
│   │       ├── infrastructure/
│   │       ├── components/       # Reusable UI
│   │       └── app/              # Routes only
│   └── backend/                  # NestJS API
│       └── src/
│           ├── domain/
│           ├── application/
│           ├── infrastructure/
│           └── presentation/
├── PRACTICES.md
└── BRANCHING_AND_CODING_PRACTICES.md
```
