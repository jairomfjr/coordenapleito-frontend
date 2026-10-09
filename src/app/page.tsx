'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <main style={{ padding: '1.5rem 1.75rem' }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Coordenapleito</h1>
      <p style={{ marginTop: '0.75rem', maxWidth: '40rem', lineHeight: 1.5 }}>
        Use o menu para gerenciar usuários, grupos, permissões e locais de votação.
      </p>
    </main>
  );
}
