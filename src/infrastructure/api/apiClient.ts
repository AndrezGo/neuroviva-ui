'use client';

import { env } from '@/core/config/env';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Maps API error statuses to Spanish user-facing messages.
 */
function mapApiError(status: number, raw: string): string {
  if (status === 401) return 'Tu sesión expiró. Inicia sesión de nuevo.';
  if (status === 403) return 'No tienes permisos para realizar esta acción.';
  if (status === 404) return 'El recurso solicitado no existe.';
  if (status === 409) return 'Ya existe un registro con estos datos.';
  if (status >= 500) return 'Error en el servidor. Por favor intenta más tarde.';
  return raw || 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
}

interface ApiRequestOptions extends Omit<RequestInit, 'headers'> {
  /** Supabase JWT — added as Authorization: Bearer <token> */
  token?: string;
  headers?: Record<string, string>;
}

/**
 * Core HTTP client for the NeuroViva .NET backend.
 * All requests are relative to NEXT_PUBLIC_API_BASE_URL.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { token, headers: extraHeaders, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Let the browser set its own Content-Type (with boundary) for FormData.
  // For all other body types keep the JSON header so existing callers are unaffected.
  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    const message = mapApiError(res.status, text);
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
