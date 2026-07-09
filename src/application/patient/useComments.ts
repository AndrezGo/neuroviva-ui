'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { getPostComments } from '@/infrastructure/api/communityApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useToastStore } from '@/shared/store/useToastStore';
import type { CommunityComment } from '@/domain/community/community.types';

const TAKE = 20;

export interface UseCommentsReturn {
  comments: CommunityComment[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  /**
   * Fetches the first page of comments. Idempotent: if already loaded, this is a no-op.
   * Call this when the user first expands the comment thread.
   */
  load: () => Promise<void>;
  loadMore: () => Promise<void>;
  /**
   * Refetches the first page from scratch, resetting any previously loaded comments.
   * Use this after successfully posting a new comment so it appears in the thread.
   */
  reload: () => Promise<void>;
}

/**
 * Lazy hook for loading the comment thread on a single post.
 * Does NOT fetch on mount — call load() when the user expands the thread.
 *
 * Architecture:
 * - Application-layer hook; no JSX.
 * - Uses the same manual async pattern as useGroupFeed: loading/error/data + pagination.
 * - isMounted/active ref guards prevent stale state updates after unmount or re-fetch.
 * - load() is idempotent: subsequent calls are no-ops once the first page is loaded.
 * - reload() re-fetches from skip=0, used after a new comment is posted.
 */
export function useComments(postId: string): UseCommentsReturn {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const skipRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const activeRef = useRef<{ current: boolean } | null>(null);

  const addToast = useToastStore((s) => s.addToast);

  // Cancel any in-flight request when the component using this hook unmounts.
  useEffect(() => {
    return () => {
      if (activeRef.current) {
        activeRef.current.current = false;
      }
    };
  }, []);

  // ── Fetch first page ─────────────────────────────────────────────────────────

  const fetchFirstPage = useCallback(async (): Promise<void> => {
    // Cancel any previous in-flight request before starting a new one.
    if (activeRef.current) {
      activeRef.current.current = false;
    }
    const active = { current: true };
    activeRef.current = active;

    setIsLoading(true);
    setIsError(false);
    setError(null);
    setComments([]);
    setHasMore(true);
    skipRef.current = 0;

    try {
      const token = await supabaseAuthRepository.getAccessToken();
      if (!token) {
        if (!active.current) return;
        setIsError(true);
        setError('Tu sesión expiró. Inicia sesión de nuevo.');
        return;
      }

      const data = await getPostComments(token, postId, 0, TAKE);

      if (!active.current) return;
      setComments(data);
      skipRef.current = data.length;
      setHasMore(data.length === TAKE);
      hasLoadedRef.current = true;
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
  }, [postId]);

  // ── Public API ───────────────────────────────────────────────────────────────

  const load = useCallback(async (): Promise<void> => {
    if (hasLoadedRef.current) return; // idempotent — no-op if already loaded
    await fetchFirstPage();
  }, [fetchFirstPage]);

  const reload = useCallback(async (): Promise<void> => {
    hasLoadedRef.current = false; // reset so fetchFirstPage runs unconditionally
    await fetchFirstPage();
  }, [fetchFirstPage]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const currentSkip = skipRef.current;

    try {
      const token = await supabaseAuthRepository.getAccessToken();
      if (!token) {
        setIsLoadingMore(false);
        return;
      }

      const data = await getPostComments(token, postId, currentSkip, TAKE);
      skipRef.current = currentSkip + data.length;
      setComments((prev) => [...prev, ...data]);
      setHasMore(data.length === TAKE);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Error al cargar más comentarios. Por favor intenta de nuevo.';
      addToast({ type: 'error', message });
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, postId, addToast]);

  return {
    comments,
    isLoading,
    isError,
    error,
    hasMore,
    isLoadingMore,
    load,
    loadMore,
    reload,
  };
}
