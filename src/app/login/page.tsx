'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { consumePostLoginNavigationPending } from '@/lib/postLoginNav';
import { routerPath } from '@/lib/app-path';
import { getUserPermissoes } from '@/lib/permissions';
import { rotaInicialParaUsuario } from '@/lib/routePermissions';
import PublicHeader from './components/PublicHeader';
import LoginCard from './components/LoginCard';
import styles from './login.module.css';

export default function LoginPage() {
  const [fontSize, setFontSize] = useState(1);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return;
    // AuthContext já navegou após login — não sobrescrever com /
    if (consumePostLoginNavigationPending()) {
      return;
    }
    router.replace(routerPath(rotaInicialParaUsuario(user)));
  }, [isAuthenticated, router, user]);

  if (isAuthenticated) {
    const semPermissoes = getUserPermissoes(user).length === 0;
    return (
      <div className={styles.loginPage} style={{ fontSize: `${fontSize}rem`, padding: '2rem' }}>
        <p className={styles.errorMsg}>
          {semPermissoes
            ? 'Login aceito, mas seu perfil não tem permissões no sistema. Peça ao administrador para vincular o grupo Analista (ou execute o script de bootstrap no banco).'
            : 'Redirecionando…'}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.loginPage} style={{ fontSize: `${fontSize}rem` }}>
      <PublicHeader fontSize={fontSize} onFontSizeChange={setFontSize} />

      <main className={styles.mainArea}>
        <div className={styles.backgroundImage}>
          <Image
            src="/backgroundequipamentos.png"
            alt=""
            fill
            priority
            unoptimized
            className={styles.bgImg}
            sizes="100vw"
          />
        </div>

        <div className={styles.contentRow}>
          <div className={styles.equipamentosSection}>
            <div className={styles.systemLogoWrap}>
              <Image
                src="/logoEquipamentos.png"
                alt="Coordenapleito"
                width={520}
                height={195}
                priority
                unoptimized
                className={styles.systemLogo}
              />
            </div>
          </div>
          <div className={styles.cardSection}>
            <LoginCard fontSizeLevel={Math.round((fontSize - 1) * 10)} />
          </div>
        </div>
      </main>
    </div>
  );
}
