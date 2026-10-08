import { resolveApiBaseURLForClient } from '@/lib/apiBaseUrl';
import { getAccessToken } from '@/lib/auth/accessToken';

/** Caminho de foto em endpoint JWT (autoridades, organograma, equipe). */
export function isProtectedApiMediaPath(path: string | null | undefined): boolean {
  if (!path) return false;
  const t = path.trim();
  return t.includes('/foto') && (t.startsWith('/coordenapleito-api') || t.startsWith('http'));
}

/** Separa blob local de caminho API protegida (evita 401 em {@code <img src>} direto). */
export function resolveProtectedMediaSources(
  imageSrc?: string | null,
  mediaPath?: string | null
): { blobSrc: string | null; apiPath: string | null } {
  const path =
    mediaPath?.trim() ||
    (imageSrc && isProtectedApiMediaPath(imageSrc) ? imageSrc.trim() : null);
  const blobSrc =
    imageSrc && !isProtectedApiMediaPath(imageSrc) ? imageSrc : null;
  return { blobSrc, apiPath: path || null };
}

function resolveMediaFetchUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const base = resolveApiBaseURLForClient().replace(/\/$/, '');
  if (path.startsWith('/coordenapleito-api')) {
    return `${base}${path.slice('/coordenapleito-api'.length)}`;
  }
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Baixa mídia protegida (foto) com Bearer e retorna object URL para uso em {@code <img src>} .
 */
export async function fetchAuthenticatedMediaBlobUrl(path: string): Promise<string | null> {
  const token = getAccessToken();
  if (!token || typeof window === 'undefined') {
    return null;
  }

  const response = await fetch(resolveMediaFetchUrl(path), {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'omit',
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const blob = await response.blob();
  if (!blob.size) {
    return null;
  }

  return URL.createObjectURL(blob);
}

export function revokeAuthenticatedMediaBlobUrl(blobUrl: string | null | undefined): void {
  if (blobUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(blobUrl);
  }
}
