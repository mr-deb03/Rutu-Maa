import './globals.css';
import AppProviders from '@/components/AppProviders';
import Chrome from '@/components/Chrome';
import ThreeBackground from '@/components/ThreeBackground';

export const metadata = {
  title: 'Rutu-Maa · Period & Hygiene Companion',
  description: 'Track your cycle, get AI dietary plans, pad-change reminders, and a dedicated PCOD corner.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', apple: '/icon.svg' }
};

export const viewport = {
  themeColor: '#ff7eb3',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThreeBackground />
        <div className="bg-fallback" aria-hidden="true" />
        <AppProviders>
          <Chrome>{children}</Chrome>
        </AppProviders>
      </body>
    </html>
  );
}
