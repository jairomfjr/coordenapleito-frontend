import axios, {
  AxiosInstance,
  AxiosError,
  type InternalAxiosRequestConfig,
  AxiosHeaders,
} from 'axios';
import { getAccessToken } from '@/lib/auth/accessToken';
import { resolveApiBaseURLForClient, getSseApiBaseURL } from '@/lib/apiBaseUrl';

export {
  getApiBaseURL,
  getSseApiBaseURL,
  resolveApiBaseURLForClient,
} from '@/lib/apiBaseUrl';

function applyDynamicApiBaseUrl(client: AxiosInstance): void {
  client.interceptors.request.use((config) => {
    config.baseURL = resolveApiBaseURLForClient();
    return config;
  });
}

function attachBearer(config: InternalAxiosRequestConfig, token: string): void {
  const value = `Bearer ${token.trim()}`;
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }
  if (config.headers instanceof AxiosHeaders) {
    config.headers.set('Authorization', value);
  } else {
    (config.headers as Record<string, string>).Authorization = value;
  }
}

export function createApiClient(
  getToken: () => string | null,
  getEquipmentContextId?: () => string | null
): AxiosInstance {
  const client = axios.create({
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false,
  });

  applyDynamicApiBaseUrl(client);

  client.interceptors.request.use((config) => {
    const url = String(config.url ?? '');
    const isPublicAuthCall =
      url.includes('/auth/authenticate') ||
      url.includes('/auth/check_token') ||
      url.includes('/publico/');

    if (!isPublicAuthCall) {
      const token = getToken();
      if (token) {
        attachBearer(config, token);
      }
    }

    const contextId = config.skipEquipmentContext ? null : getEquipmentContextId?.();
    if (contextId) {
      if (config.headers instanceof AxiosHeaders) {
        config.headers.set('X-Equipment-Context-ID', contextId);
      } else {
        (config.headers as Record<string, string>)['X-Equipment-Context-ID'] = contextId;
      }
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => Promise.reject(error)
  );

  return client;
}

export const publicApi = axios.create({
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

applyDynamicApiBaseUrl(publicApi);
