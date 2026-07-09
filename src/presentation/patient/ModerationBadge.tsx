'use client';

interface ModerationBadgeProps {
  removedReason?: string | null;
}

/**
 * Displayed in place of post content when the post has been moderated (removed === true).
 * The backend already replaces the content string with a placeholder; this badge
 * makes the moderation status visually explicit with a warning style.
 */
export function ModerationBadge({ removedReason }: ModerationBadgeProps) {
  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5"
      role="status"
      aria-label="Contenido moderado"
    >
      <p className="text-xs font-semibold text-amber-700">Este contenido fue moderado</p>
      {removedReason && (
        <p className="mt-0.5 text-xs text-amber-600">{removedReason}</p>
      )}
    </div>
  );
}
