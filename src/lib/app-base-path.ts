/** Prefixo de rotas do Next (`NEXT_PUBLIC_BASE_PATH`), ex.: `/coordenapleito`. */
export function getAppBasePath(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH;
  if (!raw || raw.trim() === '') {
    return '';
  }
  let path = raw.trim();
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  return path.replace(/\/+$/, '');
}
