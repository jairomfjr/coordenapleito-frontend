import type { ReactNode } from 'react';
import styles from './home.module.css';

export function ChartCard({
  titulo,
  hint,
  children,
  wide,
}: {
  titulo: string;
  hint: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <article className={wide ? `${styles.card} ${styles.cardWide}` : styles.card}>
      <h2 className={styles.cardTitle}>{titulo}</h2>
      <p className={styles.cardHint}>{hint}</p>
      {children}
    </article>
  );
}
