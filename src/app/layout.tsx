import type { Metadata } from 'next';
import { DM_Sans, Inter } from 'next/font/google';
import './globals.css';
import { AccessibilityEffect } from '@/presentation/providers/AccessibilityEffect';
import { ToastViewport } from '@/presentation/ui/ToastViewport';

/**
 * DM Sans — confident, modern display font for medical trust.
 * Chosen for NeuroViva's health-tech identity: clean geometry with
 * approachable warmth, reinforcing authority without clinical coldness.
 */
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

/**
 * Inter — health-tech standard body font with high mobile legibility.
 * Optimised for screen rendering at small sizes; ideal for data-dense
 * medical UIs consumed by patients, caregivers, and professionals.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'NeuroViva',
    template: '%s · NeuroViva',
  },
  description:
    'Acompañamiento digital para familias, cuidadores y pacientes con enfermedades neurodegenerativas.',
  keywords: ['neurodegenerativa', 'cuidadores', 'salud digital', 'Colombia', 'IA'],
  authors: [{ name: 'NeuroViva' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'NeuroViva',
    title: 'NeuroViva — Plataforma de Salud Digital',
    description:
      'Acompañamiento digital para familias, cuidadores y pacientes con enfermedades neurodegenerativas.',
  },
};

/**
 * Anti-flash script — runs synchronously before first paint.
 * Reads the persisted Zustand state from localStorage and applies
 * data-attributes to <html> so CSS variants never flash the default.
 * Wrapped in try/catch; never throws.
 */
const antiFlashScript = `
(function () {
  try {
    var raw = localStorage.getItem('neuroviva-preferences');
    if (!raw) return;
    var parsed = JSON.parse(raw);
    var state = parsed && parsed.state;
    if (!state) return;
    var root = document.documentElement;
    if (state.largeText === true) root.setAttribute('data-large-text', 'true');
    if (state.highContrast === true) root.setAttribute('data-high-contrast', 'true');
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-flash: apply persisted accessibility attrs before paint */}
        <script dangerouslySetInnerHTML={{ __html: antiFlashScript }} />
      </head>
      <body className="min-h-full antialiased">
        {/* Client island: reflects usePreferencesStore into data-attributes in real time */}
        <AccessibilityEffect />
        {children}
        {/* Global toast portal — single mount point for all sections (Admin, Patient, Doctor, Caregiver) */}
        <ToastViewport />
      </body>
    </html>
  );
}
