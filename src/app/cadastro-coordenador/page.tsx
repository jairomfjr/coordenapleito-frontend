'use client';

import { useState } from 'react';
import Image from 'next/image';
import PublicHeader from '@/app/login/components/PublicHeader';
import { CadastroCoordenadorPublicoForm } from './CadastroCoordenadorPublicoForm';
import styles from './cadastro-coordenador.module.css';

export default function CadastroCoordenadorPage() {
  const [fontSize, setFontSize] = useState(1);

  return (
    <div className={styles.page} style={{ fontSize: `${fontSize}rem` }}>
      <PublicHeader fontSize={fontSize} onFontSizeChange={setFontSize} />
      <main className={styles.main}>
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
        <section className={styles.card}>
          <h1 className={styles.title}>Cadastro de coordenador</h1>
          <p className={styles.desc}>
            Informe seu CPF. Se ainda não houver cadastro, preencha os dados. Se já existir,
            enviaremos um código ao contato cadastrado para você atualizar suas informações.
          </p>
          <CadastroCoordenadorPublicoForm />
        </section>
      </main>
    </div>
  );
}
