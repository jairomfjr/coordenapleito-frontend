import styles from './StatusBadge.module.css';

export interface StatusAtivoChipProps {
  /** Quando omitido ou null, trata como inativo (mesma regra de `x ? 'Sim' : 'Não'` nas tabelas). */
  ativo?: boolean | null;
}

export function StatusAtivoChip({ ativo }: StatusAtivoChipProps) {
  const isAtivo = Boolean(ativo);
  return (
    <span className={styles.badge} data-variant={isAtivo ? 'ativo' : 'inativo'}>
      {isAtivo ? 'Ativo' : 'Inativo'}
    </span>
  );
}
