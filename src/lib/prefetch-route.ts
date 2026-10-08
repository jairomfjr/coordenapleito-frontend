import type { AuthenticationModel } from '@/types/api';
import { prefetchRouteData } from '@/lib/prefetch-route-data';

type AppRouterLike = {
  prefetch: (href: string) => void;
};

const prefetchedRoutes = new Set<string>();

/**
 * Antecipa rota Next.js e cache React Query (hover, foco ou clique no menu).
 */
export function prefetchAppRoute(
  router: AppRouterLike,
  href: string,
  user?: AuthenticationModel | null
): void {
  if (typeof window === 'undefined' || !href || href.startsWith('http')) return;
  const path = href.split('?')[0];
  if (!prefetchedRoutes.has(path)) {
    prefetchedRoutes.add(path);
    try {
      router.prefetch(path);
    } catch {
      /* prefetch opcional */
    }
  }
  void prefetchRouteData(path, user);
}
