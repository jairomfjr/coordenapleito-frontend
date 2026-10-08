import { createElement } from 'react';
import PageLoading from './PageLoading';
import type { PageLoadingVariant } from './types';

export { default as PageLoading } from './PageLoading';
export { resolvePageLoadingVariant } from './resolve-variant';
export type { PageLoadingVariant } from './types';

/** Factory para `loading.tsx` de cada rota (variante fixa). */
export function pageLoadingFor(variant: PageLoadingVariant) {
  return function RouteSegmentLoading() {
    return createElement(PageLoading, { variant });
  };
}

export default PageLoading;
