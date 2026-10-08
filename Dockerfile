# docker build -f Dockerfile -t hub.sps.ce.gov.br/coordenapleito/coordenapleito-frontend .
# docker push hub.sps.ce.gov.br/coordenapleito/coordenapleito-frontend
#
# Homologação/produção (padrão): estágio production — build + node server.js
# Desenvolvimento no container: docker build --target development ...

# Estágio 1: Build da aplicação
FROM node:20-slim AS builder

WORKDIR /app

# Build arg: defina em produção para a URL da API (ex.: https://coordenapleito.sps.ce.gov.br/coordenapleito-api)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Se o frontend for publicado em subpath (ex.: /coordenapleito), defina no build para assets e rotas corretos
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
# Opcional: true se o proxy na VPS não encaminhar bem `/_next/image` (imagens quebradas)
ARG NEXT_IMAGE_UNOPTIMIZED
ENV NEXT_IMAGE_UNOPTIMIZED=$NEXT_IMAGE_UNOPTIMIZED

# Não definir NODE_ENV=production antes do `npm ci` — o npm omite devDependencies
# (typescript, tipos, etc.) e o Next/Webpack deixa de resolver os aliases `@/`.
COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
# Webpack (mesmo comando do CI) — mais estável que Turbopack em VPS/Docker
RUN npm run build:webpack

# Estágio 2: Desenvolvimento (next dev — NÃO usar em homologação/produção)
FROM node:20-slim AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Estágio 3: Produção/homologação (padrão quando não se passa --target)
FROM node:20-slim AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "./server.js"]
