# Proxy Next.js → API no Kubernetes

## Prioridade de descoberta (`src/lib/backendOrigin.ts`)

| Ordem | Estratégia | Origem típica |
|------|------------|----------------|
| 1 | `BACKEND_URL` | `http://coordenapleito-api:8080` (Deployment) |
| 2 | Kubernetes Service | `COORDENAPLEITO_API_SERVICE_HOST` + `COORDENAPLEITO_API_SERVICE_PORT` |
| 3 | DNS curto | `http://coordenapleito-api:8080` |
| 4 | DNS FQDN | `http://coordenapleito-api.coordenapleito.svc.cluster.local:8080` |
| 5 | Ingress público | `https://coordenapleito.sps.ce.gov.br` |
| 6 | localhost | **somente** `NODE_ENV !== production` |

URL final do proxy: `{origin}/coordenapleito-api/{path}` (context-path único).

## Logs na subida

Desligados por padrão. Para diagnosticar o proxy, defina no Deployment:

```yaml
- name: COORDENAPLEITO_BACKEND_PROXY_DEBUG
  value: "true"
```

Com debug ativo, nos logs do pod `coordenapleito-frontend`:

```
[backend-origin] Using backend from Kubernetes Service: http://...
[backend-origin] Proxy fallback chain: ...
```

## Logs por requisição

Somente com `COORDENAPLEITO_BACKEND_PROXY_DEBUG=true`. Cada tentativa de proxy registra:

```json
{
  "event": "coordenapleito-api-proxy-fetch",
  "backendOrigin": "http://coordenapleito-api:8080",
  "targetUrl": "http://coordenapleito-api:8080/coordenapleito-api/...",
  "strategy": "KUBERNETES_SHORT_DNS",
  ...
}
```

## Testes

```bash
npm run test:backend-origin
```

## ECONNREFUSED

1. Confirme nos logs qual `targetUrl` foi usada — **não deve ser** `localhost:8080` em produção.
2. Se a URL estiver correta (`http://coordenapleito-api:8080/coordenapleito-api/...`) e ainda falhar, o pod `coordenapleito-api` não está aceitando conexões (CrashLoop, Flyway, etc.).
