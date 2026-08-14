# CLAUDE.md

## 0. Repo Shape

**pnpm workspace monorepo.** Three code workspaces plus a docs/pipeline control plane.

```
repo/
├── apps/
│   ├── api/                 Express 5 + Prisma backend
│   └── ui/                  Vite + React frontend
├── packages/
│   └── shared/              Types + Zod schemas shared by api & ui (Architect-owned)
├── docs/                    Pipeline artifacts (PRDs, stories, contracts, reviews…)
├── pipeline/
│   └── state.json           Canonical pipeline state — every agent reads it first
├── tsconfig.base.json       Shared strict compiler options
├── pnpm-workspace.yaml
├── package.json             Root, private, workspace scripts only
└── CLAUDE.md
```

`pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**pnpm only** — never `npm` or `yarn`. Migrating from npm: delete `package-lock.json` and every `node_modules`, run `pnpm import` (converts the lockfile) then `pnpm install`.

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Monorepo | pnpm workspaces |
| Runtime | Node.js 20.x |
| Language | TypeScript 5.x (strict mode) |
| API framework | Express 5.2.1 |
| UI framework | React + Vite |
| Database | MySQL via Prisma 6.19.2 |
| Testing | Jest 30.3.0 + Supertest 7.2.2 |
| Linting | ESLint 8.57.1 + Prettier 3.8.1 |
| Package manager | pnpm |

---

## 2. Commands

All commands run from the **repo root**. `-F` is `--filter`; `-r` is `--recursive`.

```bash
# Whole monorepo
pnpm install                      # install all workspaces
pnpm -r build                     # build every workspace
pnpm -r typecheck                 # tsc --noEmit everywhere (zero errors required)
pnpm -r lint:fix                  # ESLint + Prettier auto-fix
pnpm -r --parallel dev            # run api + ui together

# API (apps/api)
pnpm -F api dev                   # ts-node-dev with auto-reload
pnpm -F api build                 # compile TypeScript → dist/
pnpm -F api typecheck             # tsc --noEmit
pnpm -F api test                  # Jest, serial
pnpm -F api lint:fix

# Database (apps/api)
pnpm -F api prisma:generate       # regenerate client after schema changes
pnpm -F api prisma:migrate        # run dev migrations
pnpm -F api prisma:seed           # seed admin: admin@example.com / Admin@123

# UI (apps/ui)
pnpm -F ui dev                    # Vite dev server
pnpm -F ui build                  # tsc check + Vite production build
pnpm -F ui test
```

**Env — one file per app, never one at the root:**

- `apps/api/.env` (copy from `apps/api/.env.example`). Required: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`. Optional: `PORT` (default 5000).
- `apps/ui/.env` (copy from `apps/ui/.env.example`). **Only `VITE_`-prefixed vars** — anything here ships to the browser, so never put a backend secret in it.

---

## 3. Folder Structure

### apps/api  — owned by Backend Agent (see §7)

```
apps/api/
├── src/
│   ├── config/
│   │   ├── env.config.ts               ← zod env validation
│   │   └── prisma.config.ts            ← Prisma singleton (import ONLY from here)
│   ├── controllers/                    ← HTTP handlers, no business logic
│   ├── services/                       ← ALL business logic lives here
│   ├── routes/index.ts                 ← mounts all routers
│   ├── middleware/
│   │   ├── auth.middleware.ts          ← protect, authorize
│   │   ├── validate.middleware.ts
│   │   └── errorHandler.ts
│   ├── validations/                    ← API-only Zod schemas
│   ├── types/express.d.ts              ← req.user augmentation
│   └── errors/                         ← typed AppError subclasses
├── prisma/
│   ├── schema.prisma                   ← contract-governed; frozen at Gate 2 (§7)
│   └── migrations/
├── tests/
│   ├── unit/                           ← Backend Agent; mocked Prisma
│   └── integration/                    ← Validator Agent; real DB + Supertest
├── .env.example
├── tsconfig.json                       ← extends ../../tsconfig.base.json
└── package.json                        ← name: "api"
```

### apps/ui  — owned by Frontend Agent (see §7)

```
apps/ui/
├── src/
│   ├── components/                     ← <Feature>.tsx
│   ├── pages/
│   ├── hooks/                          ← use<Feature>.ts
│   └── services/                       ← API client functions
├── tests/
│   └── components/                     ← Frontend Agent; <Feature>.test.tsx
├── .env.example                        ← VITE_ prefixed only
├── vite.config.ts
├── tsconfig.json                       ← extends ../../tsconfig.base.json
└── package.json                        ← name: "ui"
```

