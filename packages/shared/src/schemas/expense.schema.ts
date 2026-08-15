import { z } from 'zod';
import { CategoryEnum } from './category.schema';

// ── Transaction ──────────────────────────────────────────────────

export const TransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  importId: z.string(),
  txnDate: z.string().datetime(),
  description: z.string(),
  merchant: z.string().nullable(),
  amount: z.number(),
  balance: z.number().nullable(),
  category: CategoryEnum,
  isRecurring: z.boolean(),
  isMalformed: z.boolean(),
  dedupHash: z.string(),
  note: z.string().max(500).nullable(),
  createdAt: z.string().datetime(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

/** Partial update for inline edit (ST-013). Both fields optional. */
export const TransactionUpdateSchema = z.object({
  category: CategoryEnum.optional(),
  note: z.string().max(500).nullable().optional(),
});

export type TransactionUpdate = z.infer<typeof TransactionUpdateSchema>;

// ── Import Record ────────────────────────────────────────────────

export const ImportRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  filename: z.string(),
  bankName: z.string().nullable(),
  periodStart: z.string().datetime().nullable(),
  periodEnd: z.string().datetime().nullable(),
  rowsTotal: z.number().int().nonnegative(),
  rowsImported: z.number().int().nonnegative(),
  rowsDuplicate: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});

export type ImportRecord = z.infer<typeof ImportRecordSchema>;

/** Result returned by the commit endpoint (ST-006 + ST-007 + ST-008). */
export const CommitResultSchema = z.object({
  importId: z.string(),
  rowsTotal: z.number().int(),
  rowsImported: z.number().int(),
  rowsDuplicate: z.number().int(),
  rowsMalformed: z.number().int(),
  aiCategorized: z.number().int(),
  cacheHits: z.number().int(),
  llmCalls: z.number().int(),
});

export type CommitResult = z.infer<typeof CommitResultSchema>;
