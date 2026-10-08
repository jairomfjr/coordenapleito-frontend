/**
 * Tipos do módulo de mapas interativos (espelham a coordenapleito-api).
 */

import type { PageResponse } from '@/types/api';

export type TipoMapa = 'PONTOS' | 'POLIGONOS' | 'COROPLETICO' | 'MISTO';

export const TIPO_MAPA_OPCOES: { value: TipoMapa; label: string }[] = [
  { value: 'PONTOS', label: 'Pontos' },
  { value: 'POLIGONOS', label: 'Polígonos' },
  { value: 'COROPLETICO', label: 'Coroplético' },
  { value: 'MISTO', label: 'Misto' },
];

export interface MapaUsuarioCriadorModel {
  codigo: string;
  nome: string;
}

export interface ConfiguracaoVisualMapaModel {
  id?: number;
  codigo?: string;
  corPadrao?: string;
  corSecundaria?: string;
  corFundo?: string;
  exibirLegenda?: boolean;
  opacidadeCamada?: number;
  zoomInicial?: number;
  latitudeCentro?: number;
  longitudeCentro?: number;
  faixasLegenda?: FaixaLegendaMapaModel[];
}

export interface FaixaLegendaMapaModel {
  id?: number;
  codigo?: string;
  valorMin?: number;
  valorMax?: number;
  cor: string;
  rotulo?: string;
  ordem?: number;
}

export interface PublicacaoMapaModel {
  id?: number;
  codigo?: string;
  publicado?: boolean;
  identificador?: string | null;
  publicadoEm?: string | null;
}

export interface ItemMapaModel {
  id?: number;
  codigo?: string;
  nome?: string;
  valor?: string;
  quantidade?: number | null;
  cor?: string;
  /** Cor calculada para exibição (manual, faixa de valor, camada ou padrão). */
  corExibicao?: string;
  /** Chave do ícone no catálogo (ex.: centros-comunitarios). */
  icone?: string | null;
  latitude?: number;
  longitude?: number;
  codigoIbge?: number;
  geometria?: string;
  ordem?: number;
  logradouro?: string;
  logradouroNumero?: string;
  complemento?: string;
  cep?: string;
  bairroId?: number;
  municipioId?: number;
  estadoId?: number;
}

export interface CamadaMapaModel {
  id?: number;
  codigo?: string;
  nome: string;
  cor?: string;
  ordem?: number;
  visivel?: boolean;
  itens?: ItemMapaModel[];
}

/** Item do catálogo público de mapas publicados. */
export interface MapaCatalogoPublicoModel {
  identificador: string;
  titulo: string;
  descricao?: string;
  tipo: TipoMapa;
  publicadoEm?: string | null;
  latitudeCentro?: number | null;
  longitudeCentro?: number | null;
  zoomInicial?: number | null;
}

export interface MapaModelBasico {
  id: number;
  codigo: string;
  titulo: string;
  descricao?: string;
  tipo: TipoMapa;
  ativo?: boolean;
  dataCadastro?: string;
  dataAtualizacao?: string;
  publicado?: boolean;
  identificador?: string | null;
  usuarioCriador?: MapaUsuarioCriadorModel | null;
}

export interface MapaDetalheModel {
  id: number;
  codigo: string;
  titulo: string;
  descricao?: string;
  tipo: TipoMapa;
  ativo?: boolean;
  dataCadastro?: string;
  dataAtualizacao?: string;
  usuarioCriador?: MapaUsuarioCriadorModel | null;
  configuracaoVisual?: ConfiguracaoVisualMapaModel | null;
  publicacao?: PublicacaoMapaModel | null;
  camadas?: CamadaMapaModel[];
}

export interface MapaCadastroInput {
  titulo: string;
  descricao?: string;
  tipo: TipoMapa;
}

export interface MapaAtualizacaoInput {
  titulo?: string;
  descricao?: string;
  tipo?: TipoMapa;
  ativo?: boolean;
}

export interface CamadaMapaCadastroInput {
  nome: string;
  cor?: string;
  ordem?: number;
  visivel?: boolean;
}

export interface CamadaMapaAtualizacaoInput {
  nome?: string;
  cor?: string;
  ordem?: number;
  visivel?: boolean;
}

export interface ItemMapaCadastroInput {
  nome?: string;
  valor?: string;
  quantidade?: number | null;
  cor?: string;
  icone?: string | null;
  latitude?: number;
  longitude?: number;
  codigoIbge?: number;
  geometria?: string;
  ordem?: number;
  logradouro?: string;
  logradouroNumero?: string;
  complemento?: string;
  cep?: string;
  bairro?: { id: number };
}

export interface ItemMapaAtualizacaoInput {
  nome?: string;
  valor?: string;
  /** Texto numérico; string vazia limpa. */
  quantidade?: string;
  cor?: string;
  icone?: string | null;
  latitude?: number;
  longitude?: number;
  codigoIbge?: number;
  geometria?: string;
  ordem?: number;
  logradouro?: string;
  logradouroNumero?: string;
  complemento?: string;
  cep?: string;
  bairro?: { id: number };
}

export interface ConfiguracaoVisualMapaInput {
  corPadrao?: string;
  corSecundaria?: string;
  corFundo?: string;
  exibirLegenda?: boolean;
  opacidadeCamada?: number;
  zoomInicial?: number;
  latitudeCentro?: number;
  longitudeCentro?: number;
  faixasLegenda?: FaixaLegendaMapaInput[];
}

export interface FaixaLegendaMapaInput {
  valorMin?: number;
  valorMax?: number;
  cor: string;
  rotulo?: string;
  ordem?: number;
}

export interface PublicacaoMapaInput {
  publicado: boolean;
  identificador?: string;
}

export interface ImportacaoItemMapaErro {
  linha: number;
  mensagem: string;
}

export interface ImportacaoItensMapaResultado {
  mapaCodigo: string;
  camadaCodigo: string;
  camadaNome: string;
  nomeArquivo: string;
  substituirExistentes: boolean;
  bloqueadoPorConfirmacao: boolean;
  itensAntes: number;
  itensRemovidos: number;
  totalLinhas: number;
  linhasValidas: number;
  itensImportados: number;
  linhasComErro: number;
  erros: ImportacaoItemMapaErro[];
  mensagem: string;
}

export type MapaPageResponse = PageResponse<MapaModelBasico>;

export interface GerarMunicipiosCearaResultado {
  criados: number;
  ignorados: number;
  totalCamada: number;
  mensagem: string;
}

export interface AplicarCorMunicipiosInput {
  cor: string;
  codigosIbge: number[];
  /** Significado na legenda (gravado no campo valor dos itens). */
  valorLegenda?: string;
}

export interface AplicarCorMunicipiosResultado {
  atualizados: number;
  ignorados: number;
  mensagem: string;
}

export interface AplicarIconeItensInput {
  icone: string;
  itensCodigos: string[];
  valorLegenda: string;
}

export interface AplicarIconeItensResultado {
  atualizados: number;
  ignorados: number;
  mensagem: string;
}
