// Re-export all inferred types from their schema files.
// Import path: @repo/shared/types
//
// These types are derived via `z.infer<...>` in the schemas/ directory.
// They are frozen at Gate 2 alongside the schemas.

export type {
  Category,
  CategoryRuleSource,
  CategoryRule,
} from '../schemas/category.schema';

export type {
  User,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RefreshResponse,
} from '../schemas/auth.schema';

export type {
  Transaction,
  TransactionUpdate,
  ImportRecord,
  CommitResult,
} from '../schemas/expense.schema';

export type {
  ColumnField,
  ColumnMapping,
  BankPreset,
  BankPresetWrite,
  FileType,
  UploadPreview,
  ParseSummary,
  MalformedRow,
  MalformedRowUpdate,
  MalformedRowsPatch,
  UploadMalformedData,
} from '../schemas/upload.schema';

export type {
  MonthSummary,
  CategoryBreakdownItem,
  CategoryBreakdownResponse,
  TopMerchant,
  TopMerchantsResponse,
  MonthOption,
} from '../schemas/dashboard.schema';

export type {
  LedgerFilters,
  FilterChip,
  LedgerSummary,
  TransactionDetail,
  LedgerResponse,
} from '../schemas/ledger.schema';

export type {
  ApiError,
  PaginationMeta,
  SuccessResponse,
} from '../schemas/common.schema';

export type {
  PaymentStatus,
  PlanId,
  CreateOrderRequest,
  CreateOrderResponse,
  PaymentRecord,
  VerifyPaymentQuery,
  PaymentStatusResponse,
} from '../schemas/payment.schema';

export { PLANS } from '../schemas/payment.schema';