### packages/shared  — owned by Architect Agent (see §7)

```
packages/shared/
├── src/
│   ├── schemas/                        ← Zod schemas shared api ↔ ui
│   └── types/                          ← shared TS types / DTOs (frozen at Gate 2)
├── tsconfig.json                       ← extends ../../tsconfig.base.json
└── package.json                        ← name: "@repo/shared"
```

Consume it from either app with `import { ... } from "@repo/shared"` after adding `"@repo/shared": "workspace:*"` to that app's `package.json`.

### docs/ + pipeline/  — pipeline control plane (see §7)

```
docs/
├── prd/                                ← PRDs (BA reads)
├── stories/<feature>/                  ← BA writes
├── ard/                                ← Architect writes (Architecture Requirement Docs)
├── contracts/                          ← Architect writes; IMMUTABLE after Gate 2
├── reviews/                            ← Validator writes
├── retro/                              ← Validator writes
└── feature_status/                     ← BA + Architect write; canonical story state
pipeline/
└── state.json                          ← every agent reads & respects it first
```

**New route checklist** (in order):

1. Schema — if shared with the UI: `packages/shared/src/schemas/<feature>.schema.ts` (Architect); if API-only: `apps/api/src/validations/<feature>.validation.ts`
2. `apps/api/src/services/<feature>.service.ts` — business logic
3. `apps/api/src/controllers/<feature>.controller.ts` — HTTP handler
4. `apps/api/src/routes/<feature>.routes.ts` — Express router
5. `apps/api/src/routes/index.ts` — mount it

---

## 4. TypeScript Config Strategy

One base config holds the strict flags; each workspace extends it and sets its own environment-specific options. **Do not** share a single full tsconfig across api and ui.

**`tsconfig.base.json`** (shared, no `lib`/`module`/`jsx`):

