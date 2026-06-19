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
      style={{ backgroundColor: 'var(--color-splash-bg)' }}
    >
      {/* Subtle decorative gradient blobs — aria-hidden, purely visual */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-10"
          style={{
            background:
              'radial-gradient(circle, var(--color-brand-primary) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full"
          style={{
            background:
              'radial-gradient(circle, var(--color-brand-primary) 0%, transparent 70%)',
            opacity: 0.08,
          }}
        />
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
