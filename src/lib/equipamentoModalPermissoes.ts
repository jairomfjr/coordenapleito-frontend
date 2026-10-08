import type { AuthenticationModel } from '@/types/api';
import { hasAnyPermission, hasPermission } from '@/lib/permissions';

/** Permissões das abas Equipe e Serviços ofertados no modal de equipamento. */
export type EquipamentoModalPermissoes = {
  servicos: {
    adicionar: boolean;
    copiarPeriodo: boolean;
    remover: boolean;
    vincularCidadao: boolean;
    desvincularCidadao: boolean;
    verCidadaos: boolean;
  };
  equipe: {
    incluir: boolean;
    editar: boolean;
    excluir: boolean;
    visualizar: boolean;
    fotoCamera: boolean;
    fotoArquivo: boolean;
    fotoRemover: boolean;
  };
};

export function getEquipamentoModalPermissoes(
  user: AuthenticationModel | null | undefined
): EquipamentoModalPermissoes {
  const podeCriarServico = hasPermission(user, 'equipamento-servico.criar');
  return {
    servicos: {
      adicionar: podeCriarServico,
      copiarPeriodo: podeCriarServico,
      remover: hasPermission(user, 'equipamento-servico.excluir'),
      vincularCidadao: hasPermission(user, 'equipamento-servico-cidadao.criar'),
      desvincularCidadao: hasPermission(user, 'equipamento-servico-cidadao.excluir'),
      verCidadaos: hasAnyPermission(user, [
        'equipamento-servico-cidadao.listar',
        'equipamento-servico-cidadao.visualizar',
      ]),
    },
    equipe: {
      incluir: hasPermission(user, 'equipamento-funcionario.criar'),
      editar: hasPermission(user, 'equipamento-funcionario.editar'),
      excluir: hasPermission(user, 'equipamento-funcionario.excluir'),
      visualizar: hasPermission(user, 'equipamento-funcionario.visualizar'),
      fotoCamera: hasPermission(user, 'equipamento-funcionario.foto-camera'),
      fotoArquivo: hasPermission(user, 'equipamento-funcionario.foto-arquivo'),
      fotoRemover: hasPermission(user, 'equipamento-funcionario.foto-remover'),
    },
  };
}
