# Sabilouna — Best Practices for Interns

## Branching Strategy

### Branch Naming
- `main` — production-ready code
- `develop` — integration branch for features
- `feature/<ticket-id>-<short-description>` — new features (e.g. `feature/SAB-42-project-export`)
- `fix/<ticket-id>-<short-description>` — bug fixes
- `hotfix/<description>` — urgent production fixes
- `refactor/<description>` — code improvements

### Workflow
1. Create a branch from `develop` for your task
2. Work on your branch, commit often
3. Open a Pull Request (PR) to `develop`
4. Wait for review before merging
5. Never push directly to `main` or `develop` without PR

### Git Commands (Quick Reference)
```bash
git checkout develop && git pull origin develop
git checkout -b feature/SAB-XX-my-feature
# ... work ...
git add . && git commit -m "feat: add project export"
git push -u origin feature/SAB-XX-my-feature
```

---

## Commit Messages (Conventional Commits)

Format: `type(scope): description`

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change |
| `docs` | Documentation |
| `test` | Tests |

---

## Coding Standards

1. **TypeScript** — no `any`
2. **Clean Architecture** — domain → application → infrastructure → presentation
3. **Naming** — camelCase (variables), PascalCase (classes, types)

---

## Git Hooks

Hooks install automatically on `npm install`. Or disable in Cursor: **Settings > Agent > Attribution**.

## Before Submitting a PR

- [ ] Code builds (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] No secrets in code
- [ ] Meaningful commit messages
