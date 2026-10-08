import type { StatusEquipamento } from '@/types/api';
import styles from './StatusBadge.module.css';

const LABELS: Record<StatusEquipamento, string> = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  EM_OBRAS: 'Em obras',
  ENCERRADO: 'Encerrado',
};

const VARIANT: Record<StatusEquipamento, string> = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  EM_OBRAS: 'em_obras',
  ENCERRADO: 'encerrado',
};

export function StatusEquipamentoBadge({ status }: { status?: StatusEquipamento | null }) {
  if (status == null) {
    return <span className={styles.muted}>—</span>;
  }
  return (
    <span className={styles.badge} data-variant={VARIANT[status]}>
      {LABELS[status]}
    </span>
  );
}
