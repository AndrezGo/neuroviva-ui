'use client';

import type { AuthRepository } from '@/domain/auth/auth.repository';
import type {
  AuthResult,
  AuthSession,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
} from '@/domain/auth/auth.types';
import { env } from '@/core/config/env';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase/client.browser';

/**
 * Maps Supabase error messages to Spanish user-facing messages.
 */
function mapSupabaseError(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.';
  }
  if (msg.includes('user already registered') || msg.includes('email_exists')) {
    return 'Ya existe una cuenta con este correo electrónico. Intenta iniciar sesión.';
  }
  if (msg.includes('rate limit') || msg.includes('too_many_requests')) {
    return 'Demasiados intentos. Espera unos minutos antes de intentarlo de nuevo.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Error de conexión. Verifica tu internet e intenta de nuevo.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Debes confirmar tu correo electrónico antes de iniciar sesión.';
  }
  if (msg.includes('password') && msg.includes('weak')) {
    return 'La contraseña es demasiado débil. Usa al menos 8 caracteres.';
  }
  if (msg.includes('signup_disabled')) {
    return 'El registro está deshabilitado temporalmente. Intenta más tarde.';
  }

  return 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
}

/**
 * Supabase implementation of AuthRepository.
 * This is the ONLY file in the codebase that imports from @supabase/* (aside from client files).
 */
export class SupabaseAuthRepository implements AuthRepository {
  private get client() {
    return createSupabaseBrowserClient();
  }

  async signIn(input: SignInInput): Promise<AuthResult<AuthSession>> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error || !data.session) {
      return {
        ok: false,
        message: mapSupabaseError(error?.message ?? 'Unknown error'),
      };
    }

    return {
      ok: true,
      data: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at ?? 0,
        user: {
          id: data.session.user.id,
          email: data.session.user.email ?? '',
          fullName: data.session.user.user_metadata?.full_name as string | undefined,
          phone: data.session.user.user_metadata?.phone as string | undefined,
        },
      },
    };
  }

  async signUp(input: SignUpInput): Promise<AuthResult<AuthSession>> {
    const { data, error } = await this.client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          phone: input.phone,
        },
      },
    });

    if (error) {
      return {
        ok: false,
        message: mapSupabaseError(error.message),
      };
    }

    if (!data.session) {
      // Email confirmation required
      return {
        ok: true,
        data: {
          accessToken: '',
          refreshToken: '',
          expiresAt: 0,
          user: {
            id: data.user?.id ?? '',
            email: data.user?.email ?? input.email,
            fullName: input.fullName,
            phone: input.phone,
          },
        },
      };
    }

    return {
      ok: true,
      data: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at ?? 0,
        user: {
          id: data.session.user.id,
          email: data.session.user.email ?? input.email,
          fullName: input.fullName,
          phone: input.phone,
        },
      },
    };
  }

  async signInWithGoogle(): Promise<AuthResult<void>> {
    const { error } = await this.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${env.siteUrl}/auth/callback`,
      },
    });

    if (error) {
      return {
        ok: false,
        message: mapSupabaseError(error.message),
      };
    }

    return { ok: true, data: undefined };
  }

  async resetPassword(input: ResetPasswordInput): Promise<AuthResult<void>> {
    const { error } = await this.client.auth.resetPasswordForEmail(input.email, {
      redirectTo: `${env.siteUrl}/auth/callback`,
    });

    if (error) {
      return {
        ok: false,
        message: mapSupabaseError(error.message),
      };
    }

    return { ok: true, data: undefined };
  }

  async signOut(): Promise<AuthResult<void>> {
    const { error } = await this.client.auth.signOut();

    if (error) {
      return { ok: false, message: mapSupabaseError(error.message) };
    }

    return { ok: true, data: undefined };
  }

  async getAccessToken(): Promise<string | null> {
    const {
      data: { session },
    } = await this.client.auth.getSession();

    return session?.access_token ?? null;
  }
}

/** Singleton instance for use in application hooks */
export const supabaseAuthRepository: AuthRepository = new SupabaseAuthRepository();
