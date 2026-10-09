import { onlyDigits } from '@/lib/masks';

export function isCpfValido(value: string): boolean {
  const digitos = onlyDigits(value);
  if (digitos.length !== 11 || new Set(digitos).size === 1) {
    return false;
  }
  const dv = (tamanho: number) => {
    let soma = 0;
    for (let i = 0; i < tamanho; i += 1) {
      soma += Number(digitos[i]) * (tamanho + 1 - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return dv(9) === Number(digitos[9]) && dv(10) === Number(digitos[10]);
}
