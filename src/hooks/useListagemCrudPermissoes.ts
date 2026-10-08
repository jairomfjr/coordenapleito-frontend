'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authRecursoParaPathname } from '@/lib/listagemAuthRecurso';
import { hasPermissionRecursoProjeto } from '@/lib/permissions';

/**
 * Permissões CRUD do recurso da rota atual (modais, ações extras).
 * ListagemBar/ListagemTable já aplicam gate automaticamente; use este hook em formulários.
 */
export function useListagemCrudPermissoes(authRecurso?: string) {
  const { user } = useAuth();
  const pathname = usePathname();
  const recurso = useMemo(
    () => authRecurso ?? (pathname ? authRecursoParaPathname(pathname) : undefined),
    [authRecurso, pathname]
  );

  return useMemo(() => {
    if (!recurso) {
      return {
        recurso: undefined as string | undefined,
        podeCriar: false,
        podeEditar: false,
        podeExcluir: false,
        podeVisualizar: false,
        podeSalvarNovo: false,
        podeSalvarEdicao: false,
      };
    }
    const podeCriar = hasPermissionRecursoProjeto(user, recurso, 'criar');
    const podeEditar = hasPermissionRecursoProjeto(user, recurso, 'editar');
    const podeExcluir = hasPermissionRecursoProjeto(user, recurso, 'excluir');
    const podeVisualizar = hasPermissionRecursoProjeto(user, recurso, 'visualizar');
    return {
      recurso,
      podeCriar,
      podeEditar,
      podeExcluir,
      podeVisualizar,
      podeSalvarNovo: podeCriar,
      podeSalvarEdicao: podeEditar,
    };
  }, [recurso, user]);
}
