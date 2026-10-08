'use client';

import { useEffect, useMemo } from 'react';
import { SearchableSelect } from '@/components/SearchableSelect';

export type ModoDadosRelatorio = 'normal' | 'anonimizado';

const TODAS_OPCOES = [
  { value: 'normal' as const, label: 'Normal' },
  { value: 'anonimizado' as const, label: 'Dados anonimizados' },
];

type Props = {
  value: ModoDadosRelatorio;
  onChange: (value: ModoDadosRelatorio) => void;
  disabled?: boolean;
  permiteModoNormal?: boolean;
  permiteModoAnonimizado?: boolean;
};

export function RelatorioModoDadosSelect({
  value,
  onChange,
  disabled,
  permiteModoNormal = true,
  permiteModoAnonimizado = true,
}: Props) {
  const opcoes = useMemo(() => {
    return TODAS_OPCOES.filter((o) => {
      if (o.value === 'normal') return permiteModoNormal;
      return permiteModoAnonimizado;
    });
  }, [permiteModoNormal, permiteModoAnonimizado]);

  const valorEfetivo = useMemo(() => {
    if (opcoes.length === 0) return value;
    if (opcoes.some((o) => o.value === value)) return value;
    return opcoes[0].value;
  }, [opcoes, value]);

  useEffect(() => {
    if (opcoes.length > 0 && valorEfetivo !== value) {
      onChange(valorEfetivo);
    }
  }, [opcoes.length, valorEfetivo, value, onChange]);

  if (opcoes.length === 0) {
    return null;
  }

  return (
    <SearchableSelect
      value={valorEfetivo}
      onChange={(v) =>
        onChange((v === 'anonimizado' ? 'anonimizado' : 'normal') as ModoDadosRelatorio)
      }
      options={opcoes}
      placeholder="Modo dos dados"
      searchPlaceholder="Pesquisar..."
      aria-label="Modo de exibição dos dados pessoais"
      disabled={disabled}
    />
  );
}
