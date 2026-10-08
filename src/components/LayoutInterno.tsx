'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function LayoutInterno({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        width: '100%',
      }}
    >
      <header
        style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          padding: '1rem 0',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 5,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{titulo}</h1>
        </div>
      </header>
      <main style={{ flex: 1, padding: '1.5rem 0 2rem', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
