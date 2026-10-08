'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getApiErrorMessage } from '@/lib/apiError';
import { onlyDigits, formatCpf } from '@/lib/masks';
import styles from '../login.module.css';

interface LoginCardProps {
  /** Nível de acessibilidade (px adicionados ao tamanho da fonte). Ex.: 0, 2, 4 */
  fontSizeLevel?: number;
}

export default function LoginCard({ fontSizeLevel = 0 }: LoginCardProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authLogin(onlyDigits(login), password);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const titleSize = 26 + fontSizeLevel;
  const descSize = 16 + fontSizeLevel;
  const linkSize = 15 + fontSizeLevel;

  return (
    <div className={styles.loginPanelWrapper}>
      <div className={styles.loginCard}>
        <h1
          className={styles.cardTitle}
          style={{ fontSize: `${titleSize}px` }}
        >
          Acesso
        </h1>
        <p
          className={styles.cardDesc}
          style={{ fontSize: `${descSize}px` }}
        >
          Para acessar, utilize as mesmas credenciais de acesso da Secretaria da
          Proteção Social.
        </p>
        <form
          className={styles.loginForm}
          onSubmit={handleSubmit}
        >
          <div className={styles.inputWrap}>
            <label htmlFor="login" className={styles.inputLabel}>
              CPF
            </label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              required
              autoComplete="username"
              className={styles.input}
              maxLength={14}
            />
          </div>
          <div className={styles.inputWrap}>
            <label htmlFor="password" className={styles.inputLabel}>
              Senha
            </label>
            <div className={styles.inputWithIcon}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                required
                autoComplete="current-password"
                data-no-uppercase
                className={styles.input}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {error && <p className={styles.errorMsg}>{error}</p>}
          <p className={styles.recoveryWrap}>
            <Link
              href="/recuperar-senha"
              className={styles.recoveryLink}
              style={{ fontSize: `${linkSize}px` }}
            >
              Gerar nova senha?
            </Link>
          </p>
          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
