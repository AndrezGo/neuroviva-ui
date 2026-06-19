/**
 * Framework-agnostic contract for authentication operations.
 * No Supabase or any framework-specific import belongs here.
 */

import type {
  AuthResult,
  AuthSession,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
} from './auth.types';

export interface AuthRepository {
  signIn(input: SignInInput): Promise<AuthResult<AuthSession>>;
  signUp(input: SignUpInput): Promise<AuthResult<AuthSession>>;
  signInWithGoogle(): Promise<AuthResult<void>>;
  resetPassword(input: ResetPasswordInput): Promise<AuthResult<void>>;
}
