import type { Metadata, Viewport } from 'next';
import './globals.css';
import { NexusProvider } from '@/lib/store';
import { AppShell } from '@/components/shell/AppShell';

export const metadata: Metadata = {
  title: 'NEXUS LIFE-OS — Personal & Civil Command Centre',
  description: 'Mind-map tasks, bill of quantities, budgeting, health and bloodwork in one dashboard.',
};

export const viewport: Viewport = { themeColor: '#050714', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <NexusProvider>
          <AppShell>{children}</AppShell>
        </NexusProvider>
      </body>
    </html>
  );
}
