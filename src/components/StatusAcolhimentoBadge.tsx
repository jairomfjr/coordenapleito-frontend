import type { StatusAcolhimento } from '@/types/api';
import styles from './StatusBadge.module.css';

const LABELS: Record<StatusAcolhimento, string> = {
  ATIVO: 'Ativo',
  ENCERRADO: 'Encerrado',
  TRANSFERIDO: 'Transferido',
};

const VARIANT: Record<StatusAcolhimento, string> = {
  ATIVO: 'ativo',
  ENCERRADO: 'encerrado',
  TRANSFERIDO: 'transferido',
};

export function StatusAcolhimentoBadge({ status }: { status?: StatusAcolhimento | null }) {
  if (status == null) {
    return <span className={styles.muted}>—</span>;
  }
  return (
    <span className={styles.badge} data-variant={VARIANT[status]}>
      {LABELS[status]}
    </span>
  );
}
