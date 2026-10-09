'use client';

import { useEffect, useState, type ElementType } from 'react';
import { SidebarNavLink } from '@/components/SidebarNavLink';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Users,
  Shield,
  Key,
  Settings,
  Vote,
  UserCheck,
  FileBarChart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import styles from '@/app/dashboard/dashboard.module.css';
import { userCanSeeMenuHref, usuarioPodeVerMenuInicio } from '@/lib/permissions';

const administracaoChildren: { href: string; label: string; icon: ElementType }[] = [
  { href: '/usuarios', label: 'Usuário', icon: Users },
  { href: '/grupos', label: 'Grupo', icon: Shield },
  { href: '/permissoes', label: 'Permissão', icon: Key },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  allowCollapse?: boolean;
  onToggleCollapse: () => void;
}

function DropdownSection({
  pathname,
  isActive,
  isOpen,
  onToggle,
  label,
  icon: Icon,
  children,
  collapsed,
  childrenLinks,
  onClose,
}: {
  pathname: string;
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
  collapsed: boolean;
  childrenLinks: { href: string; label: string; icon: React.ElementType }[];
  onClose: () => void;
}) {
  if (collapsed) {
    return (
      <>
        {childrenLinks.map(({ href, label: l, icon: Ico }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <SidebarNavLink
              key={href}
              href={href}
              onClick={onClose}
              className={`${styles.sidebarIconLink} ${active ? styles.sidebarIconLinkActive : ''}`}
              title={l}
              aria-label={l}
            >
              <Ico size={24} strokeWidth={1.75} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>{l}</span>
            </SidebarNavLink>
          );
        })}
      </>
    );
  }
  return (
    <div className={styles.sidebarDropdown}>
      <button
        type="button"
        onClick={onToggle}
        className={`${styles.sidebarDropdownHeader} ${isActive ? styles.sidebarDropdownHeaderActive : ''}`}
        aria-expanded={isOpen}
        aria-label={label}
      >
        <Icon size={24} strokeWidth={1.75} className={styles.sidebarIcon} />
        <span className={styles.sidebarLabel}>{label}</span>
        {isOpen ? (
          <ChevronDown size={20} className={styles.sidebarDropdownChevron} />
        ) : (
          <ChevronRight size={20} className={styles.sidebarDropdownChevron} />
        )}
      </button>
      {isOpen && <div className={styles.sidebarDropdownContent}>{children}</div>}
    </div>
  );
}

export function Sidebar({ isOpen, onClose, collapsed, allowCollapse = true, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const administracaoLinks = administracaoChildren.filter((c) => userCanSeeMenuHref(user, c.href));
  const isAdministracaoActive = administracaoLinks.some(
    (c) => pathname === c.href || pathname.startsWith(c.href + '/')
  );
  const [administracaoOpen, setAdministracaoOpen] = useState(isAdministracaoActive);

  useEffect(() => {
    if (isAdministracaoActive) setAdministracaoOpen(true);
  }, [isAdministracaoActive]);

  return (
    <aside
      className={`${styles.dashboardSidebar} ${isOpen ? styles.dashboardSidebarOpen : ''} ${collapsed ? styles.dashboardSidebarCollapsed : ''}`}
      aria-hidden={!isOpen}
    >
      <nav className={styles.sidebarNav} aria-label="Menu principal">
        {usuarioPodeVerMenuInicio(user) && (
          <SidebarNavLink
            href="/"
            onClick={onClose}
            className={`${styles.sidebarIconLink} ${pathname === '/' ? styles.sidebarIconLinkActive : ''}`}
            title="Início"
            aria-label="Início"
          >
            <Home size={24} strokeWidth={1.75} className={styles.sidebarIcon} />
            <span className={styles.sidebarLabel}>Início</span>
          </SidebarNavLink>
        )}

        {userCanSeeMenuHref(user, '/locais-votacao') && (
          <SidebarNavLink
            href="/locais-votacao"
            onClick={onClose}
            className={`${styles.sidebarIconLink} ${pathname === '/locais-votacao' || pathname.startsWith('/locais-votacao/') ? styles.sidebarIconLinkActive : ''}`}
            title="Local de votação"
            aria-label="Local de votação"
          >
            <Vote size={24} strokeWidth={1.75} className={styles.sidebarIcon} />
            <span className={styles.sidebarLabel}>Local de votação</span>
          </SidebarNavLink>
        )}

        {userCanSeeMenuHref(user, '/coordenadores') && (
          <SidebarNavLink
            href="/coordenadores"
            onClick={onClose}
            className={`${styles.sidebarIconLink} ${pathname === '/coordenadores' || pathname.startsWith('/coordenadores/') ? styles.sidebarIconLinkActive : ''}`}
            title="Coordenador"
            aria-label="Coordenador"
          >
            <UserCheck size={24} strokeWidth={1.75} className={styles.sidebarIcon} />
            <span className={styles.sidebarLabel}>Coordenador</span>
          </SidebarNavLink>
        )}

        {userCanSeeMenuHref(user, '/relatorios') && (
          <SidebarNavLink
            href="/relatorios"
            onClick={onClose}
            className={`${styles.sidebarIconLink} ${pathname === '/relatorios' || pathname.startsWith('/relatorios/') ? styles.sidebarIconLinkActive : ''}`}
            title="Relatório"
            aria-label="Relatório"
          >
            <FileBarChart size={24} strokeWidth={1.75} className={styles.sidebarIcon} />
            <span className={styles.sidebarLabel}>Relatório</span>
          </SidebarNavLink>
        )}

        {administracaoLinks.length > 0 && (
          <DropdownSection
            pathname={pathname}
            isActive={isAdministracaoActive}
            isOpen={administracaoOpen}
            onToggle={() => setAdministracaoOpen((o) => !o)}
            label="Administração"
            icon={Settings}
            collapsed={collapsed}
            childrenLinks={administracaoLinks}
            onClose={onClose}
          >
            {administracaoLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <SidebarNavLink
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`${styles.sidebarSubLink} ${isActive ? styles.sidebarIconLinkActive : ''}`}
                  title={label}
                  aria-label={label}
                >
                  <Icon size={20} strokeWidth={1.75} className={styles.sidebarIcon} />
                  <span className={styles.sidebarLabel}>{label}</span>
                </SidebarNavLink>
              );
            })}
          </DropdownSection>
        )}
      </nav>
      {allowCollapse ? (
        <div className={styles.sidebarCollapseFooter}>
          <button
            type="button"
            onClick={onToggleCollapse}
            className={styles.sidebarCollapseBtn}
            title={collapsed ? undefined : 'Recolher menu'}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? (
              <ChevronRight size={22} strokeWidth={1.75} />
            ) : (
              <ChevronLeft size={22} strokeWidth={1.75} />
            )}
          </button>
          {collapsed ? (
            <div className={styles.sidebarCollapseHint} aria-hidden>
              Expandir menu
            </div>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
