'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ListagemBanner, ListagemPageWrapper } from '@/components/listagem';
import { usuarioPodeVerGraficosCoordenadores } from '@/lib/permissions';
import { CoordenadorVinculosDashboard } from './home/CoordenadorVinculosDashboard';
import styles from './home/home.module.css';

export default function HomePage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const podeVerGraficos = usuarioPodeVerGraficosCoordenadores(user);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <ListagemPageWrapper>
      <ListagemBanner
        titulo="Início"
        descricao="Acompanhe, em tempo real, os coordenadores vinculados a cada local de trabalho."
      />
      {podeVerGraficos ? (
        <CoordenadorVinculosDashboard />
      ) : (
        <p className={styles.empty}>
          Use o menu para gerenciar usuários, grupos, permissões, coordenadores e locais de votação.
          Os gráficos desta página podem ser habilitados na árvore de permissões do grupo
          (Página inicial → Gráficos de coordenadores).
        </p>
      )}
    </ListagemPageWrapper>
  );
}
