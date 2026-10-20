import type { Metadata, Viewport } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'NEXUS LIFE-OS — Personal & Civil Engineering Command Center',
  description:
    'Unified personal operating system: mind-map task & BOQ engine, financial velocity, health telemetry, AI lab analysis and cross-system executive briefing.',
  applicationName: 'NEXUS LIFE-OS',
  authors: [{ name: 'Officer Arjuna Kahandawa' }],
  keywords: [
    'life-os',
    'civil-engineering',
    'bill-of-quantities',
    'budget-planner',
    'health-telemetry',
    'wearable',
  ],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#04060d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-ink-950 text-slate-200">
        <div className="relative min-h-screen">
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 grid-canvas opacity-[0.55] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]"
          />
          <div className="relative z-10">{children}</div>
        </div>
      </body>
    </html>
  );
}
