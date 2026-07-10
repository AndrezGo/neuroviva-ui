'use client';

import { CuratorResourcesPanel } from '@/presentation/curator/CuratorResourcesPanel';
import { AdminTabBar } from './AdminTabBar';

/**
 * Admin content management screen.
 * Shows the "Crear recurso" form and the "Pendientes de revisión" list
 * via the shared CuratorResourcesPanel — same feature surface as the
 * doctor curation screen but under the Admin shell.
 */
export function AdminContentScreen() {
  return (
    <div className="flex flex-1 flex-col pb-24 lg:pb-8">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-primary">
          Administración
        </p>
        <h1 className="text-2xl font-bold text-brand-dark">Contenido</h1>
      </div>

      {/* ── Shared curation panel (create form + pending list) ── */}
      <CuratorResourcesPanel />

      {/* ── Mobile tab bar ──────────────────────────────────────── */}
      <AdminTabBar activeTab="content" />
    </div>
  );
}
