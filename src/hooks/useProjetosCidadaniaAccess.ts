'use client';

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usuarioPodeAcessarPaginaModuloOperacional } from '@/lib/modulosOperacionais';

/**
 * Acesso aos módulos Casa Cidadão / Caminhão — RBAC + escopo por coordenação ({@code modulosOperacionais}).
 */
export function useProjetosCidadaniaAccess() {
  const { user } = useAuth();

  const podeCasaCidadao = useMemo(
    () => usuarioPodeAcessarPaginaModuloOperacional(user, 'casa-cidadao', 'casa-cidadao.pagina'),
    [user]
  );

  const podeCaminhaoCidadao = useMemo(
    () =>
      usuarioPodeAcessarPaginaModuloOperacional(user, 'caminhao-cidadao', 'caminhao-cidadao.pagina'),
    [user]
  );

  const ehCoordenadorCidadania = useMemo(
    () => podeCasaCidadao || podeCaminhaoCidadao,
    [podeCasaCidadao, podeCaminhaoCidadao]
  );

  return {
    coordenacaoProjetosCidadaniaId: user?.coordenacaoId ?? null,
    ehCoordenadorCidadania,
    podeCasaCidadao,
    podeCaminhaoCidadao,
    contextoCarregando: false,
  };
}
