import { api } from '@/lib/auth';
import type {
  UsuarioModelBasico,
  UsuarioInput,
  UsuarioFilter,
  PageResponse,
  SenhaInput,
  RecuperarSenhaInput,
} from '@/types/api';
import { publicApi } from '@/lib/api';

export const usuariosService = {
  listar(params?: UsuarioFilter) {
    return api.get<PageResponse<UsuarioModelBasico>>('/usuarios', { params });
  },
  buscar(codigo: string) {
    return api.get<UsuarioModelBasico>(`/usuarios/${codigo}`);
  },
  criar(body: UsuarioInput) {
    return api.post<UsuarioModelBasico>('/usuarios', body);
  },
  atualizar(codigo: string, body: UsuarioInput) {
    return api.put<UsuarioModelBasico>(`/usuarios/${codigo}`, body);
  },
  alterarSenha(codigo: string, body: SenhaInput) {
    return api.put(`/usuarios/${codigo}/alterar-senha`, body);
  },
  recuperarSenha(body: RecuperarSenhaInput) {
    return publicApi.put('/usuarios/recuperar-senha', body);
  },
  reenviarSenha(codigo: string) {
    return api.put(`/usuarios/${codigo}/reenviar-senha`);
  },
  ativar(codigo: string, ativo: boolean) {
    return api.put(`/usuarios/${codigo}/ativo`, ativo);
  },
  excluir(codigo: string) {
    return api.delete(`/usuarios/${codigo}`);
  },
};
