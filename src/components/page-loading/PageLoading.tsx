import type { PageLoadingVariant } from './types';
import styles from './page-loading.module.css';

type Props = {
  variant?: PageLoadingVariant;
};

const VARIANT_MESSAGES: Record<PageLoadingVariant, { title: string; subtitle: string }> = {
  default: {
    title: 'Carregando',
    subtitle: 'Aguarde enquanto a página é preparada.',
  },
  list: {
    title: 'Carregando listagem',
    subtitle: 'Buscando registros e filtros da tela.',
  },
  dashboard: {
    title: 'Carregando dashboard',
    subtitle: 'Montando indicadores e gráficos.',
  },
  map: {
    title: 'Carregando mapa',
    subtitle: 'Preparando equipamentos e camadas do mapa.',
  },
  organogram: {
    title: 'Carregando organograma',
    subtitle: 'Organizando a estrutura hierárquica.',
  },
  'vapt-list': {
    title: 'Carregando VAPT VUPT',
    subtitle: 'Preparando atendimentos e totais.',
  },
  minimal: {
    title: 'Carregando',
    subtitle: 'Aguarde um momento.',
  },
};

export default function PageLoading({ variant = 'default' }: Props) {
  const { title, subtitle } = VARIANT_MESSAGES[variant];

  return (
    <div
      className="modalOverlay"
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
      aria-busy="true"
      aria-labelledby="page-loading-title"
      aria-describedby="page-loading-desc"
    >
      <div className={`modalContent ${styles.modalBox}`} data-modal-top-close>
        <div className={styles.spinner} aria-hidden />
        <p id="page-loading-title" className={styles.title}>
          {title}
        </p>
        <p id="page-loading-desc" className={styles.subtitle}>
          {subtitle}
        </p>
        <div className={styles.preview} aria-hidden>
          <div className={styles.previewLine} />
          <div className={styles.previewLine} />
          <div className={styles.previewLine} />
        </div>
      </div>
    </div>
  );
}
