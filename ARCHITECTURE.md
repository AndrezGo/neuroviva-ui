# NeuroViva UI — Architecture Reference

## Overview

NeuroViva UI is a mobile-first PWA-style Next.js 16 (App Router) application for a Colombian digital-health platform serving patients with neurodegenerative diseases, caregivers, and healthcare professionals. The frontend connects to a .NET 10 + Supabase backend.

This document describes the layered Clean Architecture applied to the frontend.

---

## Layered Clean Architecture

```
presentation/   ← Pure UI components and page shells
application/    ← Orchestration: hooks, use-cases, form schemas
domain/         ← Pure TypeScript types and repository contracts
infrastructure/ ← Supabase SDK integration (the only layer touching external SDKs)
core/           ← App-wide primitives: env config, typed routes
shared/         ← Reusable utilities: Zustand stores, cn helper
app/            ← Next.js App Router: pages and route groups
```

### Layer Rules

| Layer | Can import from | Cannot import from |
|-------|----------------|--------------------|
| `domain/` | Nothing (pure TS) | All others |
| `infrastructure/` | `domain/`, `core/` | `presentation/`, `application/`, `app/` |
| `application/` | `domain/`, `infrastructure/`, `shared/`, `core/` | `presentation/`, `app/` |
| `presentation/` | `shared/lib/`, `domain/` (types only) | `infrastructure/`, `application/` |
| `app/` (pages) | All layers | — |

---

## Folder Tree

```
src/
  app/
    (auth)/                    # Route group — auth screens, no URL segment
      layout.tsx               # Thin layout applying MobileShell
      login/page.tsx           # Screen 2
      register/page.tsx        # Screen 3
      forgot-password/page.tsx # Screen 4
      role-selection/page.tsx  # Screen 5
    layout.tsx                 # Root layout: html[lang="es"], fonts, metadata
    page.tsx                   # Splash screen (Screen 1) — server component
    SplashCTA.tsx              # Client island: navigation button for splash
    error.tsx                  # Route error boundary (must be 'use client')
    not-found.tsx              # 404 page
    globals.css                # Tailwind v4 @theme tokens + keyframes + base

  core/
    config/env.ts              # Reads + validates NEXT_PUBLIC_ env vars
    routing/routes.ts          # Typed route helpers (no raw strings in pages)

  domain/
    auth/
      auth.types.ts            # AuthUser, AuthSession, SignIn/SignUp/ResetPasswordInput,
                               #   UserRole, AuthResult<T> discriminated union
      auth.repository.ts       # AuthRepository interface (framework-agnostic contract)

  infrastructure/
    supabase/
      client.browser.ts        # createBrowserClient(@supabase/ssr) — client components
      client.server.ts         # createServerClient(@supabase/ssr) — server components
                               #   uses async cookies() (Next.js 15+ API)
    auth/
      supabaseAuth.repository.ts  # Implements AuthRepository; maps SDK errors to
                                  #   Spanish user-facing messages via AuthResult

  application/
    auth/
      authSchemas.ts           # Zod schemas: signInSchema, signUpSchema, resetPasswordSchema
      useSignIn.ts             # Hook: RHF submit → repository.signIn → store + navigate
      useSignUp.ts             # Hook: RHF submit → repository.signUp → store + navigate
      useResetPassword.ts      # Hook: repository.resetPassword, exposes success state
      useGoogleAuth.ts         # Hook: repository.signInWithGoogle (OAuth redirect)
    role/
      useRoleSelection.ts      # Selects role → Zustand store → navigates

  presentation/
    ui/                        # Pure, reusable, zero business logic
      Button.tsx               # variants: primary/secondary/ghost; loading; forwardRef
      TextField.tsx            # label + input + error + icons; aria-invalid + describedby
      PasswordField.tsx        # TextField + eye/eye-off toggle; aria-pressed on toggle
      Checkbox.tsx             # Custom teal checkbox; rich label; forwardRef
      Divider.tsx              # "o continúa con" labeled separator
      BackButton.tsx           # Arrow left, aria-label, router.back()
      InfoBox.tsx              # Info panel with icon; role="note"
      RoleCard.tsx             # Selectable card; role="radio"; aria-checked
      BrandMark.tsx            # Teal rounded square + Brain icon; role="img"
    layout/
      MobileShell.tsx          # max-w-md centered column wrapper

  shared/
    store/
      useAuthStore.ts          # Zustand + persist: user, session, selectedRole
    lib/
      cn.ts                    # clsx + tailwind-merge helper
```

---

## Supabase SSR Auth Strategy

### Browser Client (`client.browser.ts`)
- Uses `createBrowserClient` from `@supabase/ssr`
- Called from Client Components and application hooks
- Validates env vars at call time (throws if placeholder key is used)
- Session is managed via cookies automatically by the SSR package

