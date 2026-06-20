/**
 * OAuth callback Route Handler.
 *
 * Why @supabase/ssr is imported here (outside infrastructure/):
 * Route Handlers run exclusively on the server and need to exchange the OAuth
 * `code` for a session by writing cookies. `createSupabaseServerClient()` from
 * infrastructure/ already wraps this correctly, so we delegate to it instead of
 * importing @supabase/ssr directly. This file is therefore the only non-infrastructure
 * file that touches Supabase indirectly via the server client factory — which is
 * intentional and documented here so future contributors understand the exception.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/infrastructure/supabase/client.server';
import { routes } from '@/core/routing/routes';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(
      new URL(`${routes.login()}?error=oauth`, origin),
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL(`${routes.login()}?error=oauth`, origin),
      );
    }

    return NextResponse.redirect(new URL(routes.authComplete(), origin));
  } catch {
    return NextResponse.redirect(
      new URL(`${routes.login()}?error=oauth`, origin),
    );
  }
}
