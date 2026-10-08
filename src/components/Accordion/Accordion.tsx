'use client';

import { createContext, useContext, useEffect, useId, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import styles from './Accordion.module.css';

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  /** Modo controlado: quando informado, o estado interno não é utilizado. */
  isOpen?: boolean;
  /** Callback de alternância (modo controlado ou não controlado). */
  onToggle?: (open: boolean) => void;
  /** 0 = raiz (ex.: Ano), 1 = primeiro nível (ex.: Período), 2 = segundo nível (ex.: Coordenação). */
  level?: 0 | 1 | 2;
}

const ROOT_GROUP = '__accordion_root__';
const ParentAccordionContext = createContext<string>(ROOT_GROUP);
const listenersByGroup = new Map<string, Set<(openedId: string) => void>>();

function subscribe(group: string, listener: (openedId: string) => void) {
  const set = listenersByGroup.get(group) ?? new Set();
  set.add(listener);
  listenersByGroup.set(group, set);
  return () => {
    const current = listenersByGroup.get(group);
    if (!current) return;
    current.delete(listener);
    if (current.size === 0) listenersByGroup.delete(group);
  };
}

function notifyOpened(group: string, openedId: string) {
  const set = listenersByGroup.get(group);
  if (!set) return;
  for (const listener of set) {
    listener(openedId);
  }
}

export function Accordion({
  title,
  children,
  defaultOpen = false,
  isOpen,
  onToggle,
  level = 0,
}: AccordionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const accordionId = useId();
  const parentAccordionId = useContext(ParentAccordionContext);
  const controlled = typeof isOpen === 'boolean';
  const open = controlled ? (isOpen as boolean) : internalOpen;
  const isNested = level >= 1;
  const siblingGroup = `${parentAccordionId}|${level}`;

  useEffect(() => {
    return subscribe(siblingGroup, (openedId) => {
      if (openedId === accordionId || !open) return;
      if (controlled) {
        onToggle?.(false);
        return;
      }
      setInternalOpen(false);
    });
  }, [accordionId, controlled, onToggle, open, siblingGroup]);

  /** Garante exclusividade também para aberturas iniciais (defaultOpen/isOpen). */
  useEffect(() => {
    if (!open) return;
    notifyOpened(siblingGroup, accordionId);
  }, [accordionId, open, siblingGroup]);

  const handleToggle = () => {
    const next = !open;
    if (!controlled) {
      setInternalOpen(next);
    }
    onToggle?.(next);
  };

  return (
    <ParentAccordionContext.Provider value={accordionId}>
      <div
        className={`${styles.accordion} ${isNested ? styles.accordionNested : ''}`}
        data-accordion-level={level}
      >
        <button
          type="button"
          onClick={handleToggle}
          className={styles.trigger}
          aria-expanded={open}
        >
          {open ? (
            <ChevronDown size={20} className={styles.icon} aria-hidden />
          ) : (
            <ChevronRight size={20} className={styles.icon} aria-hidden />
          )}
          <span className={styles.title}>{title}</span>
        </button>
        {open && <div className={styles.content}>{children}</div>}
      </div>
    </ParentAccordionContext.Provider>
  );
}
