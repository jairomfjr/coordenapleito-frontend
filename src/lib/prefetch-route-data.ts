import type { AuthenticationModel } from '@/types/api';

/**
 * Ponto de extensão para antecipar dados da API ao navegar pelo menu.
 * O cadastro atual não tem prefetch de lista.
 */
export async function prefetchRouteData(
  href: string,
  _user?: AuthenticationModel | null
): Promise<void> {
  if (typeof window === 'undefined' || !href || href.startsWith('http')) return;
}
