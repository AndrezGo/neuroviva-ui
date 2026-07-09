'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import {
  getGroupFeed,
  createPost as apiCreatePost,
  createComment as apiCreateComment,
  addReaction as apiAddReaction,
  removeReaction as apiRemoveReaction,
} from '@/infrastructure/api/communityApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useToastStore } from '@/shared/store/useToastStore';
import { REACTION_TYPES, type CommunityPost, type ReactionType } from '@/domain/community/community.types';

const TAKE = 20;

/**
 * Derives a per-post map of the current user's reactions from a fresh server response.
 * Filters each post's `myReactions` string array to only the known ReactionType values
 * so the result is safely typed even if the server sends unexpected strings.
 */
function deriveUserReactions(posts: CommunityPost[]): Record<string, ReactionType[]> {
  const result: Record<string, ReactionType[]> = {};
  for (const post of posts) {
    const typed = post.myReactions.filter((r): r is ReactionType =>
      (REACTION_TYPES as readonly string[]).includes(r),
    );
    if (typed.length > 0) {
      result[post.id] = typed;
    }
  }
  return result;
}

export interface UseGroupFeedReturn {
  posts: CommunityPost[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reload: () => void;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isLoadingMore: boolean;
  /**
   * Per-post record of which reaction types the current user has active.
   *
   * Initial truth comes from the server's `myReactions` field on each post (seeded by
   * deriveUserReactions on every fetch). Optimistic toggles are layered on top and
   * rolled back on API error. State persists across reload because it is re-derived
   * from fresh server data rather than reset to an empty object.
   */
  userReactions: Record<string, ReactionType[]>;
  /** POSTs a new post and prepends it to the local list optimistically. */
  createPost: (content: string) => Promise<void>;
  /** Optimistically toggles a reaction. Rolls back + toasts on API error. */
  addReaction: (postId: string, type: ReactionType) => Promise<void>;
  /** Optimistically removes a reaction. Rolls back + toasts on API error. */
  removeReaction: (postId: string, type: ReactionType) => Promise<void>;
  /**
   * POSTs a comment and increments the post's commentCount optimistically on success.
   * The full comment thread is loaded lazily by useComments inside the card.
   * Throws ApiError on failure so the caller can handle the error state.
   */
  createComment: (postId: string, content: string) => Promise<void>;
}

/**
 * Manages the paginated post feed for a community group, along with all mutations.
 *
 * Architecture: hook is called at the page level and all data/handlers are passed
 * down as props to pure presentation components, consistent with MedicationHistoryPage.
 */
export function useGroupFeed(groupId: string): UseGroupFeedReturn {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  /**
   * Per-post record of which reactions the current user has active.
   * Seeded from the server's myReactions field on each fetch; optimistic
   * toggles are layered on top. Re-derived from server data on reload
   * rather than reset, so selected state stays accurate across refreshes.
   */
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType[]>>({});

  /**
   * Tracks the server-side pagination offset independently of React state.
   * Locally-created posts (prepended after createPost) do NOT advance this offset
   * since the backend's pagination is based on its own data order.
   */
  const skipRef = useRef(0);

  const addToast = useToastStore((s) => s.addToast);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
    // userReactions is NOT reset here — fetchData re-derives it from fresh server data
    // so the user's active reactions remain accurate across reloads.
  }, []);

  // ── Initial fetch ────────────────────────────────────────────────────────────

  const fetchData = useCallback(
    async (active: { current: boolean }) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      setPosts([]);
      setHasMore(true);
      skipRef.current = 0;

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          if (!active.current) return;
          setIsError(true);
          setError('Tu sesión expiró. Inicia sesión de nuevo.');
          setIsLoading(false);
          return;
        }

        const data = await getGroupFeed(token, groupId, 0, TAKE);

        if (!active.current) return;
        setPosts(data);
        setUserReactions(deriveUserReactions(data));
        skipRef.current = data.length;
        setHasMore(data.length === TAKE);
      } catch (err) {
        if (!active.current) return;
        const message =
          err instanceof ApiError
            ? err.message
            : 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
        setIsError(true);
        setError(message);
      } finally {
        if (active.current) {
          setIsLoading(false);
        }
      }
    },
    [groupId],
  );

  useEffect(() => {
    const active = { current: true };
    fetchData(active);
    return () => {
      active.current = false;
    };
  }, [fetchData, reloadKey]);

  // ── Load more (pagination) ───────────────────────────────────────────────────

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const currentSkip = skipRef.current;

    try {
      const token = await supabaseAuthRepository.getAccessToken();
      if (!token) {
        setIsLoadingMore(false);
        return;
      }

      const data = await getGroupFeed(token, groupId, currentSkip, TAKE);
      skipRef.current = currentSkip + data.length;
      setPosts((prev) => [...prev, ...data]);
      setUserReactions((prev) => ({ ...prev, ...deriveUserReactions(data) }));
      setHasMore(data.length === TAKE);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Error al cargar más publicaciones. Por favor intenta de nuevo.';
      addToast({ type: 'error', message });
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, groupId, addToast]);

  // ── Create post ──────────────────────────────────────────────────────────────

  const createPost = useCallback(
    async (content: string): Promise<void> => {
      const token = await supabaseAuthRepository.getAccessToken();
      if (!token) {
        throw new ApiError(401, 'Tu sesión expiró. Inicia sesión de nuevo.');
      }

      const result = await apiCreatePost(token, groupId, { content });

      /**
       * POST /groups/{groupId}/posts only returns { postId }.
       * The new post's full data (authorId, timestamps) is not echoed back.
       * We construct the CommunityPost locally using the submitted content.
       * authorId is set to '' because it is not available from the response —
       * it is not displayed in the UI so this is safe.
       */
      const newPost: CommunityPost = {
        id: result.postId,
        authorId: '',
        content,
        createdAt: new Date().toISOString(),
        removed: false,
        removedReason: null,
        reactions: {},
        myReactions: [],
        commentCount: 0,
      };

      setPosts((prev) => [newPost, ...prev]);
      // Do not advance skipRef — the local post is not a server-fetched page item.
    },
    [groupId],
  );

  // ── Add reaction (optimistic) ────────────────────────────────────────────────

  const addReaction = useCallback(
    async (postId: string, type: ReactionType): Promise<void> => {
      // Optimistic update: mark reaction as selected locally and increment count.
      setUserReactions((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), type],
      }));
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            reactions: { ...p.reactions, [type]: (p.reactions[type] ?? 0) + 1 },
          };
        }),
      );

      try {
        const token = await supabaseAuthRepository.getAccessToken();
        if (!token) throw new ApiError(401, 'Tu sesión expiró. Inicia sesión de nuevo.');
        await apiAddReaction(token, postId, type);
      } catch (err) {
        // Roll back optimistic update on API failure.
        setUserReactions((prev) => ({
          ...prev,
          [postId]: (prev[postId] ?? []).filter((r) => r !== type),
        }));
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              reactions: {
                ...p.reactions,
                [type]: Math.max(0, (p.reactions[type] ?? 1) - 1),
              },
            };
          }),
        );
        const message =
          err instanceof ApiError ? err.message : 'Error al agregar la reacción.';
        addToast({ type: 'error', message });
      }
    },
    [addToast],
  );

  // ── Remove reaction (optimistic) ─────────────────────────────────────────────

  const removeReaction = useCallback(
    async (postId: string, type: ReactionType): Promise<void> => {
      // Optimistic update: deselect reaction locally and decrement count.
      setUserReactions((prev) => ({
        ...prev,
        [postId]: (prev[postId] ?? []).filter((r) => r !== type),
      }));
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            reactions: {
              ...p.reactions,
              [type]: Math.max(0, (p.reactions[type] ?? 1) - 1),
            },
          };
        }),
      );

      try {
        const token = await supabaseAuthRepository.getAccessToken();
        if (!token) throw new ApiError(401, 'Tu sesión expiró. Inicia sesión de nuevo.');
        await apiRemoveReaction(token, postId, type);
      } catch (err) {
        // Roll back optimistic update on API failure.
        setUserReactions((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] ?? []), type],
        }));
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              reactions: { ...p.reactions, [type]: (p.reactions[type] ?? 0) + 1 },
            };
          }),
        );
        const message =
          err instanceof ApiError ? err.message : 'Error al quitar la reacción.';
        addToast({ type: 'error', message });
      }
    },
    [addToast],
  );

  // ── Create comment ───────────────────────────────────────────────────────────

  const createComment = useCallback(async (postId: string, content: string): Promise<void> => {
    const token = await supabaseAuthRepository.getAccessToken();
    if (!token) {
      throw new ApiError(401, 'Tu sesión expiró. Inicia sesión de nuevo.');
    }
    await apiCreateComment(token, postId, { content });
    // On success, optimistically increment the comment count so the feed reflects
    // the new total immediately. The actual thread is loaded lazily by useComments
    // inside the card, which calls reload() after a successful post.
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p,
      ),
    );
  }, []);

  return {
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
  };
}
