'use client';

import { CuratorResourcesPanel } from '@/presentation/curator/CuratorResourcesPanel';
import { DoctorTabBar } from './DoctorTabBar';

// ─── Props ────────────────────────────────────────────────────────────────────

interface DoctorCuratoriaScreenProps {
  isScientificCommittee?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DoctorCuratoriaScreen({
  isScientificCommittee = false,
}: DoctorCuratoriaScreenProps) {
  return (
    <div className="flex flex-1 flex-col pb-24 lg:pb-8">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-primary">
          Panel Clínico
        </p>
        <h1 className="text-2xl font-bold text-brand-dark">Curaduría</h1>
      </div>

      {/* ── Shared curation panel (create form + pending list) ── */}
      <CuratorResourcesPanel />

      {/* ── Mobile tab bar ──────────────────────────────────────── */}
      <DoctorTabBar activeTab="curation" isScientificCommittee={isScientificCommittee} />
    </div>
  );
}
