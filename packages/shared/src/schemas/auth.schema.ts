import { z } from 'zod';

// ── Request / Response ───────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

export type User = z.infer<typeof UserSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// The refresh token is NOT returned in the body; it is set exclusively via an
// `httpOnly`, `sameSite=Lax` Set-Cookie header on the login response (D-1).
// The frontend therefore only receives the access token here; the browser
// auto-sends the refresh cookie on POST /auth/refresh.
export const LoginResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const LogoutResponseSchema = z.object({
  success: z.literal(true),
});

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

/**
 * Returned by the refresh endpoint (POST /auth/refresh).
 * The access token is rotated; the new refresh token lives only in the
 * httpOnly cookie — the response body never carries a refresh token.
 * Satisfies ST-001 AC-4 (session preserved on reload).
 */
export const RefreshResponseSchema = z.object({
  accessToken: z.string(),
  user: UserSchema,
});

export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;
