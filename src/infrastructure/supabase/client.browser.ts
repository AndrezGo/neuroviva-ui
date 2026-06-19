'use client';

import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/core/config/env';

/**
 * Creates a Supabase browser client for use in Client Components.
 * Validates env vars at call time — will throw if placeholder key is used.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
