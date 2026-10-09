'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usuariosService } from '@/services/usuarios';
import PublicHeader from '@/app/login/components/PublicHeader';
import { formatCpf, onlyDigits } from '@/lib/masks';
import styles from '@/app/login/login.module.css';

export default function RecuperarSenhaPage() {
  const [fontSize, setFontSize] = useState(1);
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      await usuariosService.recuperarSenha({
        cpf: onlyDigits(cpf),
        email: email.trim(),
      });
      setSuccess(true);
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string }; status?: number } })?.response;
      const msg = res?.data?.message;
      if (res?.status === 404 || res?.status === 400) {
        setError(msg || 'CPF e/ou e-mail não encontrados. Verifique os dados e tente novamente.');
      } else {
        setError(msg || 'Não foi possível solicitar a recuperação. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  }

  const titleSize = 26;
  const descSize = 16;
  const linkSize = 15;

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
            className={styles.bgImg}
            sizes="100vw"
          />
        </div>

        <div className={styles.contentRow}>
          <div className={styles.equipamentosSection} />
          <div className={styles.cardSection}>
            <div className={styles.loginPanelWrapper}>
              <div className={styles.loginCard}>
                <h1
                  className={styles.cardTitle}
                  style={{ fontSize: `${titleSize}px` }}
                >
                  Recuperar senha
                </h1>
                <p
                  className={styles.cardDesc}
                  style={{ fontSize: `${descSize}px` }}
                >
                  Informe seu CPF e e-mail cadastrado. Enviaremos uma nova senha por e-mail.
                </p>

                {success ? (
                  <>
                    <p
                      className={styles.cardDesc}
                      style={{
                        fontSize: `${descSize}px`,
                        color: 'var(--success, #15803d)',
                        marginBottom: '1rem',
                      }}
                    >
                      Solicitação enviada. Verifique seu e-mail para obter a nova senha.
                    </p>
                    <Link
                      href="/login"
                      className={styles.submitBtn}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        textDecoration: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      Voltar ao login
                    </Link>
                  </>
                ) : (
                  <form onSubmit={handleSubmit} className={styles.loginForm}>
                    <div className={styles.inputWrap}>
                      <label htmlFor="cpf" className={styles.inputLabel}>
                        CPF
                      </label>
                      <input
                        id="cpf"
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(formatCpf(e.target.value))}
                        placeholder="000.000.000-00"
                        required
                        maxLength={14}
                        className={styles.input}
                        autoComplete="username"
                      />
                    </div>
                    <div className={styles.inputWrap}>
                      <label htmlFor="email" className={styles.inputLabel}>
                        E-mail
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className={styles.input}
                      />
                    </div>
                    {error && <p className={styles.errorMsg}>{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className={styles.submitBtn}
                    >
                      {loading ? 'Enviando...' : 'Enviar solicitação'}
                    </button>
                  </form>
                )}

                <p className={styles.recoveryWrap} style={{ fontSize: `${linkSize}px` }}>
                  <Link href="/login" className={styles.recoveryLink}>
                    Voltar ao login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
