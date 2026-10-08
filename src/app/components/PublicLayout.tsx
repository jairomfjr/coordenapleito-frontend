'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ShellLayout } from '@/components/ShellLayout';
import { isRelatorioPdfViewerRoute } from '@/lib/relatorioPdfViewerRoute';
import { isMapasPublicoAppRoute, isPublicAppRoute } from '@/lib/public-routes';

function rotaSemAutenticacao(pathname: string | null): boolean {
  return isPublicAppRoute(pathname) || isMapasPublicoAppRoute(pathname);
}

interface Props {
  children: ReactNode;
}

const PublicLayout = ({ children }: Props) => {
  const pathname = usePathname();
  const isPublicPath = rotaSemAutenticacao(pathname);
  const isPdfViewer = isRelatorioPdfViewerRoute(pathname);

  if (isPublicPath || isPdfViewer) {
    return <>{children}</>;
  }

  return <ShellLayout>{children}</ShellLayout>;
};

export default PublicLayout;
