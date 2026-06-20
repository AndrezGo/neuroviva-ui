import { Metadata } from 'next';
import { BrandMark } from '@/presentation/ui/BrandMark';
import { SplashCTA } from './SplashCTA';

export const metadata: Metadata = {
  title: 'NeuroViva',
  description:
    'Acompañamiento digital para familias, cuidadores y pacientes con enfermedades neurodegenerativas.',
};

/**
 * Splash screen — Screen 1.
 * Server component; navigation button is a small client island (SplashCTA).
 */
export default function SplashPage() {
  return (
    <main
      className="relative flex min-h-dvh w-full flex-col items-center justify-between overflow-hidden"
      style={{ background: 'var(--gradient-splash)' }}
    >
      {/* Subtle decorative gradient blobs — aria-hidden, purely visual */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Teal glow top-right */}
        <div
          className="absolute -top-32 -right-24 h-80 w-80 rounded-full opacity-25 blur-2xl"
          style={{ background: 'radial-gradient(circle, var(--color-brand-primary) 0%, transparent 70%)' }}
        />
        {/* Teal glow bottom-left */}
        <div
          className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full opacity-20 blur-2xl"
          style={{ background: 'radial-gradient(circle, var(--color-brand-primary-dark) 0%, transparent 70%)' }}
        />
        {/* Concentric rings — subtle depth behind the hero */}
        <div className="absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
        <div className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03]" />
      </div>

      {/* Centered hero content */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="animate-fade-up" style={{ animationDelay: '0ms' }}>
          <BrandMark size="lg" />
        </div>

        <div className="animate-fade-up mt-8" style={{ animationDelay: '120ms' }}>
          <h1 className="text-5xl font-black tracking-tight text-white">NeuroViva</h1>
        </div>

        <div className="animate-fade-up mt-4" style={{ animationDelay: '240ms' }}>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Acompañamiento digital para familias, cuidadores y pacientes con enfermedades
            neurodegenerativas.
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="mx-auto w-full max-w-md animate-fade-up px-6 pb-10"
        style={{ animationDelay: '360ms' }}
      >
        <SplashCTA />

        <p
          className="mt-6 text-center text-xs font-semibold tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Plataforma de Salud Digital · IA · Colombia
        </p>
      </div>
    </main>
  );
}
