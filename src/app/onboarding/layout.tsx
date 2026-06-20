import { MobileShell } from '@/presentation/layout/MobileShell';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileShell bg="bg-brand-surface">
      {/* Subtle gradient overlay darkening toward the bottom */}
      <div className="relative flex min-h-dvh flex-col">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/20"
          aria-hidden="true"
        />
        <div className="relative flex flex-1 flex-col">{children}</div>
      </div>
    </MobileShell>
  );
}
