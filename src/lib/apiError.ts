import axios from 'axios';

/** Formato Problem (RFC 7807) retornado pelo backend */
interface ProblemObject {
  name?: string;
  userMessage?: string;
}

interface ProblemResponse {
  userMessage?: string;
  detail?: string;
  message?: string;
  mensagem?: string;
  title?: string;
  error?: string;
  objects?: ProblemObject[];
}

export type ApiErrorView = {
  titulo: string;
  mensagem: string;
  podeTentarNovamente: boolean;
};

const MSG_SEM_CONEXAO =
  'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente em alguns segundos. Se o problema continuar, o sistema pode estar em atualização.';
const MSG_INDISPONIVEL =
  'O serviço está temporariamente indisponível. Aguarde um momento e tente novamente.';
const MSG_DEMORA =
  'A consulta demorou mais do que o esperado. Tente novamente em instantes.';
const MSG_GENERICA = 'Não foi possível concluir. Tente novamente.';

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
  const view = getApiErrorView(error);
  return view.mensagem || view.titulo || MSG_GENERICA;
}

export function getApiErrorView(error: unknown, contexto?: string): ApiErrorView {
  const tituloPadrao = contexto ? `Falha ao ${contexto}` : 'Não foi possível concluir';

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    const codigo = String(error.code ?? '');
    const causa = textoDeCausa(error);
    const rede = isFalhaDeProxy(data) || isErroDeRede(codigo, causa, error.message, status);
    const doProblema = textoDoProblema(data);

    if (doProblema) {
      return {
        titulo: tituloPadrao,
        mensagem: doProblema,
        podeTentarNovamente: rede || (status != null && status >= 500),
      };
    }

    if (rede) {
      const demorou =
        codigo === 'ECONNABORTED' || /timeout/i.test(causa) || /timeout/i.test(error.message ?? '');
      return {
        titulo: tituloPadrao,
        mensagem: demorou ? MSG_DEMORA : status && status >= 500 ? MSG_INDISPONIVEL : MSG_SEM_CONEXAO,
        podeTentarNovamente: true,
      };
    }

    if (status === 400) {
      return {
        titulo: 'Dados inválidos',
        mensagem: 'Revise os campos destacados e tente novamente.',
        podeTentarNovamente: false,
      };
    }
    if (status === 401) {
      return {
        titulo: tituloPadrao,
        mensagem: 'Sessão expirada ou não autenticado. Faça login novamente.',
        podeTentarNovamente: false,
      };
    }
    if (status === 403) {
      return {
        titulo: 'Acesso não permitido',
        mensagem: 'Você não tem permissão para esta operação.',
        podeTentarNovamente: false,
      };
    }
    if (status === 404) {
      return {
        titulo: tituloPadrao,
        mensagem: 'O serviço solicitado não foi encontrado. Recarregue a página e tente novamente.',
        podeTentarNovamente: true,
      };
    }
    if (status === 429) {
      return {
        titulo: tituloPadrao,
        mensagem: 'Muitas tentativas em pouco tempo. Aguarde um momento e tente novamente.',
        podeTentarNovamente: true,
      };
    }
    if (status === 431) {
      return {
        titulo: tituloPadrao,
        mensagem:
          'Os dados de sessão estão grandes demais. Limpe os cookies deste site, saia e entre novamente.',
        podeTentarNovamente: false,
      };
    }
    if (status != null && status >= 500) {
      return {
        titulo: 'Serviço temporariamente indisponível',
        mensagem: MSG_INDISPONIVEL,
        podeTentarNovamente: true,
      };
    }
  }

  if (error instanceof Error && error.message.trim() && !isMensagemTecnica(error.message)) {
    return { titulo: tituloPadrao, mensagem: error.message.trim(), podeTentarNovamente: false };
  }

  return { titulo: tituloPadrao, mensagem: MSG_GENERICA, podeTentarNovamente: true };
}

function isFalhaDeProxy(data: unknown): boolean {
  return Boolean(
    data &&
      typeof data === 'object' &&
      'error' in data &&
      (data as ProblemResponse).error === 'proxy_fetch_failed'
  );
}

function isErroDeRede(codigo: string, causa: string, mensagem: string | undefined, status?: number): boolean {
  if (status === 502 || status === 503 || status === 504) {
    return true;
  }
  const blob = `${codigo} ${causa} ${mensagem ?? ''}`.toLowerCase();
  return (
    codigo === 'ERR_NETWORK' ||
    codigo === 'ECONNABORTED' ||
    codigo === 'ERR_CANCELED' ||
    /econnrefused|enotfound|etimedout|econnreset|eai_again/.test(blob) ||
    isMensagemTecnica(mensagem ?? '') ||
    isMensagemTecnica(causa)
  );
}

function isMensagemTecnica(texto: string): boolean {
  const t = texto.trim().toLowerCase();
  if (!t) {
    return true;
  }
  return (
    t === 'fetch failed' ||
    t === 'network error' ||
    t === 'failed to fetch' ||
    t === 'abort' ||
    t === 'aborted' ||
    t.includes('fetch failed') ||
    t.startsWith('timeout of') ||
    t.startsWith('request failed with status code') ||
    /econnrefused|enotfound|etimedout|econnreset|eai_again|proxy_fetch_failed/.test(t)
  );
}

function textoDoProblema(data: unknown): string | null {
  if (data == null) {
    return null;
  }
  if (typeof data === 'string') {
    const texto = data.trim();
    if (!texto || texto.startsWith('<') || isMensagemTecnica(texto)) {
      return null;
    }
    return texto.length > 280 ? null : texto;
  }
  if (typeof data !== 'object') {
    return null;
  }
  const problem = data as ProblemResponse;
  const campos = (problem.objects ?? [])
    .map((item) => item.userMessage?.trim())
    .filter((item): item is string => Boolean(item));
  if (campos.length > 0) {
    return campos.join(' ');
  }
  for (const chave of ['userMessage', 'detail', 'mensagem', 'message'] as const) {
    const valor = problem[chave];
    if (typeof valor === 'string' && valor.trim() && !isMensagemTecnica(valor)) {
      return valor.trim();
    }
  }
  return null;
}

function textoDeCausa(error: { cause?: unknown }): string {
  const cause = error.cause;
  if (!cause || typeof cause !== 'object') {
    return '';
  }
  const registro = cause as { code?: unknown; message?: unknown };
  return `${registro.code ?? ''} ${registro.message ?? ''}`;
}
