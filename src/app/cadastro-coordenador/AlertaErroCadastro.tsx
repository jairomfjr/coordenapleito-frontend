import type { ApiErrorView } from '@/lib/apiError';
import styles from './cadastro-coordenador.module.css';

export function AlertaErroCadastro({
  erro,
  onTentarNovamente,
}: {
  erro: ApiErrorView;
  onTentarNovamente?: () => void;
}) {
  return (
    <div className={styles.error} role="alert">
      {erro.titulo ? <p className={styles.errorTitle}>{erro.titulo}</p> : null}
      <p className={styles.errorText}>{erro.mensagem}</p>
      {erro.podeTentarNovamente && onTentarNovamente ? (
        <button type="button" className={styles.errorRetry} onClick={onTentarNovamente}>
          Tentar novamente
        </button>
      ) : null}
    </div>
  );
}

function erroSimples(titulo: string, mensagem: string): ApiErrorView {
  return { titulo, mensagem, podeTentarNovamente: false };
}

export function erroCpfInvalido(): ApiErrorView {
  return erroSimples(
    'CPF inválido',
    'Digite um CPF com 11 dígitos válidos para consultar ou cadastrar.'
  );
}

export function erroCapacidadeEsgotada(): ApiErrorView {
  return erroSimples(
    'Sem vaga para coordenar',
    'O local escolhido para coordenar já atingiu o número máximo de coordenadores. Escolha outro.'
  );
}
