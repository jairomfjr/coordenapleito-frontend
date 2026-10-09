import { api } from '@/lib/auth';
import type {
  LocalVotacaoFilter,
  LocalVotacaoInput,
  LocalVotacaoModelBasico,
  PageResponse,
} from '@/types/api';

export const locaisVotacaoService = {
  listar(params?: LocalVotacaoFilter) {
    return api.get<PageResponse<LocalVotacaoModelBasico>>('/locais-votacao', { params });
  },
  buscar(codigo: string) {
    return api.get<LocalVotacaoModelBasico>(`/locais-votacao/${codigo}`);
  },
  criar(body: LocalVotacaoInput) {
    return api.post<LocalVotacaoModelBasico>('/locais-votacao', body);
  },
  atualizar(codigo: string, body: LocalVotacaoInput) {
    return api.put<LocalVotacaoModelBasico>(`/locais-votacao/${codigo}`, body);
  },
  excluir(codigo: string) {
    return api.delete(`/locais-votacao/${codigo}`);
  },
};
