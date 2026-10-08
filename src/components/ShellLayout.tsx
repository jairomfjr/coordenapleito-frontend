'use client';

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { EquipamentoSelecionadoProvider } from '@/contexts/EquipamentoSelecionadoContext';
import { DashboardHeader } from './DashboardHeader';
import { RouteAccessGuard } from './RouteAccessGuard';
import { Sidebar } from './Sidebar';
import { isPublicAppRoute } from '@/lib/public-routes';
import styles from '@/app/dashboard/dashboard.module.css';

/** Larguras do sidebar (px) – devem bater com dashboard.module.css */
const SIDEBAR_WIDTH_EXPANDED = 260;
const SIDEBAR_WIDTH_COLLAPSED = 72;

const DESKTOP_BREAKPOINT = 1024;

export function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const applyBreakpoint = () => {
      const desktop = mq.matches;
      setIsDesktop(desktop);
      if (!desktop) {
        setSidebarOpen(false);
        setSidebarCollapsed(false);
      }
    };
    applyBreakpoint();
    mq.addEventListener('change', applyBreakpoint);
    return () => mq.removeEventListener('change', applyBreakpoint);
  }, []);

  const isPublic = isPublicAppRoute(pathname);

  /** Rotas que iniciam com menu recolhido, mas permitem expansão manual pelo usuário. */
  const autoCollapseSidebar =
    pathname === '/' ||
    pathname === '/dashboard' ||
    pathname === '/dashboard-projetos' ||
    pathname.startsWith('/dashboard-projetos/') ||
    pathname === '/dashboard-programas-sociais' ||
    pathname.startsWith('/dashboard-programas-sociais/') ||
    pathname === '/dashboard/qualificacao' ||
    pathname.startsWith('/dashboard/qualificacao/') ||
    pathname === '/mapa-social';
  const forceSidebarCollapsed = false;

  /** Recolher faixa 72px só no desktop; em mobile/tablet o menu é overlay cheio ou fechado. */
  useEffect(() => {
    if (!isDesktop) {
      setSidebarCollapsed(false);
      return;
    }
    if (autoCollapseSidebar) {
      setSidebarCollapsed(true);
    }
  }, [pathname, autoCollapseSidebar, isDesktop]);

  const sidebarCollapsedEffective =
    isDesktop && (forceSidebarCollapsed ? true : sidebarCollapsed);

  /**
   * Largura reservada no main: desktop 260/72; mobile sempre 0 (sidebar em overlay fixo).
   */
  const sidebarWidth = isDesktop
    ? sidebarCollapsedEffective
      ? SIDEBAR_WIDTH_COLLAPSED
      : SIDEBAR_WIDTH_EXPANDED
    : 0;

  const openMobileSidebar = () => {
    setSidebarOpen(true);
    setSidebarCollapsed(false);
  };

  const showMobileMenuButton = !isDesktop && !sidebarOpen;

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          color: '#6b7280',
        }}
      >
        Carregando...
      </div>
    );
  }

  if (isPublic || !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className={styles.shellLayout}>
      <EquipamentoSelecionadoProvider>
        <DashboardHeader />
        <div className={styles.shellBody}>
        {showMobileMenuButton && (
          <button
            type="button"
            className={styles.sidebarToggleBtn}
            onClick={openMobileSidebar}
            aria-label="Abrir menu"
            aria-expanded={sidebarOpen}
          >
            <Menu size={22} strokeWidth={1.75} aria-hidden />
          </button>
        )}
        <div
          className={`${styles.sidebarOverlay} ${sidebarOpen && !isDesktop ? styles.sidebarOverlayVisible : ''}`}
          aria-hidden={!sidebarOpen || isDesktop}
          onClick={() => setSidebarOpen(false)}
        />
        <Sidebar
          isOpen={isDesktop || sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsedEffective}
          allowCollapse={isDesktop}
          onToggleCollapse={forceSidebarCollapsed ? () => {} : () => setSidebarCollapsed((c) => !c)}
        />
        <main className={styles.dashboardMain} style={{ marginLeft: sidebarWidth }}>
          <RouteAccessGuard>{children}</RouteAccessGuard>
        </main>
      </div>
      </EquipamentoSelecionadoProvider>
    </div>
  );
}
