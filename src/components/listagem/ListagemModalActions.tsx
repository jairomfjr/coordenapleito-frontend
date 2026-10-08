'use client';

import { useListagemCrudPermissoes } from '@/hooks/useListagemCrudPermissoes';

export interface ListagemModalActionsProps {
  /** Código do registro em edição; ausente = inclusão */
  editCodigo?: string | null;
  formLoading?: boolean;
  onCancel: () => void;
  authRecurso?: string;
  salvarLabel?: string;
  cancelarLabel?: string;
  /** Oculta o botão Salvar (ex.: modal somente leitura). */
  hideSalvar?: boolean;
  /** Substitui a checagem automática criar/editar. */
  podeSalvar?: boolean;
  /** Texto do botão durante {@link formLoading}. */
  loadingSalvarLabel?: string;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Rodapé padrão de modal de listagem: Cancelar + Salvar (submit) com gate RBAC.
 */
export function ListagemModalActions({
  editCodigo,
  formLoading = false,
  onCancel,
  authRecurso,
  salvarLabel = 'Salvar',
  cancelarLabel = 'Cancelar',
  hideSalvar = false,
  podeSalvar: podeSalvarProp,
  loadingSalvarLabel = 'Salvando...',
  style,
  className = 'modalActions',
}: ListagemModalActionsProps) {
  const { podeSalvarNovo, podeSalvarEdicao } = useListagemCrudPermissoes(authRecurso);
  const podeSalvarRb = editCodigo ? podeSalvarEdicao : podeSalvarNovo;
  const podeSalvar = podeSalvarProp ?? podeSalvarRb;
  const exibirSalvar = !hideSalvar && podeSalvar;

  return (
    <div className={className} style={style}>
      <button
        type="button"
        className="modalBtnSecondary"
        onClick={onCancel}
        disabled={formLoading}
      >
        {cancelarLabel}
      </button>
      {exibirSalvar && (
        <button type="submit" className="modalBtnPrimary" disabled={formLoading}>
          {formLoading ? loadingSalvarLabel : salvarLabel}
        </button>
      )}
    </div>
  );
}
