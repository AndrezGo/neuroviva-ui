import { cn } from '@/shared/lib/cn';

interface MobileShellProps {
  children: React.ReactNode;
  className?: string;
  bg?: string;
}

/**
 * Centered max-w-md column wrapper for mobile-first layouts.
 * On desktop, content is centered in a phone-sized column.
 */
export function MobileShell({ children, className, bg = 'bg-white' }: MobileShellProps) {
  return (
    <div className="min-h-dvh w-full bg-slate-100 overflow-x-hidden">
      <div
        className={cn(
          'mx-auto flex min-h-dvh w-full max-w-md flex-col',
          'md:shadow-[0_0_48px_0_rgb(0_0_0_/_0.12)]',
          bg,
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
