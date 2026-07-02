/**
 * Environment configuration.
 * Validates required NEXT_PUBLIC_ variables at runtime.
 * Build-time: placeholder values are accepted so `npm run build` passes.
 * Runtime: throws if placeholder or empty string is used when the client is instantiated.
 */

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5073';

function assertRuntimeValue(value: string, name: string): string {
  if (!value || value === 'REPLACE_WITH_ANON_KEY') {
    throw new Error(
      `[NeuroViva] Missing required environment variable: ${name}. ` +
        'Set it in .env.local before running the app.',
    );
  }
  return value;
}

/**
 * Returns the validated Supabase URL. Throws at runtime if missing.
 */
export function getSupabaseUrl(): string {
  return assertRuntimeValue(rawUrl, 'NEXT_PUBLIC_SUPABASE_URL');
}

/**
 * Returns the validated Supabase anon key. Throws at runtime if missing/placeholder.
 */
export function getSupabaseAnonKey(): string {
  return assertRuntimeValue(rawKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const env = {
  supabaseUrl: rawUrl,
  supabaseAnonKey: rawKey,
  siteUrl: rawSiteUrl,
  apiBaseUrl: rawApiBaseUrl,
  /** Safe accessor — use in production code that must validate at use time */
  get validatedSupabaseUrl(): string {
    return getSupabaseUrl();
  },
  get validatedSupabaseAnonKey(): string {
    return getSupabaseAnonKey();
  },
} as const;
