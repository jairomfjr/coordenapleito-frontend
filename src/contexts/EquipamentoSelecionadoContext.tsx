'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { EquipamentoModelBasico } from '@/types/api';
import { setEquipmentContext, getEquipmentContext } from '@/lib/auth';

interface EquipamentoSelecionadoContextValue {
  equipamento: EquipamentoModelBasico | null;
  setEquipamento: (eq: EquipamentoModelBasico | null) => void;
}

const EquipamentoSelecionadoContext = createContext<EquipamentoSelecionadoContextValue | null>(null);

export function EquipamentoSelecionadoProvider({ children }: { children: React.ReactNode }) {
  const [equipamento, setEquipamentoState] = useState<EquipamentoModelBasico | null>(null);

  useEffect(() => {
    const stored = getEquipmentContext();
    if (stored) {
      setEquipamentoState({ id: stored.id, codigo: stored.codigo, nome: stored.nome });
    }
  }, []);

  const setEquipamento = useCallback((eq: EquipamentoModelBasico | null) => {
    setEquipamentoState(eq);
    setEquipmentContext(eq ? { id: eq.id, codigo: eq.codigo, nome: eq.nome } : null);
  }, []);

  return (
    <EquipamentoSelecionadoContext.Provider value={{ equipamento, setEquipamento }}>
      {children}
    </EquipamentoSelecionadoContext.Provider>
  );
}

export function useEquipamentoSelecionado() {
  const ctx = useContext(EquipamentoSelecionadoContext);
  return ctx;
}
