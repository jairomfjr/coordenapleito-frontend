# Coordenapleito Frontend

Frontend do sistema Coordenapleito, desenvolvido com **React**, **Next.js** e **TypeScript**, consumindo a [coordenapleito-api](../coordenapleito-api).

## O que é o projeto

Aplicação web do Coordenapleito para gestão de equipamentos, usuários, permissões, cadastros territoriais e visualização em mapa.  
Implementa autenticação com JWT, telas administrativas e integração com os endpoints da API.

## Tecnologias empregadas

- React 18
- Next.js 15 (App Router, **Turbopack** em dev e build)
- TypeScript
- Axios
- React Toastify
- Leaflet / React Leaflet (mapas)
- CSS Modules

## Pré-requisitos

- Node.js 18+
- npm ou yarn

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Copie o arquivo de ambiente e ajuste a URL da API se necessário:

```bash
cp .env.example .env
```

No `.env`, defina:

- `NEXT_PUBLIC_API_URL`: URL base da API (ex: `http://localhost:8080/coordenapleito-api`)

### Deploy em VPS / proxy reverso

Se a página de login (logos e fundo em `/public`) não aparecer como no ambiente local:

1. **`/_next/image` bloqueado ou com erro** — As imagens da **tela de login** usam `unoptimized` e são servidas direto de `/public` (ex.: `/logoEquipamentos.png`), sem passar pelo otimizador. Para o restante do app, na build use `NEXT_IMAGE_UNOPTIMIZED=true` se ainda houver 404 em `/_next/image`.

2. **App servido em subpath** (ex.: `https://dominio.gov.br/coordenapleito`) — Defina no **build**:
   - `NEXT_PUBLIC_BASE_PATH=/coordenapleito` (sem barra no final). O Next passa a prefixar rotas e arquivos estáticos corretamente.

3. **Proxy (nginx)** — Garanta que `location` encaminhe também `/_next/static` e arquivos da raiz do app para o mesmo upstream do Node (porta 3000), ou use `assetPrefix` se os estáticos forem servidos por outro host/CDN (`NEXT_PUBLIC_ASSET_PREFIX`).

## Execução

- Desenvolvimento (Turbopack — compilação e HMR mais rápidos):

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

- Build e produção (Turbopack; na VPS use o mesmo `npm run build` no deploy):

```bash
npm run build
npm start
# ou, com output standalone: npm run start:standalone
```

- Fallback build com Webpack (se houver incompatibilidade): `npm run build:webpack`

## Estrutura do projeto

```
coordenapleito-frontend/
├── src/
│   ├── app/                    # App Router (Next.js)
│   │   ├── login/              # Página de login
│   │   ├── usuarios/           # Listagem de usuários
│   │   ├── grupos/             # Grupos
│   │   ├── permissoes/         # Permissões
│   │   ├── estados/             # Estados
│   │   ├── municipios/         # Municípios (por estado)
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Home (módulos)
│   │   └── globals.css
│   ├── components/             # Componentes reutilizáveis
│   ├── contexts/               # AuthContext (login/logout, token)
│   ├── lib/                    # Cliente API e auth (axios, token)
│   ├── services/               # Serviços por recurso (usuarios, grupos, etc.)
│   └── types/                  # Tipos TypeScript (DTOs/Inputs da API)
├── .env.example
├── next.config.js
├── package.json
└── tsconfig.json
```

## Autenticação

- Login via **HTTP Basic** em `POST /auth/authenticate`; a API retorna um **JWT** (`accessToken`).
- O frontend armazena o token no `localStorage` e envia no header `Authorization: Bearer {token}` nas requisições autenticadas.
- Rotas públicas: login e recuperação de senha; demais rotas exigem autenticação.

## Módulos

- **Usuários**: listagem paginada, filtros.
- **Grupos**: listagem com permissões.
- **Permissões**: listagem.
- **Estados**: listagem.
- **Municípios**: listagem por estado (dropdown de estado).

Os tipos e endpoints seguem os DTOs e rotas da coordenapleito-api (Spring Boot).
