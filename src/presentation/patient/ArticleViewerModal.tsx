'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink } from 'lucide-react';
import type { PatientResource } from '@/domain/content/content.types';
import { stripHtml } from '@/shared/lib/stripHtml';

interface ArticleViewerModalProps {
  resource: PatientResource | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Full-screen in-app article viewer modal.
 *
 * Renders a sticky top control bar (article title + "Abrir en el navegador"
 * link + close button) above an iframe that fills the remaining viewport
 * height. The "Abrir en el navegador" link is always visible in the bar as
 * the primary fallback for sites that block iframe embedding.
 *
 * Always mounted by the parent so open/close can be toggled without
 * remounting the portal — identical pattern to Sheet.tsx.
 * Body content is guarded on `resource !== null` so a closing animation
 * does not blank the iframe mid-transition.
 */
export function ArticleViewerModal({ resource, open, onClose }: ArticleViewerModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // SSR guard — mirrors Sheet.tsx pattern.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape — only when the modal is open.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Focus the panel when opened — mirrors Sheet.tsx pattern.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  // Reset loading state only when the URL changes — NOT on every open transition.
  // The iframe persists inside the always-mounted portal, so when the same resource
  // is closed and reopened the browser does not reload an unchanged src and onLoad
  // never fires again. Tying the reset to url change means:
  //   - Opening a new URL (including the first open) shows the spinner until onLoad fires.
  //   - Reopening the same URL shows no spinner — the content is already loaded.
  useEffect(() => {
    if (resource?.url) {
      setIsLoading(true);
    }
  }, [resource?.url]);

  if (!mounted) return null;

  const strippedTitle = stripHtml(resource?.title);

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-viewer-title"
      tabIndex={-1}
      className={[
        'fixed inset-0 z-50 flex flex-col bg-white outline-none',
        'transition-opacity duration-200',
        open ? 'opacity-100' : 'opacity-0 pointer-events-none',
      ].join(' ')}
    >
      {/* ── Top control bar ── */}
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
        {/* Article title */}
        <h2
          id="article-viewer-title"
          className="flex-1 truncate text-sm font-bold text-brand-dark"
        >
          {strippedTitle || 'Artículo'}
        </h2>

        {/* "Abrir en el navegador" — always visible; primary fallback for blocked embeds */}
        {resource?.url && (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir el artículo en el navegador (se abre en una nueva pestaña)"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-brand-primary hover:bg-brand-primary-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
          </a>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* ── Iframe area ── */}
      <div className="relative flex-1 overflow-hidden">
        {/* Loading overlay — sits on top of the iframe while the page loads */}
        {isLoading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50"
            aria-hidden="true"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary/20 border-t-brand-primary" />
          </div>
        )}

        {/* Iframe — only rendered when a URL is available */}
        {resource?.url && (
          <iframe
            src={resource.url}
            title={strippedTitle || 'Artículo'}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
            className="h-full w-full border-0"
            onLoad={() => setIsLoading(false)}
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
