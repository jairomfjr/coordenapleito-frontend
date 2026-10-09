export const COR_VINCULO = '#e31c23';
export const COR_VAGA = '#f5c542';
export const COR_ESGOTADO = '#9b111e';
export const COR_NEUTRO = '#e8d4d4';
export const COR_EIXO = '#94a3b8';
export const PALETA = ['#e31c23', '#9b111e', '#c4181f', '#f5c542', '#d4a017', '#7a0d18', '#ef4444', '#b45309'];

export const tooltipStyle = {
  border: '1px solid #efe6e5',
  borderRadius: 12,
  fontSize: 12,
  fontFamily: 'Kanit, sans-serif',
  boxShadow: '0 12px 28px rgba(155, 17, 30, 0.1)',
  background: '#fff',
};

export function fmt(n: number) {
  return n.toLocaleString('pt-BR');
}

export function rotuloLocal(zona: number, nome: string) {
  return `Z${zona} · ${nome}`;
}
