import type { RacaCor } from '@/types/api';

export const RACA_COR_LABELS: Record<RacaCor, string> = {
  BRANCA: 'Branca',
  PRETA: 'Preta',
  PARDA: 'Parda',
  AMARELA: 'Amarela',
  INDIGENA: 'Indígena',
};

export const RACA_COR_OPTIONS: { value: RacaCor; label: string }[] = [
  { value: 'BRANCA', label: 'Branca' },
  { value: 'PRETA', label: 'Preta' },
  { value: 'PARDA', label: 'Parda' },
  { value: 'AMARELA', label: 'Amarela' },
  { value: 'INDIGENA', label: 'Indígena' },
];
