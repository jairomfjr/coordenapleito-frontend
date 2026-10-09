'use client';

import { GraficosCoordenadores } from './GraficosCoordenadores';
import { fmt } from './chartTheme';
import { useCoordenadorVinculosLive } from './useCoordenadorVinculosLive';
import styles from './home.module.css';

export function CoordenadorVinculosDashboard() {
  const { data, erro, atualizado, aoVivo } = useCoordenadorVinculosLive();

  if (erro) {
    return <p className={styles.empty}>{erro}</p>;
  }
  if (!data) {
    return <p className={styles.empty}>Carregando indicadores…</p>;
  }

  const hora = atualizado
    ? atualizado.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  return (
    <>
      <p className={styles.meta}>
        <span>
          <span className={aoVivo ? styles.dotLive : styles.dotWait} />
          {aoVivo ? 'Ao vivo via WebSocket' : 'Reconectando…'}
        </span>
        <span>{hora ? `Atualizado às ${hora}` : ''}</span>
      </p>

      <section className={styles.kpis}>
        <article className={styles.kpi}>
          <p className={styles.kpiLabel}>Vinculados</p>
          <p className={styles.kpiValue}>{fmt(data.vinculados)}</p>
          <p className={styles.kpiHint}>
            {fmt(data.percentualOcupacao)}% da capacidade ({fmt(data.capacidadeTotal)})
          </p>
        </article>
        <article className={styles.kpi}>
          <p className={styles.kpiLabel}>Ainda faltam</p>
          <p className={styles.kpiValue}>{fmt(data.vagasDisponiveis)}</p>
          <p className={styles.kpiHint}>
            {fmt(data.locaisComVaga)} locais com vaga · {fmt(data.locaisEsgotados)} esgotados
          </p>
        </article>
        <article className={styles.kpi}>
          <p className={styles.kpiLabel}>Zona com mais vínculos</p>
          <p className={styles.kpiValue}>
            {data.zonaMaisVinculos ? `Zona ${data.zonaMaisVinculos.zona}` : '—'}
          </p>
          <p className={styles.kpiHint}>
            {data.zonaMaisVinculos
              ? `${fmt(data.zonaMaisVinculos.vinculados)} coordenadores`
              : 'Sem dados'}
          </p>
        </article>
        <article className={styles.kpi}>
          <p className={styles.kpiLabel}>Zona com menos vínculos</p>
          <p className={styles.kpiValue}>
            {data.zonaMenosVinculos ? `Zona ${data.zonaMenosVinculos.zona}` : '—'}
          </p>
          <p className={styles.kpiHint}>
            {data.zonaMenosVinculos
              ? `${fmt(data.zonaMenosVinculos.vinculados)} coordenadores`
              : 'Sem dados'}
          </p>
        </article>
      </section>

      <GraficosCoordenadores data={data} />
    </>
  );
}
