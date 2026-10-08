'use client';

import { useEffect, useMemo } from 'react';
import { SearchableSelect } from '@/components/SearchableSelect';
import type { RelatorioDashboardOpcaoModel } from '@/types/api';

export type RelatorioDashboardTipo = string;

type Props = {
  value: RelatorioDashboardTipo;
  onChange: (value: RelatorioDashboardTipo) => void;
  opcoes: RelatorioDashboardOpcaoModel[];
  disabled?: boolean;
};

export function RelatorioDashboardSelect({ value, onChange, opcoes, disabled }: Props) {
  const selectOptions = useMemo(
    () => opcoes.map((o) => ({ value: o.id, label: o.label })),
    [opcoes]
  );

  const valorEfetivo = useMemo(() => {
    if (opcoes.some((o) => o.id === value)) return value;
    return opcoes[0]?.id ?? '';
  }, [opcoes, value]);

  useEffect(() => {
    if (valorEfetivo && valorEfetivo !== value) {
      onChange(valorEfetivo);
    }
  }, [valorEfetivo, value, onChange]);

  if (opcoes.length === 0) {
    return null;
  }

  return (
    <SearchableSelect
      value={valorEfetivo}
      onChange={(v) => onChange(String(v))}
      options={selectOptions}
      placeholder="Dashboard a exportar"
      searchPlaceholder="Pesquisar..."
      aria-label="Dashboard a exportar em PDF"
      disabled={disabled}
    />
  );
}
