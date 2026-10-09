import type { Metadata } from 'next';
import Script from 'next/script';
import { Providers } from '@/providers';
import GlobalModalCloseButtonManager from '@/components/GlobalModalCloseButtonManager';
import GlobalUppercaseEnforcer from '@/components/GlobalUppercaseEnforcer';
import ThemeInitializer from '@/shared/components/ThemeInitializer';
import PublicLayout from './components/PublicLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Coordenapleito',
  description: 'Coordenapleito — usuários, grupos e permissões',
  // favicon.ico fica só em src/app/ — o App Router injeta o link automaticamente.
  // Não duplicar em public/ (conflito no path /favicon.ico).
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        suppressHydrationWarning
        className="font-sans antialiased"
        style={{ fontFamily: 'Kanit, sans-serif' }}
      >
        {process.env.NODE_ENV === 'development' && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
        <Providers>
          <ThemeInitializer />
          <GlobalUppercaseEnforcer />
          <GlobalModalCloseButtonManager />
          <PublicLayout>{children}</PublicLayout>
        </Providers>
      </body>
    </html>
  );
}
