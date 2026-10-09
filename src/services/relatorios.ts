import { api } from '@/lib/auth';
import type { CoordenadorVinculoResumoModel } from '@/types/api';

export const relatoriosService = {
  ocupacao() {
    return api.get<CoordenadorVinculoResumoModel>('/relatorios/ocupacao');
  },
};
