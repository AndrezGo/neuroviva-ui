/**
 * Domain auth types — no framework imports allowed here.
 */

export type UserRole = 'caregiver' | 'professional' | 'patient';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  role?: UserRole;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  habeasData: boolean;
}

export interface ResetPasswordInput {
  email: string;
}

/** Discriminated union result — never throw raw errors to UI */
export type AuthResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };
