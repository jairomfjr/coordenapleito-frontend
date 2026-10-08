'use client';

import { useCallback, useRef } from 'react';

const DEFAULT_DROPDOWN_HEIGHT = 300;

/**
 * Scroll do corpo rolável do modal ao abrir/fechar SearchableSelect (regra modal-searchable-select-scroll).
 */
export function useModalSearchableSelectScroll(dropdownHeight = DEFAULT_DROPDOWN_HEIGHT) {
  const modalFormBodyRef = useRef<HTMLDivElement>(null);
  const scrollTopAntesAbrirRef = useRef(0);

  const scrollDropdownOnOpenChange = useCallback(
    (open: boolean, rowRef: { current: HTMLDivElement | null }) => {
      const container = modalFormBodyRef.current;
      const row = rowRef.current;
      if (open) {
        scrollTopAntesAbrirRef.current = container?.scrollTop ?? 0;
        setTimeout(() => {
          if (!container || !row) return;
          const rowRect = row.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const rowBottomInContent = container.scrollTop + (rowRect.bottom - containerRect.top);
          const targetBottom = rowBottomInContent + dropdownHeight + 16;
          const maxScrollTop = container.scrollHeight - container.clientHeight;
          const newScrollTop = Math.min(maxScrollTop, Math.max(0, targetBottom - container.clientHeight));
          container.scrollTo({ top: newScrollTop, behavior: 'smooth' });
        }, 100);
      } else {
        container?.scrollTo({ top: scrollTopAntesAbrirRef.current, behavior: 'smooth' });
      }
    },
    [dropdownHeight]
  );

  const makeOpenChangeHandler = useCallback(
    (rowRef: { current: HTMLDivElement | null }) => (open: boolean) =>
      scrollDropdownOnOpenChange(open, rowRef),
    [scrollDropdownOnOpenChange]
  );

  return { modalFormBodyRef, makeOpenChangeHandler };
}
