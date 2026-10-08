'use client';

import styles from './listagem.module.css';

interface ListagemPanelProps {
  children: React.ReactNode;
}

/** Envolve o bloco de listagem (tabela + footer) com fundo branco e bordas */
export function ListagemPanel({ children }: ListagemPanelProps) {
  return <div className={styles.panel}>{children}</div>;
}

/** Wrapper da página de listagem: fundo claro, padding. Envolve título, barra e panel */
export function ListagemPageWrapper({ children }: { children: React.ReactNode }) {
  return <div className={styles.listagemPage}>{children}</div>;
}