```jsonc

{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

**`apps/api/tsconfig.json`** — Node backend:

```jsonc
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2023"],
    "types": ["node", "jest"],
    "outDir": "dist"
  }
}
```

**`apps/ui/tsconfig.json`** — Vite + React frontend:

```jsonc
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "types": ["vite/client"],
    "noEmit": true
  }
}
```

---

## 5. Key Conventions

**TypeScript**
- No `any` — ever. Use `unknown` and narrow it.
- All async functions need explicit return types: `Promise<T>`.
- `interface` for object shapes; `type` for unions and aliases.
- Never use `@ts-ignore` without an inline comment explaining why.

**File naming**
- Backend: `<feature>.service.ts`, `<feature>.controller.ts`, `<feature>.routes.ts`, `<feature>.validation.ts`
- Frontend: `<Feature>.tsx` (components/pages), `use<Feature>.ts` (hooks)
- Tests: `<feature>.service.test.ts` (unit), `<feature>.test.ts` (integration), `<Feature>.test.tsx` (component)
- No `.js` files anywhere.

**State handling** (pipeline quality gate)
- UI components must explicitly render **loading, success, empty, and error** states.
- Service functions must explicitly handle **success, empty, and error** outcomes — no silent failures. (A service has no "loading" state; that is the caller's concern.)

**Cross-workspace**
- Shared types and Zod schemas live in `packages/shared` (`@repo/shared`), authored by the Architect Agent.
- `apps/api` and `apps/ui` never import from each other directly — go through `packages/shared`.

**Auth**
- `protect` — validates `Authorization: Bearer <token>`, attaches `req.user: AuthenticatedUser`
- `authorize('ADMIN')` — role check; always chains after `protect`

**Errors**
- Always throw a typed subclass of `AppError`. Never `throw new Error('plain string')`.
- No hardcoded user-facing strings in implementation code — externalize them.

**Database**
- Every schema change ships with a Prisma migration file.
- Use `$transaction` for any multi-step writes.
- Never store secrets, PII, or tokens in plaintext.
- After Gate 2, `schema.prisma` is contract-governed (§7) — changes require a new approved contract revision.

**Testing**
- Unit: mock Prisma — never hit a real DB. Lives in `apps/api/tests/unit/` (Backend Agent).
- Component: `apps/ui/tests/components/` (Frontend Agent).
- Integration: real test DB + Supertest, in `apps/api/tests/integration/` (Validator Agent).
- Coverage: 80% line minimum on all API service files.
- Naming: `describe('<unit>') > it('should <behaviour> given <condition>')`

---

## 6. What Not To Do

**Repo / stack**
- Use `npm` or `yarn` — **pnpm only**
- Put a backend secret in `apps/ui/.env` or any `VITE_` var — it ships to the browser
- Import across apps directly (`api` ↔ `ui`) — share via `packages/shared`
- Share one full tsconfig between api and ui — each extends `tsconfig.base.json`
- Use `any` in TypeScript
- Put business logic in controllers — it belongs in services
- Import Prisma client anywhere except `apps/api/src/config/prisma.config.ts`
- Write raw SQL unless Prisma cannot express it (document the reason in an **ARD** under `docs/ard/`)
- Throw plain `new Error('string')` — use typed `AppError` subclasses
- Create `.js` files — TypeScript only across the entire repo
- Commit `.env`, secrets, or API keys
- Hardcode secrets, API tokens, or user-facing strings in implementation code

**Pipeline (§7)**
- Proceed past a human review gate without explicit user approval
- Write outside your agent's file boundary (§7.2)
- Alter a Gate-2-approved contract — endpoints, request/response shapes, shared TypeScript types, or DB schema — without a new human-approved contract revision
- Edit another agent's files to make your stage pass — fix your own implementation instead. In particular, Backend/Frontend must not touch `apps/api/tests/integration/` or `docs/reviews/` (Validator-owned)
- Invent API behaviour not specified in `docs/contracts/`
- Merge a branch with failing tests

---

## 7. Agentic Pipeline

### 7.1 State & source of truth
- **`pipeline/state.json`** — every agent reads and respects it **before acting**.
- **`docs/feature_status/`** — canonical state of each story across stages:
  `backlog → architecture → in-dev → in-review → completed`.
- No agent may proceed past a human review gate without **explicit user approval**.

### 7.2 Agents & file boundaries

Flow: **BA → Architect → (Backend ∥ Frontend) → Validator**, with human gates between stages.

| Agent | Reads | Writes ONLY to |
|---|---|---|
| **BA** | `docs/prd/` | `docs/stories/<feature>/`, `docs/feature_status/` |
| **Architect** | approved stories (`docs/stories/`) | `docs/ard/`, `docs/contracts/`, `packages/shared/`, `docs/feature_status/` |
| **Backend** | approved contracts (`docs/contracts/`) | `apps/api/src/`, `apps/api/prisma/`, `apps/api/tests/unit/` |
| **Frontend** | approved contracts (`docs/contracts/`) | `apps/ui/src/`, `apps/ui/tests/components/` |
| **Validator** | all code diffs | `docs/reviews/`, `apps/api/tests/integration/`, `docs/retro/` |

> Path mapping note: the original pipeline spec targeted a single-package layout
> (`src/api`, `src/ui`, `tests/unit`, `tests/components`, `tests/integration`,
> `prisma/`). Those have been remapped onto this monorepo. `packages/shared` is a
> monorepo addition and is assigned to the Architect, since it holds the
> contract-derived types frozen at Gate 2.

### 7.3 Human review gates
Each forward transition in §7.1 requires explicit user approval before the next agent runs:
- **backlog → architecture** — BA's stories approved.
- **architecture → in-dev — Gate 2 (Contract approval).** On approval, `docs/contracts/` becomes **immutable**.
- **in-review → completed** — Validator's review approved.

> Only **Gate 2** is named and given hard semantics in the source spec; the other two
> gates follow the general "no forward step without approval" rule and are left

> unnumbered rather than invented.

### 7.4 Contract immutability
Once human-approved at **Gate 2**, API contracts in `docs/contracts/` are **immutable**. Neither Backend nor Frontend may alter endpoints, request/response shapes, TypeScript types, or database schemas without a **new contract revision** that itself passes human review. In this repo that freeze governs:
- `apps/api/prisma/schema.prisma` (database schema)
- `packages/shared/src/` (shared TypeScript types & Zod schemas)
- every endpoint and DTO derived from the contract

### 7.5 Code & quality standards
- All code must pass linting and type checks (`strict: true`).
- Every UI component must handle loading, success, empty, and error states; every service function must handle success, empty, and error outcomes (§5).
- No hardcoded secrets, API tokens, or user-facing strings in implementation code.