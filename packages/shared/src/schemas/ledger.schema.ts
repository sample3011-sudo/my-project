import { z } from 'zod';
import { CategoryEnum } from './category.schema';
import { TransactionSchema, ImportRecordSchema } from './expense.schema';
import { PaginationMetaSchema } from './common.schema';

// ── Ledger Filters (ST-012) ────────────────────────────────────────

export const LedgerFiltersSchema = z.object({
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  categories: z.array(CategoryEnum).optional(),
  merchants: z.array(z.string()).optional(),
  amountMin: z.number().optional(),
  amountMax: z.number().optional(),
  txnType: z.enum(['expense', 'income', 'both']).default('both'),
  importId: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
});

export type LedgerFilters = z.infer<typeof LedgerFiltersSchema>;

/** Active-filter chip for the UI (ST-012 AC-5) */
export const FilterChipSchema = z.object({
  field: z.string(),
  label: z.string(),
  value: z.string(),
});

export type FilterChip = z.infer<typeof FilterChipSchema>;

/** Summary totals shown above the ledger table */
export const LedgerSummarySchema = z.object({
  count: z.number().int(),
  totalAmount: z.number(),
});

export type LedgerSummary = z.infer<typeof LedgerSummarySchema>;

// ── Transaction Detail (expanded) ──────────────────────────────────

export const TransactionDetailSchema = TransactionSchema.extend({
  import: ImportRecordSchema.optional(),
});

export type TransactionDetail = z.infer<typeof TransactionDetailSchema>;

// ── Ledger List Response (ST-012) ────────────────────────────────────
//
// Paginated transaction detail + the filtered totals shown above the table
// (ST-012 AC-5). `meta` follows the shared PaginationMeta convention.

export const LedgerResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(TransactionDetailSchema),
    meta: PaginationMetaSchema,
    summary: LedgerSummarySchema,
  }),
});

export type LedgerResponse = z.infer<typeof LedgerResponseSchema>;
