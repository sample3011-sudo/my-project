---
name: ui-component-states
description: >-
  Builds resilient React UI components, custom hooks, and component tests that strictly implement and test all 4 required lifecycle states: Loading, Success, Empty, and Error.
  Use when creating React components, building data-fetching hooks, implementing UI views, or testing client-side component state transitions.
---

# UI Component 4-State Implementation Skill

## Purpose

This skill guides the agent through building reliable client-side components and custom hooks in `apps/ui/` that handle asynchronous operations without blank screens, unhandled loading flickers, or unhandled errors.

Every component that fetches data or executes asynchronous tasks **must** explicitly implement and test 4 states:
1. **Loading** (Skeletons / spinners)
2. **Error** (Human-readable error message + retry action)
3. **Empty** (Clear empty state view, not a blank render)
4. **Success** (Main data presentation)

---

## Bundled References & Examples

- **Reference Component**: [FourStateComponent.tsx](./examples/FourStateComponent.tsx)
- **Async Data Hook**: [useAsyncData.ts](./examples/useAsyncData.ts)
- **Component Test Suite**: [FourStateComponent.test.tsx](./examples/FourStateComponent.test.tsx)
- **Review Checklist**: [checklist.md](./resources/checklist.md)

---

## Workflow Steps

### Step 1: Typed API Service Function
In `apps/ui/src/services/<feature>.service.ts`:
- Import request and response DTOs from `@repo/shared`.
- Resolve backend URLs using `import.meta.env.VITE_API_URL`.
- Catch network and HTTP errors, translating backend error codes to user-friendly messages.

### Step 2: Custom State-Managing Hook
In `apps/ui/src/hooks/use<Feature>.ts` (see [useAsyncData.ts](./examples/useAsyncData.ts) for pattern):
- Maintain `{ data, isLoading, error, isEmpty, refetch }`.
- Transition states deterministically:
  - Starting: `isLoading = true, error = null`
  - Failure: `isLoading = false, error = errorMessage, data = null`
  - Success (with data): `isLoading = false, error = null, data = payload`
  - Success (zero records): `isLoading = false, error = null, data = [], isEmpty = true`

### Step 3: Implement 4-State UI View
In `apps/ui/src/components/<Feature>.tsx` (see [FourStateComponent.tsx](./examples/FourStateComponent.tsx)):
1. **Loading**: Show skeleton loader with matching dimensions.
2. **Error**: Display error banner with an optional "Try Again" retry button.
3. **Empty**: If `data` is empty/null, render an explicit message (e.g. *"No items found. Click Create to get started."*).
4. **Success**: Render data layout cleanly. Externalize all user-facing strings to `apps/ui/src/constants/`.

### Step 4: Author Component Unit Tests
In `apps/ui/tests/components/<Feature>.test.tsx` (see [FourStateComponent.test.tsx](./examples/FourStateComponent.test.tsx)):
Write React Testing Library test cases asserting:
1. `it('should render loading skeleton when isLoading is true')`
2. `it('should render error banner and retry button on failure')`
3. `it('should render empty message when data is empty')`
4. `it('should render success view with data')`

### Step 5: Verification & Self-Check
Review against the [4-State Checklist](./resources/checklist.md) and run:
```bash
pnpm -F ui typecheck
pnpm -F ui test
pnpm -F ui lint:fix
```

---

## Strict Rules & Constraints
- **Zero Blank Screens**: An empty array or `null` data must never render as a blank container.
- **Frontend Security**: Access tokens remain in memory; refresh tokens are stored in httpOnly cookies. Never use `localStorage` or `sessionStorage` for tokens.
- **Environment Boundaries**: Only `VITE_`-prefixed variables are accessible in `apps/ui`. Never store backend secrets in client configs.
