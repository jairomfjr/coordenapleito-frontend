import type { AuthenticationModel } from '@/types/api';
import { hasPermission } from '@/lib/permissions';

/** Permissões granulares do modal de organograma (status e foto). */
export function getOrganogramaModalPermissoes(user: AuthenticationModel | null | undefined) {
  return {
    alterarStatus: hasPermission(user, 'organograma.alterar-status'),
    fotoCamera: hasPermission(user, 'organograma.foto-camera'),
    fotoArquivo: hasPermission(user, 'organograma.foto-arquivo'),
    fotoRemover: hasPermission(user, 'organograma.foto-remover'),
  };
}
