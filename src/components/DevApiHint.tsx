'use client';

import { useEffect } from 'react';
import { resolveApiBaseURLForClient } from '@/lib/apiBaseUrl';

/**
 * Em desenvolvimento, avisa no console se a API ainda apontar para :8080 (build/cache antigo).
 */
export function DevApiHint() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    const base = resolveApiBaseURLForClient();
    if (base.includes(':8080')) {
      console.error(
        '[Coordenapleito] API incorreta:',
        base,
        '— reinicie com: cd coordenapleito-frontend && rm -rf .next-dev && npm run dev'
      );
      return;
    }
    console.info('[Coordenapleito] API dev:', base);
  }, []);
  return null;
}
