/**
 * Descoberta da origem do Spring Boot para o proxy server-side (`/coordenapleito-api/[...path]`).
 *
 * Prioridade (resolveBackendOrigin / listBackendOriginsToTry):
 * 1. BACKEND_URL
 * 2. COORDENAPLEITO_API_SERVICE_HOST + COORDENAPLEITO_API_SERVICE_PORT
 * 3. DNS curto do cluster: http://coordenapleito-api:8080
 * 4. DNS FQDN: http://coordenapleito-api.<namespace>.svc.cluster.local:8080
 * 5. Domínio externo (Ingress): https://coordenapleito.sps.ce.gov.br
 * 6. localhost:8080 — somente quando NODE_ENV !== 'production'
 */

export const API_CONTEXT_PATH = '/coordenapleito-api';

export const DEFAULT_K8S_NAMESPACE = 'coordenapleito';
export const DEFAULT_K8S_SERVICE_NAME = 'coordenapleito-api';
export const DEFAULT_K8S_SERVICE_PORT = '8080';
export const DEFAULT_PUBLIC_ORIGIN = 'https://coordenapleito.sps.ce.gov.br';
export const DEFAULT_LOCAL_ORIGIN = 'http://localhost:8080';

export type BackendResolutionStrategy =
  | 'BACKEND_URL'
  | 'KUBERNETES_SERVICE'
  | 'KUBERNETES_SHORT_DNS'
  | 'KUBERNETES_FQDN_DNS'
  | 'PUBLIC_INGRESS'
  | 'LOCALHOST';

export type BackendEnv = {
  BACKEND_URL?: string;
  COORDENAPLEITO_API_SERVICE_HOST?: string;
  COORDENAPLEITO_API_SERVICE_PORT?: string;
  COORDENAPLEITO_API_PORT?: string;
  COORDENAPLEITO_API_PORT_8080_TCP_PORT?: string;
  POD_NAMESPACE?: string;
  KUBERNETES_SERVICE_HOST?: string;
  COORDENAPLEITO_PUBLIC_ORIGIN?: string;
  NEXT_PUBLIC_APP_ORIGIN?: string;
  NODE_ENV?: string;
  /** `true` ou `1` — habilita logs verbosos do proxy (subida + cada requisição). */
  COORDENAPLEITO_BACKEND_PROXY_DEBUG?: string;
};

export type BackendResolution = {
  origin: string;
  strategy: BackendResolutionStrategy;
};

export type BackendEnvSnapshot = {
  BACKEND_URL?: string;
  POD_NAMESPACE?: string;
  COORDENAPLEITO_API_SERVICE_HOST?: string;
  COORDENAPLEITO_API_SERVICE_PORT?: string;
  KUBERNETES_SERVICE_HOST?: string;
  NODE_ENV?: string;
  COORDENAPLEITO_PUBLIC_ORIGIN?: string;
};

const STRATEGY_LABELS: Record<BackendResolutionStrategy, string> = {
  BACKEND_URL: 'BACKEND_URL',
  KUBERNETES_SERVICE: 'Kubernetes Service',
  KUBERNETES_SHORT_DNS: 'Kubernetes short DNS',
  KUBERNETES_FQDN_DNS: 'Kubernetes FQDN DNS',
  PUBLIC_INGRESS: 'public Ingress origin',
  LOCALHOST: 'localhost fallback',
};

export function trimOrigin(url: string): string {
  return url.replace(/\/$/, '');
}

/** Remove context-path duplicado se BACKEND_URL já incluir /coordenapleito-api. */
export function normalizeBackendOrigin(url: string): string {
  const trimmed = trimOrigin(url);
  const suffix = API_CONTEXT_PATH;
  if (trimmed.endsWith(suffix)) {
    return trimmed.slice(0, -suffix.length) || trimmed;
  }
  return trimmed;
}

export function readBackendEnv(
  env: NodeJS.ProcessEnv = process.env
): BackendEnv {
  return {
    BACKEND_URL: env.BACKEND_URL,
    COORDENAPLEITO_API_SERVICE_HOST: env.COORDENAPLEITO_API_SERVICE_HOST,
    COORDENAPLEITO_API_SERVICE_PORT: env.COORDENAPLEITO_API_SERVICE_PORT,
    COORDENAPLEITO_API_PORT: env.COORDENAPLEITO_API_PORT,
    COORDENAPLEITO_API_PORT_8080_TCP_PORT: env.COORDENAPLEITO_API_PORT_8080_TCP_PORT,
    POD_NAMESPACE: env.POD_NAMESPACE,
    KUBERNETES_SERVICE_HOST: env.KUBERNETES_SERVICE_HOST,
    COORDENAPLEITO_PUBLIC_ORIGIN: env.COORDENAPLEITO_PUBLIC_ORIGIN,
    NEXT_PUBLIC_APP_ORIGIN: env.NEXT_PUBLIC_APP_ORIGIN,
    NODE_ENV: env.NODE_ENV,
    COORDENAPLEITO_BACKEND_PROXY_DEBUG: env.COORDENAPLEITO_BACKEND_PROXY_DEBUG,
  };
}

