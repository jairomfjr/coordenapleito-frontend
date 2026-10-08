import type { AuthenticationModel } from '@/types/api';
import { hasPermission, hasPermissionRecursoProjeto } from '@/lib/permissions';

export type RecursoAtendimentoProjeto =
  | 'caminhao-cidadao-atendimento'
  | 'casa-cidadao-atendimento';

/** Cadastro de cidadão no fluxo de atendimento Caminhão do Cidadão. */
export function podeCadastrarCidadaoNoCaminhaoCidadao(
  user: AuthenticationModel | null | undefined
): boolean {
  return podeCadastrarCidadaoNoProjeto(user, 'caminhao-cidadao-atendimento');
}

/** Cadastro de cidadão no fluxo de atendimento Casa Cidadão. */
export function podeCadastrarCidadaoNaCasaCidadao(
  user: AuthenticationModel | null | undefined
): boolean {
  return podeCadastrarCidadaoNoProjeto(user, 'casa-cidadao-atendimento');
}

export function podeCadastrarCidadaoNoProjeto(
  user: AuthenticationModel | null | undefined,
  recursoAtendimento: RecursoAtendimentoProjeto
): boolean {
  return (
    hasPermission(user, 'cidadao.criar') ||
    hasPermissionRecursoProjeto(user, recursoAtendimento, 'criar')
  );
}

/**
 * Atualização de cidadão carregado pela busca no modal de projeto.
 * Alinhado a {@code PermissoesExpressions.CIDADAO_EDITAR} no backend.
 */
export function podeAtualizarCidadaoNoProjeto(
  user: AuthenticationModel | null | undefined,
  recursoAtendimento: RecursoAtendimentoProjeto
): boolean {
  if (hasPermission(user, 'cidadao.editar')) {
    return true;
  }
  if (hasPermission(user, 'cidadao.criar')) {
    return true;
  }
  if (hasPermissionRecursoProjeto(user, recursoAtendimento, 'editar')) {
    return true;
  }
  return hasPermissionRecursoProjeto(user, recursoAtendimento, 'criar');
}

/** Criar cidadão na listagem administrativa ou nos fluxos de projeto. */
export function podeCriarCidadao(
  user: AuthenticationModel | null | undefined
): boolean {
  return (
    podeCadastrarCidadaoNoProjeto(user, 'caminhao-cidadao-atendimento') ||
    podeCadastrarCidadaoNoProjeto(user, 'casa-cidadao-atendimento')
  );
}

/**
 * Editar cidadão na listagem administrativa ou nos fluxos de projeto.
 * Alinhado a {@code PermissoesExpressions.CIDADAO_EDITAR} no backend.
 */
export function podeEditarCidadao(
  user: AuthenticationModel | null | undefined
): boolean {
  return (
    podeAtualizarCidadaoNoProjeto(user, 'caminhao-cidadao-atendimento') ||
    podeAtualizarCidadaoNoProjeto(user, 'casa-cidadao-atendimento')
  );
}
