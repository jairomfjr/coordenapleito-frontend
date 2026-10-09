'use client';

/**
 * SearchableSelect – componente padrão para dropdown com lista longa e busca.
 * Padrão do projeto: borda verde ao abrir, busca no topo, primeira opção "Selecione um X"
 * com destaque verde claro. Ver .cursor/rules/searchable-select-padrao.mdc.
 */

import { useRef, useState, useEffect, type MouseEvent as ReactMouseEvent } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import styles from './SearchableSelect.module.css';

export interface SearchableSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  value: string | number | undefined;
  onChange: (value: string | number | undefined) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  'aria-label'?: string;
  /** Reduz padding e fonte (ex.: barra de listagem) */
  compact?: boolean;
  /** Borda do trigger igual ao campo de busca da barra (#d0d0d0) quando fechado */
  inBar?: boolean;
  /** Altura máxima da lista (px). Útil para evitar sobrepor conteúdo abaixo. */
  maxListHeight?: number;
  /** Chamado quando o dropdown abre ou fecha */
  onOpenChange?: (open: boolean) => void;
  /** Busca no servidor: não filtra options localmente; dispara onSearchChange ao digitar. */
  remoteSearch?: boolean;
  /** Termo digitado na caixa de busca (útil com remoteSearch). */
  onSearchChange?: (term: string) => void;
  /** Indicador de carregamento da lista (remoteSearch). */
  loading?: boolean;
  /** Mínimo de caracteres para exibir resultados (remoteSearch). Padrão: 2. */
  minSearchLength?: number;
  /** Mensagem quando o termo ainda não atinge minSearchLength. */
  hintMinSearch?: string;
  /**
   * Com remoteSearch, comprimento usado na validação mínima (ex.: só dígitos em busca por CPF).
   * Padrão: tamanho do termo sem acentos.
   */
  getEffectiveSearchLength?: (term: string) => number;
}

function normalizeForSearch(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione',
  searchPlaceholder = 'Pesquisar pelo nome...',
  disabled = false,
  required = false,
  id,
  'aria-label': ariaLabel,
  compact = false,
  inBar = false,
  maxListHeight,
  onOpenChange,
  remoteSearch = false,
  onSearchChange,
  loading = false,
  minSearchLength = 2,
  hintMinSearch,
  getEffectiveSearchLength,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => String(o.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const normalizedSearch = normalizeForSearch(search);
  const filteredOptions = remoteSearch
    ? options
    : normalizedSearch
      ? options.filter((o) => normalizeForSearch(o.label).includes(normalizedSearch))
      : options;
  const effectiveSearchLength = getEffectiveSearchLength
    ? getEffectiveSearchLength(search)
    : normalizedSearch.length;
  const showRemoteHint = remoteSearch && effectiveSearchLength < minSearchLength;

  const wrapperClasses = [
    styles.wrapper,
    open ? styles.wrapperOpen : '',
    disabled ? styles.wrapperDisabled : '',
    compact ? styles.compact : '',
    inBar ? styles.inBar : '',
  ].filter(Boolean).join(' ');

  useEffect(() => {
    if (!open) {
      setSearch('');
      return;
    }
    searchInputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = (
    optValue: string | number | undefined,
    e: ReactMouseEvent,
    disabled?: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    onChange(optValue);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={wrapperClasses}
      data-dropdown-open={open ? 'true' : undefined}
    >
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        className={styles.trigger}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <span className={selectedOption ? '' : styles.placeholder}>{displayLabel}</span>
        <ChevronDown size={compact ? 14 : 16} className={styles.icon} aria-hidden />
      </button>
      {open && (
        <div className={styles.dropdown}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} aria-hidden />
            <input
              ref={searchInputRef}
              type="text"
              className={styles.searchInput}
              data-no-uppercase
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                const next = e.target.value;
                setSearch(next);
                onSearchChange?.(next);
              }}
              onKeyDown={(e) => e.stopPropagation()}
              aria-label="Pesquisar"
            />
          </div>
          <ul
            className={styles.list}
            role="listbox"
            aria-activedescendant={value != null ? `opt-${value}` : undefined}
            style={
              maxListHeight != null
                ? { maxHeight: `min(${maxListHeight}px, 50vh)` }
                : undefined
            }
          >
            {!required && (
              <li
                id="opt-empty"
                role="option"
                aria-selected={value === undefined || value === ''}
                className={`${styles.option} ${(value === undefined || value === '') ? styles.optionSelected : ''}`}
                onMouseDown={(e) => handleSelect(undefined, e)}
              >
                {placeholder}
              </li>
            )}
            {showRemoteHint ? (
              <li className={styles.optionEmpty}>
                {hintMinSearch ??
                  `Digite pelo menos ${minSearchLength} caracteres (nome ou CPF) para buscar.`}
              </li>
            ) : loading ? (
              <li className={styles.optionEmpty}>Buscando...</li>
            ) : filteredOptions.length === 0 ? (
              <li className={styles.optionEmpty}>Nenhum resultado encontrado</li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={String(opt.value)}
                  id={`opt-${opt.value}`}
                  role="option"
                  aria-selected={String(opt.value) === String(value)}
                  aria-disabled={opt.disabled || undefined}
                  className={`${styles.option} ${String(opt.value) === String(value) ? styles.optionSelected : ''} ${opt.disabled ? styles.optionDisabled : ''}`}
                  onMouseDown={(e) => handleSelect(opt.value, e, opt.disabled)}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
