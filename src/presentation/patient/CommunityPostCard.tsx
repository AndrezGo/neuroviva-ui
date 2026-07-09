'use client';

import * as React from 'react';
import { ModerationBadge } from './ModerationBadge';
import { ReactionPicker } from './ReactionPicker';
import { Button } from '@/presentation/ui/Button';
import { Textarea } from '@/presentation/ui/Textarea';
import { useComments } from '@/application/patient/useComments';
import type { CommunityPost, ReactionType } from '@/domain/community/community.types';

interface CommunityPostCardProps {
  post: CommunityPost;
  /** Reaction types this user has selected for this post (server-seeded + optimistic). */
  selectedReactions: ReactionType[];
  onToggleReaction: (postId: string, type: ReactionType) => void;
  /**
   * Sends a comment for the given post. Returns { commentId } on success.
   * The card handles the inline error state on failure; the screen shows a success
   * toast on success. Throws ApiError on failure so this card can set local error state.
   */
  onComment: (postId: string, content: string) => Promise<void>;
}

const MONTHS_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}

function formatCommentCount(count: number): string {
  if (count === 0) return 'Sin comentarios aún';
  if (count === 1) return '1 comentario';
  return `${count} comentarios`;
}

/**
 * Pure presentational card for a single community post.
 * Renders moderation badge when the post is removed instead of original content.
 * Owns its own lazy comment thread via useComments — thread is not fetched until
 * the user expands it. Contains an expandable inline comment composer.
 * Memoized to prevent re-renders when unrelated posts update their reaction counts.
 */
export const CommunityPostCard = React.memo(function CommunityPostCard({
  post,
  selectedReactions,
  onToggleReaction,
  onComment,
}: CommunityPostCardProps) {
  // ── Comment composer state ────────────────────────────────────────────────────
  const [commentOpen, setCommentOpen] = React.useState(false);
  const [commentText, setCommentText] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [commentError, setCommentError] = React.useState<string | null>(null);

  // ── Thread expand/collapse state ──────────────────────────────────────────────
  const [threadOpen, setThreadOpen] = React.useState(false);

  // ── Comment thread (lazy: load() is a no-op until first expand) ───────────────
  const {
    comments,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    error: commentsError,
    hasMore: commentsHasMore,
    isLoadingMore: isCommentsLoadingMore,
    load: loadComments,
    loadMore: loadMoreComments,
    reload: reloadComments,
  } = useComments(post.id);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleToggleReaction = React.useCallback(
    (type: ReactionType) => {
      onToggleReaction(post.id, type);
    },
    [post.id, onToggleReaction],
  );

  const handleToggleThread = React.useCallback(() => {
    if (!threadOpen) {
      setThreadOpen(true);
      void loadComments(); // idempotent — fetches only on first expand
    } else {
      setThreadOpen(false);
    }
  }, [threadOpen, loadComments]);

  const handleOpenComment = () => {
    setCommentOpen(true);
    setCommentError(null);
  };

  const handleCancelComment = () => {
    setCommentOpen(false);
    setCommentText('');
    setCommentError(null);
  };

  const handleSendComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    if (trimmed.length > 2000) {
      setCommentError('El comentario no puede superar 2000 caracteres.');
      return;
    }

    setIsSending(true);
    setCommentError(null);

    try {
      await onComment(post.id, trimmed);
      // Success: close composer — the screen layer shows the success toast.
      setCommentText('');
      setCommentOpen(false);
      // Reload the thread so the new comment appears immediately if expanded.
      if (threadOpen) {
        void reloadComments();
      }
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : 'No se pudo enviar el comentario. Intenta de nuevo.',
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <article
      className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm flex flex-col gap-3"
      aria-label="Publicación de la comunidad"
    >
      {/* Timestamp */}
      <time
        dateTime={post.createdAt}
        className="text-xs text-gray-text"
      >
        {formatDate(post.createdAt)}
      </time>

      {/* Content or moderation notice */}
      {post.removed ? (
        <ModerationBadge removedReason={post.removedReason} />
      ) : (
        <p className="text-sm text-brand-dark whitespace-pre-wrap break-words">{post.content}</p>
      )}

      {/* Qualitative reactions — not likes */}
      <ReactionPicker
        reactions={post.reactions}
        selectedReactions={selectedReactions}
        onToggle={handleToggleReaction}
      />

      {/* Comments toggle — shows count and expands/collapses the thread */}
      <button
        type="button"
        onClick={handleToggleThread}
        aria-expanded={threadOpen}
        aria-controls={`comments-${post.id}`}
        className="self-start text-xs text-gray-text hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-md px-1"
      >
        {formatCommentCount(post.commentCount)}
      </button>

      {/* Comment thread (lazy-loaded on first expand) */}
      {threadOpen && (
        <div id={`comments-${post.id}`} className="flex flex-col gap-2">
          {/* Loading state */}
          {isCommentsLoading && (
            <p className="text-xs text-gray-text animate-pulse py-1">
              Cargando comentarios...
            </p>
          )}

          {/* Error state — only reached when initial load fails (comments is empty) */}
          {isCommentsError && !isCommentsLoading && (
            <div className="flex items-center gap-2 py-1">
              <p className="text-xs text-red-600">
                {commentsError ?? 'Error al cargar los comentarios.'}
              </p>
              <button
                type="button"
                onClick={() => void reloadComments()}
                className="text-xs font-semibold text-brand-primary hover:text-brand-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-md"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isCommentsLoading && !isCommentsError && comments.length === 0 && (
            <p className="text-xs text-gray-text py-1">Aún no hay comentarios.</p>
          )}

          {/* Comment list */}
          {!isCommentsLoading && comments.length > 0 && (
            <ul
              className="flex flex-col gap-3 pl-3 border-l-2 border-gray-100 mt-1"
              aria-label="Comentarios de la publicación"
            >
              {comments.map((comment) => (
                <li key={comment.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-600">
                      Miembro de la comunidad
                    </span>
                    <time dateTime={comment.createdAt} className="text-xs text-gray-text">
                      {formatDate(comment.createdAt)}
                    </time>
                  </div>
                  {comment.removed ? (
                    <ModerationBadge removedReason={comment.removedReason} />
                  ) : (
                    <p className="text-sm text-brand-dark whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Load more comments */}
          {!isCommentsLoading && !isCommentsError && commentsHasMore && (
            <button
              type="button"
              onClick={() => void loadMoreComments()}
              disabled={isCommentsLoadingMore}
              className="self-start text-xs font-semibold text-brand-primary hover:text-brand-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-md px-1 disabled:opacity-50"
            >
              {isCommentsLoadingMore ? 'Cargando...' : 'Cargar más comentarios'}
            </button>
          )}
        </div>
      )}

      {/* Comment composer (expandable) */}
      {!commentOpen ? (
        <button
          type="button"
          onClick={handleOpenComment}
          className="self-start text-xs font-semibold text-brand-primary hover:text-brand-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-md px-1"
        >
          Comentar
        </button>
      ) : (
        <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
          <Textarea
            label="Tu comentario"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Escribe un comentario..."
            error={commentError ?? undefined}
            disabled={isSending}
            aria-label="Escribe tu comentario"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-text">
              {commentText.length}/2000
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelComment}
                disabled={isSending}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSendComment}
                isLoading={isSending}
                disabled={!commentText.trim() || isSending}
              >
                Enviar
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
});