/** Logs do proxy desligados por padrão; ativar com COORDENAPLEITO_BACKEND_PROXY_DEBUG=true */
export function isBackendProxyDebugEnabled(
  env: BackendEnv = readBackendEnv()
): boolean {
  const raw = env.COORDENAPLEITO_BACKEND_PROXY_DEBUG?.trim().toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'yes';
}

export function getBackendEnvSnapshot(
  env: BackendEnv = readBackendEnv()
): BackendEnvSnapshot {
  return {
    BACKEND_URL: env.BACKEND_URL,
    POD_NAMESPACE: env.POD_NAMESPACE,
    COORDENAPLEITO_API_SERVICE_HOST: env.COORDENAPLEITO_API_SERVICE_HOST,
    COORDENAPLEITO_API_SERVICE_PORT: env.COORDENAPLEITO_API_SERVICE_PORT,
    KUBERNETES_SERVICE_HOST: env.KUBERNETES_SERVICE_HOST,
    NODE_ENV: env.NODE_ENV,
    COORDENAPLEITO_PUBLIC_ORIGIN: env.COORDENAPLEITO_PUBLIC_ORIGIN,
  };
}

function isProduction(env: BackendEnv): boolean {
  return env.NODE_ENV === 'production';
}

function isKubernetes(env: BackendEnv): boolean {
  return Boolean(env.KUBERNETES_SERVICE_HOST?.trim());
}

function resolveKubernetesServicePort(env: BackendEnv): string {
  return (
    env.COORDENAPLEITO_API_SERVICE_PORT?.trim() ||
    env.COORDENAPLEITO_API_PORT?.trim() ||
    env.COORDENAPLEITO_API_PORT_8080_TCP_PORT?.trim() ||
    DEFAULT_K8S_SERVICE_PORT
  );
}

function resolvePublicIngressOrigin(env: BackendEnv): string {
  const configured =
    env.COORDENAPLEITO_PUBLIC_ORIGIN?.trim() || env.NEXT_PUBLIC_APP_ORIGIN?.trim();
  return normalizeBackendOrigin(configured || DEFAULT_PUBLIC_ORIGIN);
}

function pushResolution(
  list: BackendResolution[],
  seen: Set<string>,
  candidate?: BackendResolution
): void {
  if (!candidate?.origin) {
    return;
  }
  const origin = normalizeBackendOrigin(candidate.origin);
  if (seen.has(origin)) {
    return;
  }
  seen.add(origin);
  list.push({ ...candidate, origin });
}

/** Cadeia completa de origens a tentar no proxy (sem localhost em produção). */
export function listBackendOriginsFromEnv(env: BackendEnv): BackendResolution[] {
  const resolutions: BackendResolution[] = [];
  const seen = new Set<string>();
  const inKubernetes = isKubernetes(env);
  const namespace = env.POD_NAMESPACE?.trim() || DEFAULT_K8S_NAMESPACE;
  const k8sPort = resolveKubernetesServicePort(env);

  const backendUrl = env.BACKEND_URL?.trim();
  if (backendUrl) {
    pushResolution(resolutions, seen, {
      origin: backendUrl,
      strategy: 'BACKEND_URL',
    });
  }

  const k8sHost = env.COORDENAPLEITO_API_SERVICE_HOST?.trim();
  if (k8sHost) {
    pushResolution(resolutions, seen, {
      origin: `http://${k8sHost}:${k8sPort}`,
      strategy: 'KUBERNETES_SERVICE',
    });
  }

  if (inKubernetes) {
    pushResolution(resolutions, seen, {
      origin: `http://${DEFAULT_K8S_SERVICE_NAME}:${k8sPort}`,
      strategy: 'KUBERNETES_SHORT_DNS',
    });

    pushResolution(resolutions, seen, {
      origin: `http://${DEFAULT_K8S_SERVICE_NAME}.${namespace}.svc.cluster.local:${k8sPort}`,
      strategy: 'KUBERNETES_FQDN_DNS',
    });
  }

  if (inKubernetes || isProduction(env)) {
    pushResolution(resolutions, seen, {
      origin: resolvePublicIngressOrigin(env),
      strategy: 'PUBLIC_INGRESS',
    });
  }

  if (!isProduction(env)) {
    pushResolution(resolutions, seen, {
      origin: DEFAULT_LOCAL_ORIGIN,
      strategy: 'LOCALHOST',
    });
  }

  return resolutions;
}

