// Central barrel for @repo/shared.
// Frozen at Gate 2 — no additions without a new contract revision.

export * from './schemas/index';
export * from './types/index';

// Runtime constants (also available to the UI)
export {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from './schemas/category.schema';
