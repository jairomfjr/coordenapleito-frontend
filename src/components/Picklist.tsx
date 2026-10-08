'use client';

import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './Picklist.module.css';

export interface PicklistOption<TValue extends string | number = string | number> {
  value: TValue;
  label: string;
  /** Texto adicional usado na pesquisa (ex.: código IBGE). */
  searchText?: string;
  disabled?: boolean;
  /** Tooltip quando a opção está desabilitada. */
  disabledTitle?: string;
}

export interface PicklistProps<TValue extends string | number = string | number> {
  idPrefix: string;
  options: PicklistOption<TValue>[];
  selected: TValue[];
  onSelectionChange: (selected: TValue[]) => void;
  disabled?: boolean;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  emptyMessage?: string;
  maxHeight?: string;
  renderOptionExtra?: (option: PicklistOption<TValue>) => ReactNode;
  /** Conteúdo após o rótulo (ex.: campo editável), fora do label para não acionar o checkbox. */
  renderOptionSuffix?: (option: PicklistOption<TValue>) => ReactNode;
  footer?: ReactNode;
}

function normalizarTermo(valor: string): string {
  return valor.trim().toLowerCase();
}

export function Picklist<TValue extends string | number = string | number>({
  idPrefix,
  options,
  selected,
  onSelectionChange,
  disabled = false,
  searchPlaceholder = 'Pesquisar...',
  searchAriaLabel = 'Pesquisar itens',
  emptyMessage = 'Nenhum item encontrado.',
  maxHeight,
  renderOptionExtra,
  renderOptionSuffix,
  footer,
}: PicklistProps<TValue>) {
  const [busca, setBusca] = useState('');

  const selecionados = useMemo(() => new Set(selected), [selected]);

  const filtrados = useMemo(() => {
    const termo = normalizarTermo(busca);
    if (!termo) return options;
    return options.filter((option) => {
      const label = option.label.toLowerCase();
      const extra = option.searchText?.toLowerCase() ?? '';
      return label.includes(termo) || extra.includes(termo) || String(option.value).includes(termo);
    });
  }, [busca, options]);

  const selecionaveisFiltrados = filtrados.filter((option) => !option.disabled);
  const todosFiltradosSelecionados =
    selecionaveisFiltrados.length > 0 &&
    selecionaveisFiltrados.every((option) => selecionados.has(option.value));

  const toggleSelecionado = (value: TValue) => {
    const next = new Set(selecionados);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    onSelectionChange(Array.from(next));
  };

  const toggleTodosFiltrados = () => {
    const next = new Set(selecionados);
    if (todosFiltradosSelecionados) {
      selecionaveisFiltrados.forEach((option) => next.delete(option.value));
    } else {
      selecionaveisFiltrados.forEach((option) => next.add(option.value));
    }
    onSelectionChange(Array.from(next));
  };

  const listStyle = maxHeight ? ({ '--picklist-max-height': maxHeight } as CSSProperties) : undefined;

  return (
    <>
      <div className={styles.toolbar}>
        <input
          id={`${idPrefix}-busca`}
          type="search"
          className={styles.search}
          placeholder={searchPlaceholder}
          value={busca}
          disabled={disabled}
          data-no-uppercase
          data-search-input
          aria-label={searchAriaLabel}
          onChange={(e) => setBusca(e.target.value)}
        />
        <label className={styles.selectAll} htmlFor={`${idPrefix}-select-all`}>
          <input
            id={`${idPrefix}-select-all`}
            type="checkbox"
            checked={todosFiltradosSelecionados}
            disabled={disabled || selecionaveisFiltrados.length === 0}
            onChange={toggleTodosFiltrados}
          />
          Selecionar {busca.trim() ? 'filtrados' : 'todos'} ({selecionaveisFiltrados.length})
        </label>
      </div>

      <ul className={styles.list} style={listStyle} aria-label="Lista de seleção">
        {filtrados.map((option) => {
          const optionId = `${idPrefix}-opt-${String(option.value)}`;
          const itemDisabled = disabled || option.disabled;
          return (
            <li key={String(option.value)} className={styles.item}>
              <label
                htmlFor={optionId}
                className={
                  itemDisabled ? `${styles.itemLabel} ${styles.itemLabelDisabled}` : styles.itemLabel
                }
                title={itemDisabled ? option.disabledTitle : undefined}
              >
                <input
                  id={optionId}
                  type="checkbox"
                  checked={selecionados.has(option.value)}
                  disabled={itemDisabled}
                  onChange={() => toggleSelecionado(option.value)}
                />
                <span className={styles.itemText}>{option.label}</span>
                {option.searchText ? (
                  <span className={styles.itemMeta}>{option.searchText}</span>
                ) : null}
                {renderOptionExtra ? (
                  <span className={styles.itemExtra}>{renderOptionExtra(option)}</span>
                ) : null}
              </label>
              {renderOptionSuffix ? (
                <div className={styles.itemSuffix}>{renderOptionSuffix(option)}</div>
              ) : null}
            </li>
          );
        })}
        {filtrados.length === 0 && <li className={styles.empty}>{emptyMessage}</li>}
      </ul>

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </>
  );
}
