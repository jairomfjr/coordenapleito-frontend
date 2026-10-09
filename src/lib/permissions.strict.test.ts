import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { AuthenticationModel } from '@/types/api';
import {
  userCanSeeMenuHref,
  usuarioPodeAcessarPaginaRecurso,
  usuarioPodeListarRecurso,
  usuarioPodeVerMenuRecurso,
  usuarioTemBloqueioCamposLocalVotacao,
} from './permissions';
import { rotaNegadaParaUsuario } from './routePermissions';

function userComPermissoes(permissoes: string[]): AuthenticationModel {
  return {
    accessToken: 'token',
    id: 1,
    codigo: 'test-user',
    username: 'teste',
    nome: 'Teste',
    permissoes,
    roles: ['Técnico'],
    authorities: permissoes,
    tokenType: 'Bearer',
  };
}

describe('RBAC estrito — menu, página e listar separados', () => {
  it('somente grupo.listar não exibe menu Grupos', () => {
    const user = userComPermissoes(['grupo.listar']);

    assert.equal(usuarioPodeListarRecurso(user, 'grupo'), true);
    assert.equal(usuarioPodeVerMenuRecurso(user, 'grupo'), false);
    assert.equal(userCanSeeMenuHref(user, '/grupos'), false);
    assert.equal(usuarioPodeAcessarPaginaRecurso(user, 'grupo'), false);
    assert.equal(rotaNegadaParaUsuario('/grupos', user), true);
  });

  it('grupo.menu exibe menu mas não abre página sem grupo.pagina', () => {
    const user = userComPermissoes(['grupo.menu']);

    assert.equal(userCanSeeMenuHref(user, '/grupos'), true);
    assert.equal(usuarioPodeAcessarPaginaRecurso(user, 'grupo'), false);
    assert.equal(rotaNegadaParaUsuario('/grupos', user), true);
  });

  it('grupo.pagina abre a rota sem exibir menu sem grupo.menu', () => {
    const user = userComPermissoes(['grupo.pagina']);

    assert.equal(userCanSeeMenuHref(user, '/grupos'), false);
    assert.equal(usuarioPodeAcessarPaginaRecurso(user, 'grupo'), true);
    assert.equal(rotaNegadaParaUsuario('/grupos', user), false);
  });

  it('grupo.menu e grupo.pagina liberam menu e rota', () => {
    const user = userComPermissoes(['grupo.menu', 'grupo.pagina', 'grupo.listar']);

    assert.equal(userCanSeeMenuHref(user, '/grupos'), true);
    assert.equal(rotaNegadaParaUsuario('/grupos', user), false);
    assert.equal(usuarioPodeListarRecurso(user, 'grupo'), true);
  });

  it('local-votacao.menu e local-votacao.pagina liberam menu e rota', () => {
    const user = userComPermissoes(['local-votacao.menu', 'local-votacao.pagina', 'local-votacao.listar']);

    assert.equal(userCanSeeMenuHref(user, '/locais-votacao'), true);
    assert.equal(rotaNegadaParaUsuario('/locais-votacao', user), false);
    assert.equal(usuarioPodeListarRecurso(user, 'local-votacao'), true);
  });

  it('coordenador.menu e coordenador.pagina liberam menu e rota', () => {
    const user = userComPermissoes(['coordenador.menu', 'coordenador.pagina', 'coordenador.listar']);

    assert.equal(userCanSeeMenuHref(user, '/coordenadores'), true);
    assert.equal(rotaNegadaParaUsuario('/coordenadores', user), false);
    assert.equal(usuarioPodeListarRecurso(user, 'coordenador'), true);
  });

  it('local-votacao.bloquear-campos sinaliza bloqueio dos demais campos', () => {
    const semBloqueio = userComPermissoes(['local-votacao.editar']);
    const comBloqueio = userComPermissoes(['local-votacao.editar', 'local-votacao.bloquear-campos']);

    assert.equal(usuarioTemBloqueioCamposLocalVotacao(semBloqueio), false);
    assert.equal(usuarioTemBloqueioCamposLocalVotacao(comBloqueio), true);
  });
});
