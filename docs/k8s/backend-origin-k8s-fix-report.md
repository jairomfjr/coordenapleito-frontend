# Relatório técnico — ECONNREFUSED no proxy `/coordenapleito-api` (Kubernetes)

**Data:** 2026-07-06  
**Escopo:** apenas frontend (`coordenapleito-frontend`)

## Sintoma

Após o login no ambiente Kubernetes:

```
TypeError: fetch failed
[cause]: AggregateError
code: ECONNREFUSED
```

Em ambiente local o sistema funciona normalmente.

## Infraestrutura (contexto, sem alterações)

| Componente | Configuração |
|------------|--------------|
| Service API | `coordenapleito-api:8080` |
| Context-path Spring | `/coordenapleito-api` |
| Ingress | `/coordenapleito-api` → `coordenapleito-api:8080`, `/` → `coordenapleito-frontend` |
| Namespace | `coordenapleito` |

## Causa raiz

O Route Handler `src/app/coordenapleito-api/[...path]/route.ts` **não utilizava** o módulo `src/lib/backendOrigin.ts`.

Ele definía a origem do backend em tempo de build da rota:

```typescript
const BACKEND_ORIGIN = (process.env.BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '');
```

No pod do frontend em produção:

1. `BACKEND_URL` normalmente **não está definido** (opcional no Deployment de exemplo).
2. O fallback era **sempre** `http://localhost:8080`.
3. Dentro do container do frontend **não há** API Spring escutando na porta 8080.
4. O `fetch` do proxy falhava com **ECONNREFUSED**.

O módulo `backendOrigin.ts` já implementava a cadeia correta (BACKEND_URL → Service env → DNS interno → FQDN → Ingress → localhost só em dev), testes unitários e `instrumentation.ts` para log na subida — mas o proxy **nunca foi conectado** a essa lógica.

## URL que estava sendo utilizada

| Ambiente | URL efetiva do proxy |
|----------|----------------------|
| Kubernetes (antes) | `http://localhost:8080/coordenapleito-api/...` |
| Local (dev) | `http://localhost:8080/coordenapleito-api/...` (correto — API local) |

## URL esperada após correção

| Cenário | Origem primária | URL final exemplo |
|---------|-----------------|-------------------|
| K8s com env do Service | `http://<COORDENAPLEITO_API_SERVICE_HOST>:8080` | `http://10.x.x.x:8080/coordenapleito-api/auth/me` |
| K8s sem env do Service | `http://coordenapleito-api:8080` | `http://coordenapleito-api:8080/coordenapleito-api/usuarios` |
| K8s com `BACKEND_URL` | valor explícito | conforme variável |
| Dev local | `http://localhost:8080` | `http://localhost:8080/coordenapleito-api/...` |

Nunca em produção: `localhost`, URL sem porta no cluster, ou `/coordenapleito-api/coordenapleito-api`.

## Correção aplicada

### 1. `src/app/coordenapleito-api/[...path]/route.ts`

- Integração com `backendOrigin.ts`.
- Cadeia de fallback via `listBackendOriginsToTry()`.
- Montagem de URL via `buildBackendTargetUrl()` (context-path único).
- Logs antes de cada `fetch` (`logFetchAttempt`).
- Logs detalhados em erro (`logFetchError`: URL, host, porta, cause, stack, env).
- Retry automático para erros de conexão (`ECONNREFUSED`, `ENOTFOUND`, etc.) na próxima origem da cadeia.
- Resposta 502 JSON quando todas as origens falham.

### 2. `src/lib/backendOrigin.ts`

- `resolveBackendFromEnv`: em produção sem candidatos, usa Ingress público em vez de localhost.

### 3. `package.json`

- Script `npm run test:backend-origin` para os testes unitários.

### 4. Documentação

- Este relatório e `troubleshooting-proxy-api.md` (já alinhado à prioridade).

## Prioridade de descoberta (implementada)

1. `BACKEND_URL`
2. `COORDENAPLEITO_API_SERVICE_HOST` + `COORDENAPLEITO_API_SERVICE_PORT` (e aliases de porta K8s)
3. DNS curto: `http://coordenapleito-api:8080` (se `KUBERNETES_SERVICE_HOST` presente)
4. DNS FQDN: `http://coordenapleito-api.<POD_NAMESPACE>.svc.cluster.local:8080`
5. Ingress: `https://coordenapleito.sps.ce.gov.br` (ou `COORDENAPLEITO_PUBLIC_ORIGIN`)
6. `http://localhost:8080` — **somente** `NODE_ENV !== 'production'`

## Logs na subida (`instrumentation.ts`)

```
[backend-origin] Using backend from Kubernetes Service: http://...
[backend-origin] Proxy fallback chain: ...
[backend-origin] Environment snapshot: { BACKEND_URL, POD_NAMESPACE, ... }
```

## Logs por requisição

```json
{
  "event": "coordenapleito-api-proxy-fetch",
  "backendOrigin": "http://coordenapleito-api:8080",
  "targetUrl": "http://coordenapleito-api:8080/coordenapleito-api/auth/me",
  "method": "GET",
  "pathname": "/coordenapleito-api/auth/me",
  "search": "",
  "strategy": "KUBERNETES_SHORT_DNS",
  "env": { "BACKEND_URL": undefined, "POD_NAMESPACE": "coordenapleito", ... }
}
```

## Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/app/coordenapleito-api/[...path]/route.ts` | Proxy usa `backendOrigin` + fallback + logs |
| `src/lib/backendOrigin.ts` | Fallback produção sem localhost |
| `package.json` | Script `test:backend-origin` |
| `docs/k8s/backend-origin-k8s-fix-report.md` | Este relatório |

**Não alterados:** API backend, Ingress, manifests Kubernetes.

## Impacto

- **Kubernetes:** proxy passa a contactar o Service interno ou Ingress; elimina ECONNREFUSED por localhost.
- **Local:** comportamento preservado (`localhost:8080` em dev).
- **Observabilidade:** logs estruturados na subida e em cada proxy/falha.

## Validação

```bash
cd coordenapleito-frontend
npm run test:backend-origin
npm run build:webpack
```

Após deploy, verificar logs do pod:

```bash
kubectl logs -n coordenapleito deploy/coordenapleito-frontend | grep backend-origin
kubectl logs -n coordenapleito deploy/coordenapleito-frontend | grep coordenapleito-api-proxy-fetch
```

A `targetUrl` **não deve** conter `localhost:8080` em produção.

## Se ECONNREFUSED persistir

Com URL correta (`http://coordenapleito-api:8080/coordenapleito-api/...`), a falha está no pod da API (CrashLoop, Flyway, porta, readiness) — fora do escopo desta correção no frontend.
