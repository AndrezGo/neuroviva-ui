import { Brain } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { outer: 'h-14 w-14 rounded-2xl', icon: 'h-7 w-7' },
  md: { outer: 'h-20 w-20 rounded-3xl', icon: 'h-10 w-10' },
  lg: { outer: 'h-24 w-24 rounded-3xl', icon: 'h-12 w-12' },
};

export function BrandMark({ size = 'md', className }: BrandMarkProps) {
  const { outer, icon } = sizeMap[size];

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-brand-primary shadow-lg',
        outer,
        className,
      )}
      role="img"
      aria-label="NeuroViva — plataforma de salud digital"
    >
      <Brain className={cn('text-white', icon)} aria-hidden="true" />
    </div>
  );
}
