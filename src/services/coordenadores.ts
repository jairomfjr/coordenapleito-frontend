import { api } from '@/lib/auth';
import type {
  CoordenadorFilter,
  CoordenadorInput,
  CoordenadorModelBasico,
  PageResponse,
} from '@/types/api';

export const coordenadoresService = {
  listar(params?: CoordenadorFilter) {
    return api.get<PageResponse<CoordenadorModelBasico>>('/coordenadores', { params });
  },
  buscar(codigo: string) {
    return api.get<CoordenadorModelBasico>(`/coordenadores/${codigo}`);
  },
  criar(body: CoordenadorInput) {
    return api.post<CoordenadorModelBasico>('/coordenadores', body);
  },
  atualizar(codigo: string, body: CoordenadorInput) {
    return api.put<CoordenadorModelBasico>(`/coordenadores/${codigo}`, body);
  },
  excluir(codigo: string) {
    return api.delete(`/coordenadores/${codigo}`);
  },
};