/** Origem primária conforme prioridade definida. */
export function resolveBackendFromEnv(env: BackendEnv): BackendResolution {
  const resolutions = listBackendOriginsFromEnv(env);
  if (resolutions.length === 0) {
    if (isProduction(env)) {
      return {
        origin: resolvePublicIngressOrigin(env),
        strategy: 'PUBLIC_INGRESS',
      };
    }
    return {
      origin: DEFAULT_LOCAL_ORIGIN,
      strategy: 'LOCALHOST',
    };
  }
  return resolutions[0];
}

export function listBackendOriginsToTry(): BackendResolution[] {
  return listBackendOriginsFromEnv(readBackendEnv());
}

export function resolveBackendOrigin(): string {
  return resolveBackendFromEnv(readBackendEnv()).origin;
}

export function strategyLabel(strategy: BackendResolutionStrategy): string {
  return STRATEGY_LABELS[strategy];
}

export function buildBackendTargetUrl(
  origin: string,
  pathSegments: string[],
  search: string,
  apiPrefix = API_CONTEXT_PATH
): string {
  const subPath = pathSegments.length > 0 ? `/${pathSegments.join('/')}` : '';
  return `${normalizeBackendOrigin(origin)}${apiPrefix}${subPath}${search}`;
}

export function parseTargetUrl(targetUrl: string): {
  host: string;
  port: string;
  pathname: string;
} {
  try {
    const url = new URL(targetUrl);
    return {
      host: url.hostname,
      port: url.port || (url.protocol === 'https:' ? '443' : '80'),
      pathname: url.pathname,
    };
  } catch {
    return { host: '', port: '', pathname: targetUrl };
  }
}

export function summarizeRequestHeaders(headers: Headers): Record<string, string> {
  const keys = ['authorization', 'content-type', 'accept', 'x-equipment-context-id'];
  const summary: Record<string, string> = {};
  for (const key of keys) {
    const value = headers.get(key);
    if (!value) {
      continue;
    }
    if (key === 'authorization') {
      summary[key] = value.startsWith('Bearer ') ? 'Bearer ***' : '***';
      continue;
    }
    summary[key] = value;
  }
  return summary;
}

export function logFetchAttempt(input: {
  resolution: BackendResolution;
  targetUrl: string;
  method: string;
  pathname: string;
  search: string;
  headers: Headers;
  env?: BackendEnv;
}): void {
  const env = input.env ?? readBackendEnv();
  if (!isBackendProxyDebugEnabled(env)) {
    return;
  }

  const parsed = parseTargetUrl(input.targetUrl);
  console.log({
    event: 'coordenapleito-api-proxy-fetch',
    backendOrigin: input.resolution.origin,
    strategy: input.resolution.strategy,
    strategyLabel: strategyLabel(input.resolution.strategy),
    targetUrl: input.targetUrl,
    method: input.method,
    pathname: input.pathname,
    search: input.search,
    host: parsed.host,
    port: parsed.port,
    headers: summarizeRequestHeaders(input.headers),
    env: getBackendEnvSnapshot(env),
  });
}

export function logFetchError(
  error: unknown,
  input: {
    resolution: BackendResolution;
    targetUrl: string;
    method: string;
    pathname: string;
    search: string;
    env?: BackendEnv;
  }
): void {
  const parsed = parseTargetUrl(input.targetUrl);
  const cause =
    error instanceof Error && 'cause' in error ? (error as Error).cause : undefined;
  const causeCode =
    cause && typeof cause === 'object' && cause !== null && 'code' in cause
      ? String((cause as { code?: unknown }).code ?? '')
      : undefined;

  console.error({
    event: 'coordenapleito-api-proxy-fetch-error',
    backendOrigin: input.resolution.origin,
    strategy: input.resolution.strategy,
    targetUrl: input.targetUrl,
    method: input.method,
    pathname: input.pathname,
    search: input.search,
    host: parsed.host,
    port: parsed.port,
    message: error instanceof Error ? error.message : String(error),
    code: causeCode,
    cause,
    stack: error instanceof Error ? error.stack : undefined,
    env: getBackendEnvSnapshot(input.env ?? readBackendEnv()),
  });
}

let startupLogged = false;

/** Validação de inicialização — chamada via instrumentation.ts na subida do Next.js. */
export function logBackendStartup(env: BackendEnv = readBackendEnv()): void {
  if (startupLogged || !isBackendProxyDebugEnabled(env)) {
    return;
  }
  startupLogged = true;

  const primary = resolveBackendFromEnv(env);
  const chain = listBackendOriginsFromEnv(env);

  console.info(
    `[backend-origin] Using backend from ${strategyLabel(primary.strategy)}: ${primary.origin}`
  );
  console.info(
    `[backend-origin] Proxy fallback chain: ${chain
      .map((item) => `${strategyLabel(item.strategy)}=${item.origin}`)
      .join(' → ')}`
  );
  console.info('[backend-origin] Environment snapshot:', getBackendEnvSnapshot(env));
}
