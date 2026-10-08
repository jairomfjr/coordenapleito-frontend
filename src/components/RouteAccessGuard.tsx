'use client';

import { useLayoutEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { isPublicAppRoute } from '@/lib/public-routes';
import { routerPath } from '@/lib/app-path';
import {
  MENSAGEM_SEM_PERMISSAO_PAGINA,
  rotaInicialParaUsuario,
  rotaNegadaParaUsuario,
} from '@/lib/routePermissions';

/**
 * Bloqueia rotas protegidas por perfil (regras estáticas), exibe toast e redireciona ao início.
 */
export function RouteAccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const acessoNegado = useMemo(() => {
    if (isPublicAppRoute(pathname)) return false;
    if (!user) return false;
    return rotaNegadaParaUsuario(pathname, user);
  }, [pathname, user]);

  useLayoutEffect(() => {
    if (!acessoNegado) return;
    toast.error(MENSAGEM_SEM_PERMISSAO_PAGINA, { toastId: 'acesso-negado-estatico' });
    router.replace(routerPath(rotaInicialParaUsuario(user)));
  }, [acessoNegado, router, user]);

  if (acessoNegado) return null;
  return <>{children}</>;
}
