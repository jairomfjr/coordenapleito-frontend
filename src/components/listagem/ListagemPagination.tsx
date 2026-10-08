'use client';

import styles from './listagem.module.css';

interface ListagemPaginationProps {
  /** Total de itens */
  totalElements: number;
  /** Nome do recurso no plural (ex: "Equipamentos") */
  recursoPlural: string;
  /** Página atual (0-based) */
  currentPage: number;
  /** Total de páginas */
  totalPages: number;
  /** Primeira página? (desabilita anterior) */
  first: boolean;
  /** Última página? (desabilita próxima) */
  last: boolean;
  /** Tamanho da página (itens por página) */
  size: number;
  /** Opções de itens por página */
  sizeOptions?: number[];
  /** Callback mudança de página: (pageIndex: number) => void */
  onPageChange: (page: number) => void;
  /** Callback mudança de size: (size: number) => void */
  onSizeChange?: (size: number) => void;
}

export function ListagemPagination({
  totalElements,
  recursoPlural,
  currentPage,
  totalPages,
  first,
  last,
  size,
  sizeOptions = [5, 10, 25, 50],
  onPageChange,
  onSizeChange,
}: ListagemPaginationProps) {
  const labelTotal =
    totalElements === 1
      ? `1 ${recursoPlural.replace(/s$/, '')} no total`
      : `${totalElements} ${recursoPlural} no total`;

  const pageIndex = Number(currentPage);
  const safePageIndex = Number.isNaN(pageIndex) || pageIndex < 0 ? 0 : pageIndex;
  const displayPage = safePageIndex + 1;
  const safeTotalPages = Math.max(1, Number(totalPages) || 1);
  const labelPage = safeTotalPages <= 1
    ? `Página ${displayPage}`
    : `Página ${displayPage} de ${safeTotalPages}`;

  return (
    <div className={styles.footer}>
      <span className={styles.footerTotal}>{labelTotal}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span className={styles.footerPageOf} aria-live="polite">{labelPage}</span>
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.paginationBtn}
            disabled={first}
            onClick={() => onPageChange(safePageIndex - 1)}
            aria-label="Página anterior"
          >
            &lt;
          </button>
          <span className={styles.paginationCurrent} aria-current="page">{displayPage}</span>
          <button
            type="button"
            className={styles.paginationBtn}
            disabled={last}
            onClick={() => onPageChange(safePageIndex + 1)}
            aria-label="Próxima página"
          >
            &gt;
          </button>
        </div>
        {onSizeChange && (
          <div className={styles.perPage}>
            <select
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              aria-label="Itens por página"
            >
              {sizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n} / página
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
