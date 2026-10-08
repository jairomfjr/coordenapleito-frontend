'use client';

import { Pencil, Trash2, Search, UserPlus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authRecursoParaPathname } from '@/lib/listagemAuthRecurso';
import { hasPermissionRecursoProjeto } from '@/lib/permissions';
import styles from './listagem.module.css';

export interface Coluna<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  /** Se não passar render, usa item[key]. Para chaves aninhadas use render. */
  align?: 'left' | 'right';
}

export interface AcaoExtra<T> {
  label: string;
  onClick: (item: T) => void;
  icon?: React.ReactNode;
  /** Quando definido, o botão só aparece se retornar true para o item. */
  visible?: (item: T) => boolean;
}

interface ListagemTableProps<T> {
  colunas: Coluna<T>[];
  dados: T[];
  /** Chave única do item (ex: codigo ou id) */
  rowKey: (item: T) => string;
  /** Botão Editar: (item) => void */
  onEditar?: (item: T) => void;
  /** Texto do botão de edição (ex.: "Editar" ou "Visualizar") */
  labelEditar?: string;
  /** Botão Excluir: (item) => void */
  onExcluir?: (item: T) => void;
  /** Ações extras (ex.: Vincular Cidadão) */
  acoesExtra?: AcaoExtra<T>[];
  /** Recurso RBAC para exibir Editar/Excluir ({@code recurso.editar} / {@code recurso.excluir}). */
  authRecurso?: string;
}

export function ListagemTable<T extends object>({
  colunas,
  dados,
  rowKey,
  onEditar,
  labelEditar = 'Editar',
  onExcluir,
  acoesExtra,
  authRecurso,
}: ListagemTableProps<T>) {
  const { user } = useAuth();
  const pathname = usePathname();
  const recurso =
    authRecurso ?? (pathname ? authRecursoParaPathname(pathname) : undefined);
  const podeEditar = recurso != null && hasPermissionRecursoProjeto(user, recurso, 'editar');
  const podeVisualizar = recurso != null && hasPermissionRecursoProjeto(user, recurso, 'visualizar');
  const podeAbrirRegistro = podeEditar || podeVisualizar;
  const onEditarGated = onEditar && recurso != null && podeAbrirRegistro ? onEditar : undefined;
  const labelEditarEfetivo =
    labelEditar === 'Editar' && recurso && !podeEditar && podeVisualizar
      ? 'Visualizar'
      : labelEditar;
  const onExcluirGated =
    onExcluir && recurso != null && hasPermissionRecursoProjeto(user, recurso, 'excluir') ? onExcluir : undefined;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {colunas.map((c) => (
              <th key={c.key} style={{ textAlign: c.align ?? 'left' }}>
                {c.label}
              </th>
            ))}
            {(onEditarGated || onExcluirGated || (acoesExtra && acoesExtra.length > 0)) && (
              <th>Ações</th>
            )}
          </tr>
        </thead>
        <tbody>
          {dados.map((item) => (
            <tr key={rowKey(item)}>
              {colunas.map((col) => (
                <td key={col.key} style={{ textAlign: col.align ?? 'left' }}>
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[col.key] ?? '—')}
                </td>
              ))}
              {(onEditarGated || onExcluirGated || (acoesExtra && acoesExtra.length > 0)) && (
                <td>
                  {onEditarGated && (
                    <button
                      type="button"
                      onClick={() => onEditarGated(item)}
                      className={styles.btnEditar}
                    >
                      {labelEditar === 'Visualizar' ? (
                        <Search size={14} />
                      ) : (
                        <Pencil size={14} />
                      )}
                      {labelEditarEfetivo}
                    </button>
                  )}
                  {acoesExtra?.map((acao, idx) => {
                    if (acao.visible && !acao.visible(item)) return null;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => acao.onClick(item)}
                        className={styles.btnAcaoExtra}
                      >
                        {acao.icon ?? <UserPlus size={14} />}
                        {acao.label}
                      </button>
                    );
                  })}
                  {onExcluirGated && (
                    <button
                      type="button"
                      onClick={() => onExcluirGated(item)}
                      className={styles.btnExcluir}
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
