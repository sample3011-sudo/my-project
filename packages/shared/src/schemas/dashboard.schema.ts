import { z } from 'zod';
import { CategoryEnum } from './category.schema';

// ── Month Summary (ST-009) ─────────────────────────────────────────

export const MonthSummarySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  totalIn: z.number(),
  totalOut: z.number(),
  netSavings: z.number(),
  transactionCount: z.number().int(),
});

export type MonthSummary = z.infer<typeof MonthSummarySchema>;

// ── Spend by Category (ST-010) ─────────────────────────────────────

export const CategoryBreakdownItemSchema = z.object({
  category: CategoryEnum,
  totalAmount: z.number(),
  percentage: z.number().min(0).max(100),
  transactionCount: z.number().int(),
});

export type CategoryBreakdownItem = z.infer<typeof CategoryBreakdownItemSchema>;

export const CategoryBreakdownResponseSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  items: z.array(CategoryBreakdownItemSchema),
});

export type CategoryBreakdownResponse = z.infer<
  typeof CategoryBreakdownResponseSchema
>;

// ── Top Merchants (ST-011) ────────────────────────────────────────

export const TopMerchantSchema = z.object({
  merchant: z.string(),
  totalAmount: z.number(),
  transactionCount: z.number().int(),
});

export type TopMerchant = z.infer<typeof TopMerchantSchema>;

export const TopMerchantsResponseSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  items: z.array(TopMerchantSchema),
});

export type TopMerchantsResponse = z.infer<typeof TopMerchantsResponseSchema>;

// ── Month Selector Options (ST-009 AC-1) ─────────────────────────────

/**
 * One available month for the dashboard month selector.
 * The dropdown shows only months that actually contain transactions,
 * defaulting to the current month when at least one exists.
 */
export const MonthOptionSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  transactionCount: z.number().int().nonnegative(),
});

export type MonthOption = z.infer<typeof MonthOptionSchema>;
