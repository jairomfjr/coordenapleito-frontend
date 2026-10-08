'use client';

import { User } from 'lucide-react';
import styles from './FuncionarioAvatar.module.css';

export type FuncionarioAvatarSize = 'sm' | 'md' | 'lg';

export interface FuncionarioAvatarProps {
  size?: FuncionarioAvatarSize;
  className?: string;
  /** Para acessibilidade quando não há foto */
  label?: string;
}

const sizeClass: Record<FuncionarioAvatarSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

/**
 * Avatar padrão (silhueta) quando o funcionário não tem foto.
 */
export function FuncionarioAvatar({ size = 'md', className, label = 'Sem foto' }: FuncionarioAvatarProps) {
  return (
    <div
      className={`${styles.avatar} ${sizeClass[size]} ${className ?? ''}`}
      role="img"
      aria-label={label}
    >
      <User className={styles.icon} strokeWidth={1.85} aria-hidden />
    </div>
  );
}
