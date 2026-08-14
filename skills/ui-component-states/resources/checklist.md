# 4-State UI Review Checklist

Before approving any UI component PR or marking a frontend task done, verify every item:

### 1. Loading State
- [ ] Rendered during initial data fetch and active mutations/refetches.
- [ ] Uses animated skeleton placeholder or spinner matching the layout shape.
- [ ] No layout shift (CLS) when transitioning from loading to success.

### 2. Error State
- [ ] Displays human-friendly error messages (never raw HTTP stack traces).
- [ ] Maps contract error codes (e.g. `AUTH_INVALID_CREDENTIALS`, `NOT_FOUND`) to helpful text.
- [ ] Provides an actionable recovery step (e.g. "Try Again" / retry handler) where applicable.

### 3. Empty State
- [ ] Triggered when data is `null`, `undefined`, or an empty list `[]`.
- [ ] Renders an explicit empty message (never leaves a blank white page).
- [ ] Includes clear context or next steps (e.g. "No items found. Click + to create one.").

### 4. Success State
- [ ] Renders all required data fields accurately.
- [ ] Keyboard accessible and labeled.
- [ ] No `any` type casting in TypeScript props or models.

### 5. Automated Tests
- [ ] Component test covers all 4 states in `apps/ui/tests/components/<Feature>.test.tsx`.
- [ ] `pnpm -F ui test` passes cleanly.
