import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  API_CONTEXT_PATH,
  buildBackendTargetUrl,
  isBackendProxyDebugEnabled,
  listBackendOriginsFromEnv,
  normalizeBackendOrigin,
  resolveBackendFromEnv,
  type BackendEnv,
} from './backendOrigin';

const k8sEnv: BackendEnv = {
  NODE_ENV: 'production',
  KUBERNETES_SERVICE_HOST: '10.96.0.1',
  POD_NAMESPACE: 'coordenapleito',
  COORDENAPLEITO_API_SERVICE_HOST: '10.43.120.15',
  COORDENAPLEITO_API_SERVICE_PORT: '8080',
};

const devEnv: BackendEnv = {
  NODE_ENV: 'development',
};

describe('resolveBackendFromEnv', () => {
  it('prioriza BACKEND_URL sobre qualquer outra estratégia', () => {
    const resolution = resolveBackendFromEnv({
      ...k8sEnv,
      BACKEND_URL: 'http://custom-backend:9090',
    });

    assert.equal(resolution.strategy, 'BACKEND_URL');
    assert.equal(resolution.origin, 'http://custom-backend:9090');
  });

  it('em produção sem candidatos usa Ingress público, nunca localhost', () => {
    const resolution = resolveBackendFromEnv({
      NODE_ENV: 'production',
    });

    assert.notEqual(resolution.origin, 'http://localhost:8080');
    assert.equal(resolution.strategy, 'PUBLIC_INGRESS');
    assert.equal(resolution.origin, 'https://coordenapleito.sps.ce.gov.br');
  });

  it('resolveBackendFromEnv em Kubernetes sem BACKEND_URL usa IP do Service', () => {
    const resolution = resolveBackendFromEnv(k8sEnv);

    assert.equal(resolution.strategy, 'KUBERNETES_SERVICE');
    assert.equal(resolution.origin, 'http://10.43.120.15:8080');
  });

  it('em produção nunca utiliza localhost', () => {
    const resolutions = listBackendOriginsFromEnv({
      NODE_ENV: 'production',
      KUBERNETES_SERVICE_HOST: '10.96.0.1',
      POD_NAMESPACE: 'coordenapleito',
    });

    assert.ok(
      resolutions.every((item) => item.origin !== 'http://localhost:8080'),
      `localhost encontrado: ${JSON.stringify(resolutions)}`
    );
    assert.ok(
      resolutions.every((item) => item.strategy !== 'LOCALHOST'),
      `estratégia LOCALHOST encontrada: ${JSON.stringify(resolutions)}`
    );
  });

  it('em desenvolvimento utiliza localhost como último fallback', () => {
    const resolutions = listBackendOriginsFromEnv(devEnv);
    const last = resolutions[resolutions.length - 1];

    assert.equal(last.strategy, 'LOCALHOST');
    assert.equal(last.origin, 'http://localhost:8080');
  });

  it('sem variáveis Kubernetes tenta DNS curto e FQDN em produção', () => {
    const resolutions = listBackendOriginsFromEnv({
      NODE_ENV: 'production',
      KUBERNETES_SERVICE_HOST: '10.96.0.1',
      POD_NAMESPACE: 'coordenapleito',
    });

    assert.deepEqual(
      resolutions.map((item) => item.strategy),
      ['KUBERNETES_SHORT_DNS', 'KUBERNETES_FQDN_DNS', 'PUBLIC_INGRESS']
    );
    assert.equal(resolutions[0].origin, 'http://coordenapleito-api:8080');
    assert.equal(
      resolutions[1].origin,
      'http://coordenapleito-api.coordenapleito.svc.cluster.local:8080'
    );
  });
});

describe('isBackendProxyDebugEnabled', () => {
  it('desligado por padrão', () => {
    assert.equal(isBackendProxyDebugEnabled({ NODE_ENV: 'production' }), false);
  });

  it('liga com COORDENAPLEITO_BACKEND_PROXY_DEBUG=true', () => {
    assert.equal(
      isBackendProxyDebugEnabled({
        NODE_ENV: 'production',
        COORDENAPLEITO_BACKEND_PROXY_DEBUG: 'true',
      }),
      true
    );
  });
});

describe('normalizeBackendOrigin', () => {
  it('remove context-path duplicado de BACKEND_URL', () => {
    assert.equal(
      normalizeBackendOrigin('http://coordenapleito-api:8080/coordenapleito-api'),
      'http://coordenapleito-api:8080'
    );
  });
});

describe('buildBackendTargetUrl', () => {
  it('monta URL interna com context-path único', () => {
    const target = buildBackendTargetUrl(
      'http://coordenapleito-api:8080',
      ['auth', 'check_token'],
      '?verbose=true'
    );

    assert.equal(
      target,
      `http://coordenapleito-api:8080${API_CONTEXT_PATH}/auth/check_token?verbose=true`
    );
  });

  it('não duplica context-path quando BACKEND_URL já o inclui', () => {
    const target = buildBackendTargetUrl(
      'http://coordenapleito-api:8080/coordenapleito-api',
      ['usuarios'],
      ''
    );

    assert.equal(target, `http://coordenapleito-api:8080${API_CONTEXT_PATH}/usuarios`);
  });

  it('nunca gera URL interna sem porta', () => {
    const target = buildBackendTargetUrl('http://coordenapleito-api:8080', ['health'], '');
    const url = new URL(target);

    assert.equal(url.port, '8080');
    assert.equal(url.hostname, 'coordenapleito-api');
  });
});
