import { publicApi } from '@/lib/api';
import type {
  CoordenadorCpfConsultaModel,
  CoordenadorInput,
  CoordenadorPublicoModel,
  CoordenadorVerificacaoModel,
  LocalVotacaoPublicoModel,
} from '@/types/api';

export const coordenadorPublicoService = {
  listarLocais() {
    return publicApi.get<LocalVotacaoPublicoModel[]>('/publico/locais-votacao');
  },
  consultarCpf(cpf: string) {
    return publicApi.post<CoordenadorCpfConsultaModel>('/publico/coordenadores/consultar-cpf', { cpf });
  },
  verificarCodigo(cpf: string, codigo: string) {
    return publicApi.post<CoordenadorVerificacaoModel>('/publico/coordenadores/verificar-codigo', {
      cpf,
      codigo,
    });
  },
  cadastrar(body: CoordenadorInput) {
    return publicApi.post<CoordenadorPublicoModel>('/publico/coordenadores', body);
  },
  atualizar(body: {
    tokenAtualizacao: string;
    nome: string;
    telefone: string;
    email: string;
    localTrabalhoCodigo: string;
    localVotacaoCodigo: string;
  }) {
    return publicApi.put<CoordenadorPublicoModel>('/publico/coordenadores', body);
  },
};
