import { NextRequest, NextResponse } from 'next/server';

import {
  API_CONTEXT_PATH,
  buildBackendTargetUrl,
  isBackendProxyDebugEnabled,
  listBackendOriginsToTry,
  logFetchAttempt,
  logFetchError,
  type BackendResolution,
} from '@/lib/backendOrigin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
]);

/**
 * SPA envia Bearer; cookies HttpOnly duplicam o JWT e estouram maxHttpHeaderSize do Tomcat.
 * Não encaminhar Cookie ao backend — o Next ainda precisa aceitar o request (ver NODE_OPTIONS).
 */
const STRIP_REQUEST_HEADERS = new Set(['cookie', ...HOP_BY_HOP]);

function forwardRequestHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (STRIP_REQUEST_HEADERS.has(lower)) {
      return;
    }
    headers.set(key, value);
  });
  return headers;
}

function forwardResponseHeaders(upstream: Response): Headers {
  const headers = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower) || lower === 'set-cookie') {
      return;
    }
    headers.set(key, value);
  });
  // Node fetch expõe múltiplos Set-Cookie via getSetCookie(); forEach pode colapsar.
  const getSetCookie = (
    upstream.headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie;
  if (typeof getSetCookie === 'function') {
    for (const cookie of getSetCookie.call(upstream.headers)) {
      headers.append('set-cookie', cookie);
    }
  } else {
    const single = upstream.headers.get('set-cookie');
    if (single) {
      headers.append('set-cookie', single);
    }
  }
  return headers;
}

function isConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return true;
  }
  const cause = 'cause' in error ? error.cause : undefined;
  if (cause && typeof cause === 'object' && cause !== null && 'code' in cause) {
    const code = String((cause as { code?: unknown }).code ?? '');
    return ['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'ECONNRESET'].includes(
      code
    );
  }
  return error.message.includes('fetch failed');
}

async function fetchBackendWithFallback(input: {
  pathSegments: string[];
  search: string;
  method: string;
  headers: Headers;
  body?: ArrayBuffer;
}): Promise<{ upstream: Response; resolution: BackendResolution; targetUrl: string }> {
  const resolutions = listBackendOriginsToTry();
  const subPath = input.pathSegments.length > 0 ? `/${input.pathSegments.join('/')}` : '';
  const pathname = `${API_CONTEXT_PATH}${subPath}`;

  if (resolutions.length === 0) {
    throw new Error('Nenhuma origem de backend configurada para o proxy');
  }

  let lastError: unknown;

  for (let index = 0; index < resolutions.length; index += 1) {
    const resolution = resolutions[index];
    const targetUrl = buildBackendTargetUrl(
      resolution.origin,
      input.pathSegments,
      input.search
    );

    logFetchAttempt({
      resolution,
      targetUrl,
      method: input.method,
      pathname,
      search: input.search,
      headers: input.headers,
    });

    try {
      const upstream = await fetch(targetUrl, {
        method: input.method,
        headers: input.headers,
        body: input.body && input.body.byteLength > 0 ? input.body : undefined,
        cache: 'no-store',
      });

      return { upstream, resolution, targetUrl };
    } catch (error) {
      logFetchError(error, {
        resolution,
        targetUrl,
        method: input.method,
        pathname,
        search: input.search,
      });
      lastError = error;

      const hasNext = index < resolutions.length - 1;
      if (!hasNext || !isConnectionError(error)) {
        throw error;
      }

      if (isBackendProxyDebugEnabled()) {
        console.warn(
          `[coordenapleito-api-proxy] Falha de conexão em ${targetUrl}; tentando próxima origem (${index + 2}/${resolutions.length})`
        );
      }
    }
  }

  throw lastError ?? new Error('Falha ao contactar o backend');
}

async function proxy(request: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const headers = forwardRequestHeaders(request);
  const method = request.method.toUpperCase();
  const search = request.nextUrl.search;

  let body: ArrayBuffer | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    body = await request.arrayBuffer();
  }

  try {
    const { upstream } = await fetchBackendWithFallback({
      pathSegments,
      search,
      method,
      headers,
      body,
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: forwardResponseHeaders(upstream),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 502,
        title: 'Serviço indisponível',
        error: 'proxy_fetch_failed',
        userMessage:
          'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente em alguns segundos. Se o problema continuar, o sistema pode estar em atualização.',
      },
      { status: 502 }
    );
  }
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function withPath(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { path } = await context.params;
  return proxy(request, path ?? []);
}

export const GET = withPath;
export const POST = withPath;
export const PUT = withPath;
export const PATCH = withPath;
export const DELETE = withPath;
export const OPTIONS = withPath;
