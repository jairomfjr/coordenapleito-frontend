import styles from './listagem.module.css';

interface ListagemBannerProps {
  titulo: string;
  descricao: string;
  kicker?: string;
}

export function ListagemBanner({
  titulo,
  descricao,
  kicker = 'Pleito eleitoral',
}: ListagemBannerProps) {
  return (
    <section className={styles.banner} aria-label={titulo}>
      <img className={styles.bannerImg} src="/backgroundequipamentos.png" alt="" />
      <div className={styles.bannerOverlay} />
      <div className={styles.bannerContent}>
        <p className={styles.bannerKicker}>{kicker}</p>
        <h1>{titulo}</h1>
        <p>{descricao}</p>
      </div>
    </section>
  );
}
