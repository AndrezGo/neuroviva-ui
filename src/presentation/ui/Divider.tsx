interface DividerProps {
  label?: string;
}

export function Divider({ label = 'o continúa con' }: DividerProps) {
  return (
    <div className="flex items-center gap-3" role="separator" aria-label={label}>
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs font-medium text-gray-text uppercase tracking-wider whitespace-nowrap">
        {label}
      </span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}