### Server Client (`client.server.ts`)
- Uses `createServerClient` from `@supabase/ssr`
- Marked `server-only` — cannot be imported in Client Components
- Uses `await cookies()` (Next.js 15+ async cookies API)
- Implements `getAll`/`setAll` cookie handlers
- `setAll` errors are swallowed inside Server Components (read-only context); middleware handles refresh

### AuthRepository
- `SupabaseAuthRepository` (infrastructure) is the only place `@supabase/*` is imported for auth
- Returns `AuthResult<T>` discriminated union — never throws raw SDK errors to the UI
- All Supabase error messages are mapped to Spanish user-facing strings

---

## Zustand Store Strategy

`useAuthStore` (`shared/store/useAuthStore.ts`):
- Persisted to `localStorage` under key `neuroviva-auth`
- `partialize` only persists `selectedRole` and minimal user info — never full session tokens
- Actions: `setSession`, `setRole`, `clear`
- Used by application hooks for post-auth state; never used directly in UI primitives

---

## Component Patterns

### UI Primitives (`presentation/ui/`)
- Props in → JSX out
- No Supabase, no fetch, no Zustand with side effects, no Zod
- Always `forwardRef` on form-connectable components
- All interactive elements have proper ARIA attributes
- `useId()` called unconditionally (hooks rules compliance)

### Feature Pages (`app/(auth)/*/page.tsx`)
- Thin: compose UI primitives + call application hooks
- No business logic in JSX handlers beyond calling a hook
- All auth pages are `'use client'` because they use react-hook-form hooks
- Animation: staggered `animate-fade-up` with inline `animationDelay` (respects `prefers-reduced-motion` via CSS `@media` in globals.css)

### Server/Client Boundary
- `app/page.tsx` (Splash) is a Server Component
- Navigation button is extracted to `SplashCTA.tsx` client island
- Auth layout (`(auth)/layout.tsx`) is a Server Component wrapping MobileShell

---

## Tailwind v4 @theme Token System

Defined in `globals.css` using CSS-first `@theme` (Tailwind v4 pattern — no `tailwind.config.js` JS theme object):

```css
@theme {
  --color-brand-dark: #0D2137;
  --color-brand-primary: #0BBFAD;
  --color-brand-primary-dark: #09a596;
  --color-brand-primary-light: #E6FAF8;
  --color-splash-bg: #0D2137;
  --color-gray-text: #64748B;

  /* Role accent colors */
  --color-role-caregiver: #16A34A;
  --color-role-caregiver-light: #DCFCE7;
  --color-role-professional: #2563EB;
  --color-role-professional-light: #DBEAFE;
  --color-role-patient: #7C3AED;
  --color-role-patient-light: #EDE9FE;
}
```

Tokens are consumed as Tailwind utilities: `bg-brand-primary`, `text-brand-dark`, `text-role-caregiver`, etc. No raw hex values in components.

---

## Typography

- **Display font**: [Syne](https://fonts.google.com/specimen/Syne) — geometric, high-contrast, strong character for headings. Conveys the precision and trustworthiness appropriate for a medical platform while feeling modern and tech-forward.
- **Body font**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) — humanist sans-serif, warm and approachable, excellent readability on small screens. Right for the caregiver/patient audience.
- Both loaded via `next/font/google` as CSS variable fonts (zero layout shift).
- Variables: `--font-syne` (display), `--font-plus-jakarta` (body).

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Component files | PascalCase | `Button.tsx`, `TextField.tsx` |
| Hook files | camelCase `use` prefix | `useSignIn.ts` |
| Type modules | `*.types.ts` | `auth.types.ts` |
| Repository contracts | `*.repository.ts` | `auth.repository.ts` |
| Repository impls | `supabase*.repository.ts` | `supabaseAuth.repository.ts` |
| Schema modules | `*Schemas.ts` | `authSchemas.ts` |
| Store hooks | `use*Store.ts` | `useAuthStore.ts` |

Default exports: only Next.js `page.tsx` and `layout.tsx` files. All other modules use named exports.

---

## TODOs

1. **Supabase anon key**: Replace `REPLACE_WITH_ANON_KEY` in `.env.local` with the real key from the Supabase dashboard (project `rlbjepbolloktpbbfngs`).
2. **Dashboard routes**: `useRoleSelection.confirm()` currently navigates to `/` (splash) as a safe placeholder. When role-specific dashboard pages exist, update `routes.ts` and the hook's `router.push` target.
3. **Email confirmation flow**: `signUp` returns an empty session when Supabase requires email confirmation. A confirmation-pending screen should be added.
4. **Auth callback route**: Add `app/auth/callback/route.ts` to handle Supabase OAuth and magic-link redirects (exchange code for session).
5. **Middleware**: Add Next.js middleware (`proxy.ts` / `middleware.ts`) to protect authenticated routes and refresh sessions server-side.
