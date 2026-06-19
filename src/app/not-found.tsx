import Link from 'next/link';
import { BrandMark } from '@/presentation/ui/BrandMark';
import { routes } from '@/core/routing/routes';

export default function NotFoundPage() {
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: 'var(--color-splash-bg)' }}
    >
      <BrandMark size="md" className="mb-6 opacity-80" />
      <h1 className="text-2xl font-black text-white mb-2">Página no encontrada</h1>
      <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
        La página que buscas no existe o fue movida.
      </p>
      <Link
        href={routes.splash()}
        className="inline-flex h-12 items-center justify-center rounded-2xl bg-brand-primary px-6 text-base font-semibold text-white transition-colors hover:bg-brand-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
