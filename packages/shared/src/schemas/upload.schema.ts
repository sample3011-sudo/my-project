import { z } from 'zod';

// ── Column Mapping ─────────────────────────────────────────────────

export const ColumnFieldEnum = z.enum([
  'date',
  'description',
  'debit',
  'credit',
  'balance',
  'ref',
]);

export type ColumnField = z.infer<typeof ColumnFieldEnum>;

/**
 * Maps a canonical field to the user's chosen source column header.
 * `date` and `description` are required; at least one of `debit`/`credit`
 * must be present; `balance` and `ref` are optional.
 */
export const ColumnMappingSchema = z.object({
  date: z.string(),
  description: z.string(),
  debit: z.string().nullable().optional(),
  credit: z.string().nullable().optional(),
  balance: z.string().nullable().optional(),
  ref: z.string().nullable().optional(),
});

export type ColumnMapping = z.infer<typeof ColumnMappingSchema>;

// ── Bank Preset ─────────────────────────────────────────────────

export const BankPresetSchema = z.object({
  id: z.string(),
  userId: z.string(),
  bankName: z.string(),
  mapping: ColumnMappingSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type BankPreset = z.infer<typeof BankPresetSchema>;

/** Bank preset for create/update */
export const BankPresetWriteSchema = z.object({
  bankName: z.string().min(1),
  mapping: ColumnMappingSchema,
});

export type BankPresetWrite = z.infer<typeof BankPresetWriteSchema>;

// ── Upload Session ───────────────────────────────────────────────

export const FileTypeSchema = z.enum(['CSV', 'XLSX', 'XLS']);
export type FileType = z.infer<typeof FileTypeSchema>;

export const UploadPreviewSchema = z.object({
  uploadId: z.string(),
  filename: z.string(),
  fileType: FileTypeSchema,
  bankName: z.string().optional(),
  headers: z.array(z.string()),
  sampleRows: z.array(z.record(z.string())),
  mapping: ColumnMappingSchema.optional(),
});

export type UploadPreview = z.infer<typeof UploadPreviewSchema>;

export const ParseSummarySchema = z.object({
  totalRows: z.number().int(),
  cleanRows: z.number().int(),
  malformedRows: z.number().int(),
});

export type ParseSummary = z.infer<typeof ParseSummarySchema>;

export const MalformedRowSchema = z.object({
  rowIndex: z.number().int().nonnegative(),
  rawData: z.record(z.string()),
  reasons: z.array(z.string()),
  excluded: z.boolean(),
});

export type MalformedRow = z.infer<typeof MalformedRowSchema>;

export const UploadMalformedDataSchema = z.object({
  uploadId: z.string(),
  summary: ParseSummarySchema,
  malformedRows: z.array(MalformedRowSchema),
});

export type UploadMalformedData = z.infer<typeof UploadMalformedDataSchema>;

// ── Malformed Row Patch (ST-005 include/exclude) ─────────────────────

/**
 * A single toggle from the malformed-row review table (ST-005).
 * `excluded: true`  → row is dropped from the import (default for every
 * flagged row).
 * `excluded: false` → row is imported with best-effort values and flagged
 * `isMalformed` on the resulting Transaction (ST-005 AC-3).
 */
export const MalformedRowUpdateSchema = z.object({
  rowIndex: z.number().int().nonnegative(),
  excluded: z.boolean(),
});

export type MalformedRowUpdate = z.infer<typeof MalformedRowUpdateSchema>;

/**
 * Body for `PATCH /uploads/:id/malformed` — a sparse list of row toggles.
 * Rows not present keep their current `excluded` flag.
 */
export const MalformedRowsPatchSchema = z.array(MalformedRowUpdateSchema);

export type MalformedRowsPatch = z.infer<typeof MalformedRowsPatchSchema>;
