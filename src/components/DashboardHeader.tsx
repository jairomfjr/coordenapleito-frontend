'use client';

import Link from 'next/link';
import { useState } from 'react';
import { KeyRound, SquareArrowOutUpRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AlterarSenhaModal } from '@/components/AlterarSenhaModal';
import styles from '@/app/dashboard/dashboard.module.css';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const [alterarSenhaOpen, setAlterarSenhaOpen] = useState(false);
  const initial = user?.nome?.charAt(0)?.toUpperCase() ?? 'U';
  const role = user?.roles?.[0] ?? 'Usuário';

  return (
    <header className={styles.dashboardHeader}>
      <div className={styles.headerLeft}>
        <Link href="/" className={styles.logoMain}>
          Coordenapleito
        </Link>
        <span className={styles.logoSub}>SPS SECRETARIA DA PROTEÇÃO SOCIAL</span>
      </div>
      <div className={styles.headerRight}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar} aria-hidden>
            {initial}
          </div>
          <div className={styles.userLabels}>
            <span className={styles.userName}>{user?.nome ?? 'Usuário'}</span>
            <span className={styles.userRole}>{role}</span>
          </div>
        </div>
        <button
          type="button"
          className={styles.headerIconBtn}
          onClick={() => setAlterarSenhaOpen(true)}
          title="Alterar senha"
          aria-label="Alterar senha"
        >
          <KeyRound size={22} />
        </button>
        <button
          type="button"
          className={styles.headerIconBtn}
          onClick={logout}
          title="Sair"
          aria-label="Sair"
        >
          <SquareArrowOutUpRight size={22} />
        </button>
      </div>
      {alterarSenhaOpen && user?.codigo && (
        <AlterarSenhaModal
          codigoUsuario={user.codigo}
          onClose={() => setAlterarSenhaOpen(false)}
        />
      )}
    </header>
  );
}
