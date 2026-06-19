'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/cn';

interface BackButtonProps {
  className?: string;
  label?: string;
}

export function BackButton({ className, label = 'Volver' }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label={label}
      className={cn(
        'flex items-center justify-center',
        'h-10 w-10 rounded-xl',
        'text-brand-dark bg-transparent',
        'hover:bg-gray-100 active:scale-95',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
        className,
      )}
    >
      <ArrowLeft className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
