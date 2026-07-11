'use client';

import { cn } from '@/shared/lib/cn';
import type { Channel } from '@/domain/content/content.types';

interface ChannelSelectProps {
  id: string;
  label: string;
  channels: Channel[];
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Presentational channel selector.
 * No hooks, no API calls — receives all data via props.
 * Mirrors the styled select markup used in DiseaseSelect.
 */
export function ChannelSelect({
  id,
  label,
  channels,
  value,
  onChange,
  isLoading = false,
  disabled = false,
}: ChannelSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-semibold tracking-tight text-brand-dark"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        className={cn(
          'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5',
          'text-base text-brand-dark',
          'transition-all duration-200',
          'hover:border-brand-primary/50',
          'focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60',
        )}
      >
        <option value="">
          {isLoading ? 'Cargando canales…' : 'Sin canal (video independiente)'}
        </option>
        {channels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            {channel.name}
          </option>
        ))}
      </select>
    </div>
  );
}
