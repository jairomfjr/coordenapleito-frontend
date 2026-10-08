import { api } from '@/lib/auth';
import type { PermissaoArvoreNodeModel, PermissaoModelBasico, PermissaoInput } from '@/types/api';

export const permissoesService = {
  arvore() {
    return api.get<PermissaoArvoreNodeModel[]>('/permissoes/arvore');
  },
  listar() {
    return api.get<PermissaoModelBasico[]>('/permissoes');
  },
  buscar(codigo: string) {
    return api.get<PermissaoModelBasico>(`/permissoes/${codigo}`);
  },
  criar(body: PermissaoInput) {
    return api.post<PermissaoModelBasico>('/permissoes', body);
  },
  atualizar(codigo: string, body: PermissaoInput) {
    return api.put<PermissaoModelBasico>(`/permissoes/${codigo}`, body);
  },
  excluir(codigo: string) {
    return api.delete(`/permissoes/${codigo}`);
  },
};
