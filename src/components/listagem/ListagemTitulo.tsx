import styles from './listagem.module.css';

interface ListagemTituloProps {
  /** Nome do recurso no plural (ex: "Equipamentos", "Serviços"). Será exibido como "LISTAGEM DE {recurso}" */
  recurso: string;
}

export function ListagemTitulo({ recurso }: ListagemTituloProps) {
  return <h1 className={styles.titulo}>LISTAGEM DE {recurso.toUpperCase()}</h1>;
}
