'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './CustomSelect.module.css';

export interface CustomSelectOption {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  value: string | number | undefined;
  onChange: (value: string | number | undefined) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  'aria-label'?: string;
}

/**
 * Select customizado que sempre abre a lista para baixo (evita abertura
 * para cima dentro de modais).
 */
export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione',
  disabled = false,
  required = false,
  id,
  'aria-label': ariaLabel,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => String(o.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={`${styles.wrapper} ${open ? styles.wrapperOpen : ''} ${disabled ? styles.wrapperDisabled : ''}`}
    >
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        className={styles.trigger}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <span className={selectedOption ? '' : styles.placeholder}>{displayLabel}</span>
        <ChevronDown size={16} className={styles.icon} aria-hidden />
      </button>
      {open && (
        <ul
          className={styles.list}
          role="listbox"
          aria-activedescendant={value != null ? `opt-${value}` : undefined}
        >
          {!required && (
            <li
              id="opt-empty"
              role="option"
              aria-selected={value === undefined || value === ''}
              className={`${styles.option} ${(value === undefined || value === '') ? styles.optionSelected : ''}`}
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
            >
              {placeholder}
            </li>
          )}
          {options.map((opt) => (
            <li
              key={String(opt.value)}
              id={`opt-${opt.value}`}
              role="option"
              aria-selected={String(opt.value) === String(value)}
              className={`${styles.option} ${String(opt.value) === String(value) ? styles.optionSelected : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
