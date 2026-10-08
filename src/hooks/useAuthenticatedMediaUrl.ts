'use client';

import { useEffect, useState } from 'react';
import {
  fetchAuthenticatedMediaBlobUrl,
  revokeAuthenticatedMediaBlobUrl,
} from '@/lib/authenticatedMedia';

/**
 * Carrega URL de mídia autenticada (foto em endpoint protegido) para {@code <img>}.
 */
export function useAuthenticatedMediaUrl(
  path: string | null | undefined,
  enabled = true
): string | null {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !path) {
      setBlobUrl(null);
      return;
    }

    let cancelled = false;
    let currentBlob: string | null = null;

    void fetchAuthenticatedMediaBlobUrl(path).then((url) => {
      if (cancelled) {
        revokeAuthenticatedMediaBlobUrl(url);
        return;
      }
      currentBlob = url;
      setBlobUrl(url);
    });

    return () => {
      cancelled = true;
      revokeAuthenticatedMediaBlobUrl(currentBlob);
    };
  }, [path, enabled]);

  return blobUrl;
}
