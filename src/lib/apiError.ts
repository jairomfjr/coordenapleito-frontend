import axios from 'axios';

/** Formato Problem (RFC 7807) retornado pelo backend */
interface ProblemResponse {
  userMessage?: string;
  detail?: string;
  message?: string;
  mensagem?: string;
}

/** 403 em requisição marcada com `silentForbidden` (prefetch opcional por perfil). */
export function isSilentForbiddenApiError(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 403 &&
    Boolean(error.config?.silentForbidden)
  );
}

type ToastErrorFn = (message: string) => void;

/** Exibe toast só se o erro não for 403 “silencioso” (prefetch sem permissão). */
export function toastApiError(error: unknown, toastError: ToastErrorFn): void {
  if (isSilentForbiddenApiError(error)) return;
  toastError(getApiErrorMessage(error));
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object') {
      const problem = data as ProblemResponse;
      if (typeof problem.userMessage === 'string' && problem.userMessage.trim()) {
        return problem.userMessage.trim();
      }
      if (typeof problem.detail === 'string' && problem.detail.trim()) {
        return problem.detail.trim();
      }
      if (typeof problem.message === 'string' && problem.message.trim()) {
        return problem.message.trim();
      }
      if (typeof problem.mensagem === 'string' && problem.mensagem.trim()) {
        return problem.mensagem.trim();
      }
    }
    if (error.response?.status === 400 && data) {
      return typeof data === 'string' ? data : 'Dados inválidos. Verifique o formulário.';
    }

    if (error.response?.status != null) {
      const status = error.response.status;
      if (status === 401) return 'Sessão expirada ou não autenticado (401). Faça login novamente.';
      if (status === 403) return 'Sem permissão para acessar este recurso (403).';
      if (status === 404) return 'Endpoint não encontrado (404).';
      if (status === 431) {
        return 'Cabeçalhos da requisição muito grandes (431). Limpe cookies do site, faça logout e entre novamente.';
      }
      if (status >= 500) return `Erro interno da API (${status}).`;
      return `Falha na API (${status}).`;
    }

    if (error.message?.trim()) {
      return error.message.trim();
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return 'Erro ao processar. Tente novamente.';
}
