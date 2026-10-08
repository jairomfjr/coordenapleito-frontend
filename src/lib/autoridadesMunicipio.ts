import type { AutoridadeModelBasico } from '@/types/api';

function normalizarTexto(valor: string): string {
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function cargoEhVicePrefeito(cargoDescricao: string): boolean {
  const cargo = normalizarTexto(cargoDescricao);
  return cargo.includes('vice') && cargo.includes('prefeit');
}

function cargoEhPrefeito(cargoDescricao: string): boolean {
  const cargo = normalizarTexto(cargoDescricao);
  return cargo.includes('prefeit') && !cargoEhVicePrefeito(cargoDescricao);
}

export function getAutoridadesPrincipaisDoMunicipio(
  autoridades: AutoridadeModelBasico[],
  municipioNome: string
): {
  prefeito: AutoridadeModelBasico | null;
  vicePrefeito: AutoridadeModelBasico | null;
} {
  const municipioNorm = normalizarTexto(municipioNome);
  const doMunicipio = autoridades.filter(
    (a) => normalizarTexto(a.municipio?.nome ?? '') === municipioNorm
  );

  const prefeito =
    doMunicipio.find((a) => cargoEhPrefeito(a.cargo?.descricao ?? '')) ?? null;
  const vicePrefeito =
    doMunicipio.find((a) => cargoEhVicePrefeito(a.cargo?.descricao ?? '')) ?? null;

  return { prefeito, vicePrefeito };
}

