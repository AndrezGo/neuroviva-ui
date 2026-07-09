'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CommunityPostCard } from './CommunityPostCard';
import { Button } from '@/presentation/ui/Button';
import { Textarea } from '@/presentation/ui/Textarea';
import { useToastStore } from '@/shared/store/useToastStore';
import type { UseGroupFeedReturn } from '@/application/patient/useGroupFeed';
import type { ReactionType } from '@/domain/community/community.types';
import { ApiError } from '@/infrastructure/api/apiClient';

interface PatientGroupFeedScreenProps {
  /** Optional group name for the screen title; falls back to "Comunidad". */
  groupName?: string;
  onBack: () => void;
  /** The full useGroupFeed return value, wired at the page level. */
  feedState: UseGroupFeedReturn;
}

/**
 * Content screen for a community group feed.
 * Receives all data and handlers from the parent page, which owns the useGroupFeed hook.
 * This component is pure of fetch logic — consistent with MedicationHistoryScreen pattern.
 *
 * Contains:
 * - Inline post composer (collapsible)
 * - Paginated post list with loading/error/empty states
 * - "Cargar más" button when hasMore
 * - Delegates reactions and comment POSTs to the feedState handlers
 */
export function PatientGroupFeedScreen({
  groupName,
  onBack,
  feedState,
}: PatientGroupFeedScreenProps) {
  const {
    posts,
    isLoading,
    isError,
    error,
    reload,
    loadMore,
    hasMore,
    isLoadingMore,
    userReactions,
    createPost,
    addReaction,
    removeReaction,
    createComment,
  } = feedState;

  const addToast = useToastStore((s) => s.addToast);

  // ── Post composer state ──────────────────────────────────────────────────────
  const [composerOpen, setComposerOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);

  const handleOpenComposer = () => {
    setComposerOpen(true);
    setComposerError(null);
  };

  const handleCancelComposer = () => {
    setComposerOpen(false);
    setPostContent('');
    setComposerError(null);
  };

  const handleCreatePost = async () => {
    const trimmed = postContent.trim();
    if (!trimmed) return;

    if (trimmed.length > 4000) {
      setComposerError('La publicación no puede superar 4000 caracteres.');
      return;
    }

    setIsCreating(true);
    setComposerError(null);

    try {
      await createPost(trimmed);
      setPostContent('');
      setComposerOpen(false);
      addToast({ type: 'success', message: 'Publicación creada exitosamente.' });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Error al crear la publicación. Intenta de nuevo.';
      setComposerError(msg);
      addToast({ type: 'error', message: msg });
    } finally {
      setIsCreating(false);
    }
  };

  // ── Reaction toggle ──────────────────────────────────────────────────────────
  const handleToggleReaction = useCallback(
    (postId: string, type: ReactionType) => {
      const isSelected = userReactions[postId]?.includes(type) ?? false;
      if (isSelected) {
        void removeReaction(postId, type);
      } else {
        void addReaction(postId, type);
      }
    },
    [userReactions, addReaction, removeReaction],
  );

  // ── Comment handler ──────────────────────────────────────────────────────────
  const handleComment = useCallback(
    async (postId: string, content: string): Promise<void> => {
      // createComment throws on failure — CommunityPostCard catches it for local error state.
      // On success we show a toast here (screen layer) as required by architecture guidelines.
      await createComment(postId, content);
      addToast({ type: 'success', message: 'Comentario enviado.' });
    },
    [createComment, addToast],
  );

  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      {/* Back navigation + title */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-text hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-md"
          aria-label="Volver a grupos"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver
        </button>
        <h2 className="text-xl font-black tracking-tight text-brand-dark">
          {groupName ?? 'Comunidad'}
        </h2>
      </div>

      {/* Post composer */}
      {!composerOpen ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleOpenComposer}
          className="self-start"
          aria-label="Crear nueva publicación"
        >
          + Nueva publicación
        </Button>
      ) : (
        <section
          className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-3"
          aria-label="Compositor de publicación"
        >
          <h3 className="text-sm font-bold text-brand-dark">Nueva publicación</h3>
          <Textarea
            label="¿Qué quieres compartir?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            rows={4}
            maxLength={4000}
            placeholder="Comparte tu experiencia con el grupo..."
            error={composerError ?? undefined}
            disabled={isCreating}
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-text" aria-live="polite">
              {postContent.length}/4000
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelComposer}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreatePost}
                isLoading={isCreating}
                disabled={!postContent.trim() || isCreating}
              >
                Publicar
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Loading state */}
      {isLoading && (
        <div
          className="flex flex-col gap-3"
          aria-busy="true"
          aria-label="Cargando publicaciones"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-32 w-full animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center"
        >
          <p className="text-sm font-medium text-red-700">
            {error ?? 'Ocurrió un error al cargar las publicaciones.'}
          </p>
          <Button variant="primary" size="sm" onClick={reload}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && posts.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-gray-text">
            Aún no hay publicaciones en este grupo. ¡Sé el primero en compartir!
          </p>
        </div>
      )}

      {/* Post list */}
      {!isLoading && !isError && posts.length > 0 && (
        <ul
          className="flex flex-col gap-4"
          aria-label="Publicaciones del grupo"
        >
          {posts.map((post) => (
            <li key={post.id}>
              <CommunityPostCard
                post={post}
                selectedReactions={userReactions[post.id] ?? []}
                onToggleReaction={handleToggleReaction}
                onComment={handleComment}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {hasMore && !isLoading && !isError && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void loadMore()}
          isLoading={isLoadingMore}
          fullWidth
          aria-label="Cargar más publicaciones"
        >
          Cargar más
        </Button>
      )}
    </div>
  );
}
