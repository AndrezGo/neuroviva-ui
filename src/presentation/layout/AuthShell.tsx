/**
 * Two-column layout wrapper for auth flows.
 *
 * Mobile (< lg): single-column, children fill the full screen.
 * Desktop (≥ lg): left branding panel (gradient) + right form panel (white).
 *
 * Purely presentational — no hooks, no stores, no side effects.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full overflow-x-hidden lg:flex">
      {/* ── Left panel — branding, desktop only ──────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-14"
        style={{ background: 'var(--gradient-brand)' }}
      >
        <span className="select-none text-2xl font-black tracking-tight text-white">
          NeuroViva
        </span>

        <div>
          <h2 className="text-4xl font-black leading-tight text-white">
            Cuidado inteligente
            <br />
            para quienes más
            <br />
            importan.
          </h2>
          <p className="mt-4 text-base text-white/70">
            Acompaña, registra y conecta con el equipo médico desde un solo lugar.
          </p>
        </div>

        <p className="select-none text-xs font-medium uppercase tracking-widest text-white/40">
          NeuroViva · Colombia
        </p>
      </div>

      {/* ── Right panel — form ───────────────────────────────── */}
      <div className="flex flex-1 flex-col bg-white">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
