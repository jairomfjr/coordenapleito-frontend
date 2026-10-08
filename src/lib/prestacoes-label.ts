/** Rótulo após a quantidade: "1 prestação" vs "0 prestações", "2 prestações", … */
export function labelPrestacoesAposQuantidade(quantidade: number): 'prestação' | 'prestações' {
  return quantidade === 1 ? 'prestação' : 'prestações';
}
