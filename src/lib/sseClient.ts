import { resolveApiBaseURLForClient } from '@/lib/apiBaseUrl';
import { getAccessToken } from '@/lib/auth/accessToken';

type SseEventHandlers = Record<string, () => void>;

function normalizeSsePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function buildSseUrl(path: string): string {
  const base = resolveApiBaseURLForClient().replace(/\/$/, '');
  return `${base}${normalizeSsePath(path)}`;
}

function dispatchSseBlock(block: string, handlers: SseEventHandlers): void {
  if (!block.trim()) {
    return;
  }
  let eventName = 'message';
  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim() || 'message';
    }
  }
  handlers[eventName]?.();
}

/**
 * SSE autenticado via header {@code Authorization: Bearer} (token nunca vai na URL).
 */
export function subscribeAuthenticatedSse(
  path: string,
  handlers: SseEventHandlers
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const token = getAccessToken();
  if (!token) {
    return () => {};
  }

  const controller = new AbortController();
  const url = buildSseUrl(path);

  void (async () => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
        cache: 'no-store',
      });

      if (!response.ok || !response.body) {
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (!controller.signal.aborted) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop() ?? '';
        for (const block of blocks) {
          dispatchSseBlock(block, handlers);
        }
      }

      if (buffer.trim()) {
        dispatchSseBlock(buffer, handlers);
      }
    } catch {
      /* conexão encerrada ou página fechada */
    }
  })();

  return () => controller.abort();
}
