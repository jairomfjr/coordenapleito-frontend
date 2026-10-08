'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, type ComponentProps, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { prefetchAppRoute } from '@/lib/prefetch-route';

type Props = Omit<ComponentProps<typeof Link>, 'prefetch'> & {
  children: ReactNode;
};

/**
 * Link do menu: prefetch da rota, chunks pesados e cache da API (hover, foco, pointer down e clique).
 */
export function SidebarNavLink({ href, onMouseEnter, onFocus, onPointerDown, onClick, ...rest }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const path = typeof href === 'string' ? href : href.pathname ?? '';

  const warmRoute = useCallback(() => {
    if (path) prefetchAppRoute(router, path, user);
  }, [router, path, user]);

  const handlePointerDown = (e: PointerEvent<HTMLAnchorElement>) => {
    warmRoute();
    onPointerDown?.(e);
  };

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    warmRoute();
    onClick?.(e);
  };

  return (
    <Link
      href={href}
      prefetch={true}
      onPointerDown={handlePointerDown}
      onMouseEnter={(e) => {
        warmRoute();
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        warmRoute();
        onFocus?.(e);
      }}
      onClick={handleClick}
      {...rest}
    />
  );
}
