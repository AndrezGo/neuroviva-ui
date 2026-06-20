'use client';

import Link from 'next/link';
import { Brain } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { tabItems } from '@/presentation/caregiver/navigation';
import type { CaregiverTab } from '@/presentation/caregiver/CaregiverTabBar';

interface CaregiverDesktopSidebarProps {
  activeTab: CaregiverTab;
}

/**
 * Fixed 240px sidebar for the Caregiver desktop layout.
 * Uses the brand gradient background (--gradient-brand) defined in globals.css.
 * Purely presentational — no hooks, no API calls.
 */
export function CaregiverDesktopSidebar({ activeTab }: CaregiverDesktopSidebarProps) {
  return (
    <aside
      aria-label="Menú lateral"
      className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col lg:flex"
      style={{ background: 'var(--gradient-brand)' }}
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20"
          aria-hidden="true"
        >
          <Brain className="h-4 w-4 text-white" />
        </div>
        <span className="text-xl font-black tracking-tight text-white select-none">
          NeuroViva
        </span>
      </div>

      {/* ── Divider ──────────────────────────────────────────── */}
      <div className="mx-4 h-px bg-white/20" aria-hidden="true" />

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav aria-label="Navegación de escritorio" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {tabItems.map(({ tab, label, href, Icon }) => {
          const isActive = tab === activeTab;
          return (
            <Link
              key={tab}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                isActive
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors duration-150',
                  isActive ? 'text-white' : 'text-white/60 group-hover:text-white',
                )}
                aria-hidden="true"
              />
              <span>{label}</span>

              {/* Active indicator bar */}
              {isActive && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-white"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom brand accent ───────────────────────────────── */}
      <div className="shrink-0 px-6 py-4">
        <p className="text-[10px] font-medium uppercase tracking-widest text-white/40 select-none">
          Cuidado inteligente
        </p>
      </div>
    </aside>
  );
}
