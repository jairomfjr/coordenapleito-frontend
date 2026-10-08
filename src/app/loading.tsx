'use client';

import { usePathname } from 'next/navigation';
import PageLoading from '@/components/page-loading/PageLoading';
import { resolvePageLoadingVariant } from '@/components/page-loading/resolve-variant';

/**
 * Único loading de rota (Suspense do App Router) — modal {@link PageLoading}.
 * Páginas são `'use client'` com fetch próprio; não há `loading.tsx` por segmento
 * para evitar modal duplicado (boundary aninhado + estado interno da página).
 */
export default function AppLoading() {
  const pathname = usePathname();
  const variant = resolvePageLoadingVariant(pathname ?? '/');
  return <PageLoading variant={variant} />;
}
