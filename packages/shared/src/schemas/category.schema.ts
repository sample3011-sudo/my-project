import { z } from 'zod';

export const CategoryEnum = z.enum([
  'Food',
  'Rent',
  'Groceries',
  'Transport',
  'Shopping',
  'Subscriptions',
  'Utilities',
  'Health',
  'Entertainment',
  'Income',
  'Transfer',
  'Other',
]);

export type Category = z.infer<typeof CategoryEnum>;

export const CategoryRuleSourceEnum = z.enum(['ai', 'user']);

export type CategoryRuleSource = z.infer<typeof CategoryRuleSourceEnum>;

/**
 * Human-readable labels for each category — used by the UI dropdown
 * (ST-013) and the dashboard chart legend (ST-010).
 */
export const CATEGORY_LABELS: Record<Category, string> = {
  Food: 'Food',
  Rent: 'Rent',
  Groceries: 'Groceries',
  Transport: 'Transport',
  Shopping: 'Shopping',
  Subscriptions: 'Subscriptions',
  Utilities: 'Utilities',
  Health: 'Health',
  Entertainment: 'Entertainment',
  Income: 'Income',
  Transfer: 'Transfer',
  Other: 'Other',
};

/**
 * Stable color tokens for chart segments and ledger tags.
 * Colors are chosen for accessibility (WCAG AA on white) and
 * distinctiveness across the 12 categories.
 */
export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#FF6B6B',
  Rent: '#4ECDC4',
  Groceries: '#45B7D1',
  Transport: '#FDCB6E',
  Shopping: '#6C5CE7',
  Subscriptions: '#A29BFE',
  Utilities: '#FD79A3',
  Health: '#E17090',
  Entertainment: '#00B894',
  Income: '#00C094',
  Transfer: '#636E72',
  Other: '#B2BEC3',
};

export const CategoryRuleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  merchantPattern: z.string(),
  category: CategoryEnum,
  source: CategoryRuleSourceEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CategoryRule = z.infer<typeof CategoryRuleSchema>;
