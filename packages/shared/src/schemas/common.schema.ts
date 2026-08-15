import { z } from 'zod';

// ── Error response ───────────────────────────────────────────────

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

/**
 * Generic success envelope for destructive / no-content operations
 * (e.g. DELETE /imports/:id rollback — ST-007 AC-3).
 * Specific endpoints may return the affected resource directly via its
 * own schema (e.g. PATCH /transactions/:id returns TransactionSchema).
 */
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
});

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

// ── Pagination ───────────────────────────────────────────────────

export const PaginationMetaSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/**
 * Factory: builds a paginated response schema for any item schema.
 * Usage: createPaginatedResponseSchema(TransactionSchema)
 */
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) =>
  z.object({
    success: z.literal(true),
    data: z.object({
      items: z.array(itemSchema),
      meta: PaginationMetaSchema,
    }),
  });
