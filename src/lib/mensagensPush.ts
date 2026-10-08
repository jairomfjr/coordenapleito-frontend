import { subscribeAuthenticatedSse } from '@/lib/sseClient';

/** Disparado no window quando o servidor sinaliza alteração no inbox (SSE evento {@code contagem}). */
export const MENSAGENS_PUSH_EVENT = 'coordenapleito:mensagens-push';

/**
 * Conecta ao stream SSE `/mensagens/stream` com Bearer no header (token fora da URL).
 */
export function subscribeMensagensPush(onContagem: () => void): () => void {
  const handleContagem = () => {
    window.dispatchEvent(new CustomEvent(MENSAGENS_PUSH_EVENT));
    onContagem();
  };

  return subscribeAuthenticatedSse('/mensagens/stream', {
    contagem: handleContagem,
  });
}
