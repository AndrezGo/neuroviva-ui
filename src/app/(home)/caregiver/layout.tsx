import { ToastViewport } from '@/presentation/ui/ToastViewport';

/**
 * Caregiver section nested layout — Server Component.
 *
 * Intentionally thin: it just passes children through without additional
 * wrapping. The CaregiverShell (a Client Component that reads from Zustand)
 * is mounted at the page level to avoid hydration issues that would arise
 * from mixing server layout + client-only hooks in the same boundary.
 *
 * ToastViewport is a Client Component that renders toasts via a portal —
 * safe to import here because Next.js creates a client boundary at that file.
 */
export default function CaregiverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ToastViewport />
    </>
  );
}
