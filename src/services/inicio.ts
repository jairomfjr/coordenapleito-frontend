import { api } from '@/lib/auth';
import type { CoordenadorVinculoResumoModel } from '@/types/api';

export const inicioService = {
  graficosCoordenadores() {
    return api.get<CoordenadorVinculoResumoModel>('/inicio/graficos-coordenadores');
  },
};
