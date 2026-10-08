/**
 * Mapeamento rota → recurso RBAC para {@link ListagemBar} / {@link ListagemTable} ({@code authRecurso}).
 * Manter alinhado a {@code PermissionCatalogRegistry} e {@code HREF_MENU_PERMISSION}.
 */
export const LISTAGEM_AUTH_RECURSO_POR_PATH: Record<string, string> = {
  '/usuarios': 'usuario',
  '/grupos': 'grupo',
  '/modulos-operacionais': 'modulo-operacional',
  '/permissoes': 'permissao',
  '/mensagens': 'mensagem-admin',
  '/generos': 'genero',
  '/etnias': 'etnia',
  '/orientacoes-sexuais': 'orientacao-sexual',
  '/acoes': 'acao',
  '/periodos': 'periodo',
  '/periodos-acoes': 'periodo-acao',
  '/tipos-acolhimento': 'tipo-acolhimento',
  '/tipos-equipamento': 'tipo-equipamento',
  '/categorias': 'categoria',
  '/tipos-servico': 'tipo-servico',
  '/servicos': 'servico',
  '/servicos-caminhao': 'servico-caminhao',
  '/servicos-vapt-vupt': 'servico-vapt-vupt',
  '/orgao-vapt-vupt': 'orgao-vapt-vupt',
  '/coordenacoes': 'coordenacao',
  '/cargos': 'cargo',
  '/partidos-politicos': 'partido-politico',
  '/cidadaos': 'cidadao',
  '/equipamentos': 'equipamento',
  '/equipamento-servicos': 'equipamento-servico',
  '/acolhimentos': 'acolhimento',
  '/autoridades': 'autoridade',
  '/demandas-municipio': 'demanda-municipio',
  '/organograma': 'organograma',
  '/dashboard/mapas': 'mapa-interativo',
  '/cmic': 'cmic',
  '/ceara-sem-fome': 'ceara-sem-fome',
  '/vale-gas': 'vale-gas',
  '/secofi': 'secofi',
  '/projetos/vapt-vupt': 'vapt-vupt-atendimento',
  '/projetos/casa-cidadao': 'casa-cidadao-atendimento',
  '/projetos/caminhao-cidadao': 'caminhao-cidadao-atendimento',
  '/coordenacao-basica': 'estatistica',
  '/inclusao-social': 'estatistica',
  '/relatorios/cidadaos': 'relatorio-cidadao',
  '/relatorios/casa-cidadao': 'relatorio-casa-cidadao',
  '/relatorios/caminhao-cidadao': 'relatorio-caminhao-cidadao',
  '/relatorios/dashboards': 'relatorio-dashboard',
  '/relatorios': 'relatorio',
};

export function authRecursoParaPathname(pathname: string): string | undefined {
  if (LISTAGEM_AUTH_RECURSO_POR_PATH[pathname]) {
    return LISTAGEM_AUTH_RECURSO_POR_PATH[pathname];
  }
  const entries = Object.entries(LISTAGEM_AUTH_RECURSO_POR_PATH).sort(
    (a, b) => b[0].length - a[0].length
  );
  for (const [prefix, recurso] of entries) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return recurso;
    }
  }
  return undefined;
}
