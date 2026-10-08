/** Formata valores numéricos do SECOFI (demonstrativo) para exibição em pt-BR com 2 casas decimais. */
export function formatSecofiNumero(v: number | null | undefined): string {
  if (v == null || Number.isNaN(Number(v))) return '—';
  return Number(v).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
