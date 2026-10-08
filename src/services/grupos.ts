import { api } from '@/lib/auth';
import type { GrupoModelBasico, GrupoInput, PermissaoModelBasico } from '@/types/api';

export const gruposService = {
  listar() {
    return api.get<GrupoModelBasico[]>('/grupos');
  },
  buscar(codigo: string) {
    return api.get<GrupoModelBasico>(`/grupos/${codigo}`);
  },
  criar(body: GrupoInput) {
    return api.post<GrupoModelBasico>('/grupos', body);
  },
  atualizar(codigo: string, body: GrupoInput) {
    return api.put<GrupoModelBasico>(`/grupos/${codigo}`, body);
  },
  excluir(codigo: string) {
    return api.delete(`/grupos/${codigo}`);
  },
  listarPermissoes(codigoGrupo: string) {
    return api.get<PermissaoModelBasico[]>(`/grupos/${codigoGrupo}/permissoes`);
  },
  associarPermissao(codigoGrupo: string, codigoPermissao: string) {
    return api.put(
      `/grupos/${codigoGrupo}/permissoes/${codigoPermissao}`
    );
  },
  desassociarPermissao(codigoGrupo: string, codigoPermissao: string) {
    return api.delete(
      `/grupos/${codigoGrupo}/permissoes/${codigoPermissao}`
    );
  },
  substituirPermissoesPorChaves(codigoGrupo: string, permissoes: string[]) {
    return api.put(`/grupos/${codigoGrupo}/permissoes`, { permissoes });
  },
};
