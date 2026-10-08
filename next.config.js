/** Normaliza prefixo de path (basePath / assetPrefix). */
function normalizePathPrefix(value) {
  if (value == null || String(value).trim() === '') return undefined;
  let s = String(value).trim();
  if (!s.startsWith('/')) s = `/${s}`;
  s = s.replace(/\/+$/, '');
  return s === '' ? undefined : s;
}

const basePath = normalizePathPrefix(process.env.NEXT_PUBLIC_BASE_PATH);
const assetPrefix = normalizePathPrefix(process.env.NEXT_PUBLIC_ASSET_PREFIX);

/** Hostnames que acessam `next dev` via proxy (ex.: Nginx → hcoordenapleito.sps.ce.gov.br). */
function getAllowedDevOrigins() {
  const fromEnv = (process.env.ALLOWED_DEV_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromEnv.length > 0) return fromEnv;
  return [
    'localhost',
    '127.0.0.1',
    'hcoordenapleito.sps.ce.gov.br',
    'coordenapleito.sps.ce.gov.br',
  ];
}

/** Headers HTTP recomendados (OWASP) — reduzem clickjacking, MIME sniffing e reforçam HTTPS em produção. */
function getSecurityHeaders() {
  const headers = [
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(self), microphone=(), geolocation=(), interest-cohort=()',
    },
  ];
  if (process.env.NODE_ENV === 'production') {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains; preload',
    });
  }
  return headers;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Isola artefatos do `next dev` para evitar colisão com `.next` de build/start.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  output: 'standalone',
  // Acesso ao `next dev` pelo domínio público (proxy reverso) — evita aviso de cross-origin em /_next/*
  allowedDevOrigins: getAllowedDevOrigins(),
  /**
   * Desativa o Segment Explorer do devtools. Com `true` (padrão no Next 15.5.x), o bundler RSC
   * pode falhar com "SegmentViewNode ... not in the React Client Manifest" e responder 500 em rotas
   * com loading.tsx (ex.: /projetos/casa-cidadao) até limpar `.next`.
   */
  experimental: {
    devtoolSegmentExplorer: false,
  },
  /**
   * Dev e build usam Turbopack (`npm run dev` / `npm run build` com --turbopack).
   * Fallback Webpack: `npm run build:webpack`. O hook abaixo só se aplica a esse fallback.
   */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  /**
   * Em alguns proxies/nginx na VPS a rota `/_next/image` falha (404 ou timeout).
   * Defina NEXT_IMAGE_UNOPTIMIZED=true no build para servir imagens direto de /public.
   */
  images: {
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === 'true',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: getSecurityHeaders(),
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/orgaos-vapt-vupt',
        destination: '/orgao-vapt-vupt',
        permanent: true,
      },
    ];
  },
  /**
   * API em dev: proxy via Route Handler `src/app/coordenapleito-api/[...path]/route.ts`
   * (encaminha Authorization; rewrites do Next podem falhar com Bearer).
   * Produção: Nginx faz o proxy para o Spring.
   */
  async rewrites() {
    return [];
  },
};

if (basePath) {
  nextConfig.basePath = basePath;
}
if (assetPrefix) {
  nextConfig.assetPrefix = assetPrefix;
}

module.exports = nextConfig;
