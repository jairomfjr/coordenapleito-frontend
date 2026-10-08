/** Detecta Firefox (não inclui outros navegadores Gecko-based embarcados). */
export function isFirefox(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /firefox/i.test(navigator.userAgent);
}
