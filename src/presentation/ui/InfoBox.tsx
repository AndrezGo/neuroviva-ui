import { Info } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface InfoBoxProps {
  children: React.ReactNode;
  className?: string;
}

export function InfoBox({ children, className }: InfoBoxProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl bg-gray-50 border border-gray-200 p-4',
        className,
      )}
      role="note"
    >
      <Info
        className="h-4 w-4 text-gray-text mt-0.5 flex-shrink-0"
        aria-hidden="true"
      />
      <p className="text-sm text-gray-text leading-relaxed">{children}</p>
    </div>
  );
}
