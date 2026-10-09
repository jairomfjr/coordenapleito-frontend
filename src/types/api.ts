/**
 * Tipos baseados nos DTOs e Inputs da coordenapleito-api
 */

// --- Respostas (Models) ---

export interface EnderecoModel {
  logradouro?: string;
  logradouroNumero?: string;
  complemento?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  bairro?: BairroModelBasico;
}

export interface ContatoModel {
  telefone?: string;
  celular?: string;
  email?: string;
}

export interface BairroModelBasico {
  id: number;
  codigo: string;
  nome: string;
  municipio?: MunicipioModelBasico;
}

export interface MunicipioModelBasico {
  id: number;
  codigo: string;
  nome: string;
  codigoIbge?: number;
  latitude?: number;
  longitude?: number;
  estado?: EstadoModelBasico;
}

export interface EstadoModelBasico {
  id: number;
  codigo: string;
  nome: string;
  sigla: string;
  ibge?: number;
}

export interface PermissaoModelBasico {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  chave?: string;
  modulo?: string;
  recurso?: string;
  acao?: string;
}

export interface PermissaoArvoreNodeModel {
  chave?: string;
  descricao?: string;
  modulo?: string;
  recurso?: string;
  acao?: string;
  filhos?: PermissaoArvoreNodeModel[];
}

export interface GrupoModelBasico {
  id: number;
  codigo: string;
  nome: string;
  permissoes?: PermissaoModelBasico[];
}

export interface MensagemModelBasico {
  id: number;
  codigo: string;
  titulo: string;
  corpo: string;
  publicada: boolean;
  dataPublicacao?: string | null;
}

export interface MensagemInput {
  titulo: string;
  corpo: string;
  publicada: boolean;
}

export interface MensagemInboxItemModel {
  codigo: string;
  titulo: string;
  corpo: string;
  dataPublicacao?: string | null;
  lida: boolean;
}

export interface MensagemNaoLidasContagemModel {
  total: number;
}

export interface UsuarioModelBasico {
  id: number;
  codigo: string;
  nome: string;
  cpf?: string;
  dataNascimento?: string;
  contato?: ContatoModel;
  cargo?: string;
  ativo: boolean;
  recebeEmail?: boolean;
  grupos?: GrupoModelBasico[];
}

export interface AuthenticationModel {
  accessToken: string;
  id: number;
  codigo: string;
  username: string;
  nome: string;
  /** ID da coordenação vinculada ao usuário (quando houver). */
  coordenacaoId?: number | null;
  /** Nomes dos grupos (exibição). */
  roles: string[];
  /** Códigos UUID dos grupos do usuário (edição do próprio perfil). */
  gruposCodigos?: string[];
  /** @deprecated Use {@link permissoes}. */
  authorities: string[];
  /** Chaves funcionais recurso.acao — autorização no SPA. */
  permissoes?: string[];
  /** Módulos liberados pela coordenação do usuário (escopo operacional). */
  modulosOperacionais?: string[];
  tokenType: string;
}

export interface ModuloOperacionalModelBasico {
  id: number;
  codigo: string;
  chave: string;
  nome: string;
  descricao?: string;
  recursoPermissao: string;
  ativo?: boolean;
  coordenacoes?: CoordenacaoModelBasico[];
}

// --- Request (Inputs) ---

export interface GenericIdInput {
  id: number;
}

export interface EnderecoInput {
  logradouro?: string;
  logradouroNumero?: string;
  complemento?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  bairro?: GenericIdInput;
}

export interface ContatoInput {
  telefone?: string;
  celular?: string;
  email?: string;
}

export interface UsuarioInput {
  nome: string;
  cpf?: string;
  dataNascimento?: string;
  contato?: ContatoInput;
  cargo?: string;
  grupos?: string[];
}

export interface GrupoInput {
  nome: string;
  /** Códigos (UUID) das permissões a vincular ao grupo. */
  permissoesCodigos?: string[];
}

export interface LocalVotacaoModelBasico {
  id: number;
  codigo: string;
  zona: number;
  localVotacao: string;
  endereco: string;
  bairro: string;
  qtdSecoes: number;
  qtdEleitores: number;
  qtdCoordenadores: number;
}

export interface LocalVotacaoInput {
  zona: number;
  localVotacao: string;
  endereco: string;
  bairro: string;
  qtdSecoes: number;
  qtdEleitores: number;
  qtdCoordenadores: number;
}

export interface LocalVotacaoFilter {
  busca?: string;
  zona?: number;
  bairro?: string;
  page?: number;
  size?: number;
}

export interface CoordenadorModelBasico {
  id: number;
  codigo: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  localTrabalho: LocalVotacaoModelBasico;
  localVotacao: LocalVotacaoModelBasico;
}

export interface CoordenadorInput {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  localTrabalhoCodigo: string;
  localVotacaoCodigo: string;
}

export interface CoordenadorFilter {
  busca?: string;
  page?: number;
  size?: number;
}

export interface VinculoItemModel {
  zona: number;
  nome: string;
  capacidade: number;
  vinculados: number;
  vagasDisponiveis: number;
  percentualOcupacao: number;
}

export interface CoordenadorVinculoResumoModel {
  capacidadeTotal: number;
  vinculados: number;
  vagasDisponiveis: number;
  locaisEsgotados: number;
  locaisComVaga: number;
  totalLocais: number;
  totalZonas: number;
  percentualOcupacao: number;
  zonaMaisVinculos?: VinculoItemModel | null;
  zonaMenosVinculos?: VinculoItemModel | null;
  porZona: VinculoItemModel[];
  locaisDestaque: VinculoItemModel[];
  locaisComMaisVagas: VinculoItemModel[];
}

export interface LocalVotacaoPublicoModel {
  codigo: string;
  zona: number;
  localVotacao: string;
  endereco: string;
  bairro: string;
  capacidade: number;
  ocupados: number;
  vagasDisponiveis: number;
  esgotado: boolean;
}

export interface CoordenadorCpfConsultaModel {
  existe: boolean;
  contatoMascarado?: string;
  mensagem: string;
}

export interface CoordenadorPublicoModel {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  localTrabalhoCodigo: string;
  localVotacaoCodigo: string;
}

export interface CoordenadorVerificacaoModel {
  tokenAtualizacao: string;
  cadastro: CoordenadorPublicoModel;
}

export interface PermissaoInput {
  nome: string;
  descricao?: string;
}

export interface EstadoInput {
  nome: string;
  sigla: string;
  ibge: number;
}

export interface MunicipioInput {
  nome: string;
  codigoIbge: number;
}

export interface BairroInput {
  nome: string;
}

export interface SenhaInput {
  senhaAtual: string;
  novaSenha: string;
}

export interface RecuperarSenhaInput {
  cpf: string;
  email: string;
}

// --- Filtros (query params) ---

export interface UsuarioFilter {
  /** Busca unificada na listagem (nome, CPF parcial e/ou e-mail). */
  busca?: string;
  nome?: string;
  cpf?: string;
  email?: string;
  ativo?: boolean;
  page?: number;
  size?: number;
}

// --- Paginação (resposta da API) ---

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ========== Módulo Equipamentos / Atendimentos / Cursos / Acolhimentos ==========

// --- Enums (valores string) ---
export type StatusEquipamento = 'ATIVO' | 'INATIVO' | 'EM_OBRAS' | 'ENCERRADO';
export type StatusAcolhimento = 'ATIVO' | 'ENCERRADO' | 'TRANSFERIDO';
export type Sexo = 'NAO_INFORMADO' | 'MASCULINO' | 'FEMININO';

/** Raça/cor (IBGE). */
export type RacaCor = 'BRANCA' | 'PRETA' | 'PARDA' | 'AMARELA' | 'INDIGENA';

// --- Models (resposta) - módulo ---
export interface TipoEquipamentoModelBasico {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface CategoriaModelBasico {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface OrgaoVaptVuptModelBasico {
  id: number;
  codigo: string;
  idOrgaoOrigem: number;
  descricao?: string;
  ativo?: boolean;
}

export interface GeneroModelBasico {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface CargoModelBasico {
  id: number;
  codigo: string;
  descricao: string;
  ativo?: boolean;
}

export interface ServicoCaminhaoModelBasico {
  id: number;
  codigo: string;
  descricao: string;
  ativo?: boolean;
}

export interface ServicoVaptVuptModelBasico {
  id: number;
  codigo: string;
  descricao: string;
  idOrigem?: number;
  ativo?: boolean;
}

export interface PartidoPoliticoModelBasico {
  id: number;
  codigo: string;
  descricao: string;
  sigla: string;
  ativo?: boolean;
}

export interface AutoridadeModelBasico {
  id: number;
  codigo: string;
  nome: string;
  apelido?: string;
  ativo?: boolean;
  cargo?: CargoModelBasico;
  partidoPolitico?: PartidoPoliticoModelBasico;
  municipio?: MunicipioModelBasico;
  temFoto?: boolean;
}

export interface OrganogramaPaiModelBasico {
  id: number;
  codigo: string;
  nome: string;
  tipo: string;
}

export interface OrganogramaModelBasico {
  id: number;
  codigo: string;
  nome: string;
  tipo: string;
  descricao?: string;
  sigla?: string;
  ordem?: number;
  ativo?: boolean;
  temFoto?: boolean;
  pai?: OrganogramaPaiModelBasico;
}

export interface OrganogramaArvoreModel {
  id: number;
  codigo: string;
  nome: string;
  tipo: string;
  descricao?: string;
  sigla?: string;
  ordem?: number;
  ativo?: boolean;
  temFoto?: boolean;
  filhos?: OrganogramaArvoreModel[];
}

/** Alinhado ao enum da API (DemandaMunicipio.status). */
export type StatusDemandaMunicipio = 'SOLICITADO' | 'ATENDIDO' | 'REPRIMIDO';

export interface DemandaMunicipioModelBasico {
  id: number;
  codigo: string;
  descricao: string;
  municipio?: MunicipioModelBasico;
  /** Autoridade solicitante (mesmo município da demanda). */
  solicitante?: AutoridadeModelBasico;
  dataPrevistaAtendimento: string;
  status: StatusDemandaMunicipio;
}

export interface EtniaModelBasico {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface OrientacaoSexualModelBasico {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface AcaoModelBasico {
  id: number;
  codigo: string;
  descricao: string;
  ativo?: boolean;
  coordenacao?: CoordenacaoModelBasico;
}

export interface CoordenacaoModelBasico {
  id: number;
  codigo: string;
  descricao: string;
  ativo?: boolean;
}

export interface PeriodoAcaoModelBasico {
  id: number;
  codigo: string;
  periodo?: PeriodoModelBasico;
  acao?: AcaoModelBasico;
}

export interface EstatisticaModelBasico {
  id: number;
  codigo: string;
  periodoAcao?: PeriodoAcaoModelBasico;
  equipamento?: EquipamentoModelBasico;
  quantidade: number;
  observacao?: string;
}

export interface EstatisticaFormularioItemModel {
  periodoAcaoId: number;
  estatisticaCodigo?: string;
  pergunta: string;
  quantidade: number;
  observacao?: string;
}

export interface EstatisticaFormularioModel {
  equipamentoId: number;
  periodoId: number;
  /** Indica se já existe cadastro para este equipamento e período (apenas atualização). */
  jaPossuiCadastro?: boolean;
  perguntas: EstatisticaFormularioItemModel[];
}

export interface PeriodoAcaoCoordenacaoAgrupadoModel {
  coordenacao?: CoordenacaoModelBasico | null;
  itens: PeriodoAcaoModelBasico[];
}

export interface PeriodoAcaoPeriodoAgrupadoModel {
  periodo?: PeriodoModelBasico;
  coordenacoes: PeriodoAcaoCoordenacaoAgrupadoModel[];
}

export interface PeriodoAcaoAnoAgrupadoModel {
  ano: number;
  periodos: PeriodoAcaoPeriodoAgrupadoModel[];
}

export interface PeriodoModelBasico {
  id: number;
  codigo: string;
  mes: number;
  ano: number;
  descricao?: string;
}

export interface EquipamentoModelBasico {
  id: number;
  codigo: string;
  nome: string;
  quantidadeCidadaosVinculados?: number;
  status?: StatusEquipamento;
  capacidade?: number;
  horarioFuncionamento?: string;
  tipoEquipamento?: TipoEquipamentoModelBasico;
  coordenacao?: CoordenacaoModelBasico;
  endereco?: EnderecoModel;
}

export interface TipoServicoModelBasico {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo?: boolean;
  categoria?: CategoriaModelBasico;
}

export interface ServicoModelBasico {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo?: boolean;
  tipoServico?: TipoServicoModelBasico;
}

export interface EquipamentoServicoModelBasico {
  id: number;
  codigo: string;
  equipamento?: EquipamentoModelBasico;
  servico?: ServicoModelBasico;
  mes?: number;
  ano?: number;
}

export interface EquipamentoServicoCidadaoModelBasico {
  id: number;
  codigo: string;
  equipamentoServico?: EquipamentoServicoModelBasico;
  cidadao?: CidadaoModelBasico;
}

export interface EquipamentoServicoCidadaoInput {
  equipamentoServicoCodigo: string;
  cidadaoCodigo: string;
}

export interface CidadaoModelBasico {
  id: number;
  codigo: string;
  nome: string;
  nomeSocial?: string;
  cpf?: string;
  nomeMae?: string;
  dataNascimento?: string;
  sexo?: Sexo;
  genero?: GeneroModelBasico;
  orientacaoSexual?: OrientacaoSexualModelBasico;
  racaCor?: RacaCor;
  etnia?: EtniaModelBasico;
  telefone?: string;
  celular?: string;
  email?: string;
  endereco?: EnderecoModel;
}

export interface TipoAcolhimentoModelBasico {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
}

export interface AcolhimentoModelBasico {
  id: number;
  codigo: string;
  equipamento?: EquipamentoModelBasico;
  cidadao?: CidadaoModelBasico;
  tipoAcolhimento?: TipoAcolhimentoModelBasico;
  dataEntrada?: string;
  dataSaida?: string;
  motivo?: string;
  status?: StatusAcolhimento;
  observacoes?: string;
}

// --- Inputs (request) - módulo ---
export interface TipoEquipamentoInput {
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface CategoriaInput {
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface OrgaoVaptVuptInput {
  /** Ausente no POST = backend gera automaticamente. Incluir no PUT ao editar. */
  idOrgaoOrigem?: number;
  descricao?: string;
  ativo?: boolean;
}

export interface GeneroInput {
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface CargoInput {
  descricao: string;
  ativo?: boolean;
}

export interface ServicoCaminhaoInput {
  descricao: string;
  ativo?: boolean;
}

export interface ServicoVaptVuptInput {
  descricao: string;
  idOrigem?: number;
  ativo?: boolean;
}

export interface PartidoPoliticoInput {
  descricao: string;
  sigla: string;
  ativo?: boolean;
}

export interface AutoridadeInput {
  nome: string;
  apelido?: string;
  ativo?: boolean;
  cargoId: number;
  partidoPoliticoId: number;
  /** Opcional; apenas municípios do Ceará (API valida). */
  municipioId?: number | null;
}

export interface OrganogramaInput {
  nome: string;
  tipo: string;
  descricao?: string;
  sigla?: string;
  ordem?: number;
  ativo?: boolean;
  parentCodigo?: string | null;
}

export interface DemandaMunicipioInput {
  descricao: string;
  municipioId: number;
  autoridadeId: number;
  dataPrevistaAtendimento: string;
  /** Na criação a API ignora e usa SOLICITADO. Na edição, opcional (só ATENDIDO ou REPRIMIDO). */
  status?: StatusDemandaMunicipio;
}

export interface EtniaInput {
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface OrientacaoSexualInput {
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface AcaoInput {
  descricao: string;
  ativo?: boolean;
  coordenacaoId?: number;
}

export interface CoordenacaoInput {
  descricao: string;
  ativo?: boolean;
}

export interface PeriodoAcaoInput {
  periodoId: number;
  acaoId: number;
}

export interface EstatisticaInput {
  periodoAcaoId: number;
  equipamentoId: number;
  quantidade: number;
  observacao?: string;
}

export interface EstatisticaFormularioItemInput {
  periodoAcaoId: number;
  quantidade: number;
  observacao?: string;
}

export interface EstatisticaFormularioInput {
  equipamentoId: number;
  periodoId: number;
  itens: EstatisticaFormularioItemInput[];
}

export interface PeriodoAcaoReplicacaoInput {
  coordenacaoId: number;
  periodoOrigemId: number;
  periodoDestinoId: number;
}

export interface PeriodoAcaoReplicacaoResultadoModel {
  periodoOrigemId: number;
  periodoDestinoId: number;
  totalAcoesOrigem: number;
  criados: number;
  ignoradosDuplicidade: number;
  ignoradosInativos: number;
}

export interface PeriodoInput {
  mes: number;
  ano: number;
}

export interface EquipamentoInput {
  nome: string;
  status: StatusEquipamento;
  capacidade?: number;
  horarioFuncionamento?: string;
  tipoEquipamentoId: number;
  coordenacaoId?: number;
  endereco: EnderecoInput;
}

export interface TipoServicoInput {
  nome: string;
  descricao?: string;
  ativo?: boolean;
  categoriaId?: number | null;
}

export interface ServicoInput {
  nome: string;
  descricao?: string;
  ativo?: boolean;
  tipoServicoId: number;
}

export interface EquipamentoServicoInput {
  equipamentoCodigo: string;
  servicoCodigo: string;
  mes: number;
  ano: number;
}

/** Copia serviços ofertados (e vínculos de cidadãos) de um período para outro no mesmo equipamento. */
export interface CopiarEquipamentoServicoPeriodoInput {
  equipamentoCodigo: string;
  mesOrigem: number;
  anoOrigem: number;
  mesDestino: number;
  anoDestino: number;
}

export interface CopiarEquipamentoServicoPeriodoResultadoModel {
  servicosCopiados: number;
  servicosAtualizados: number;
  vinculosCidadaosCopiados: number;
  vinculosCidadaosRemovidos: number;
}

export interface CmicFolhaModelBasico {
  id: number;
  codigo: string;
  mes: number;
  ano: number;
  /** Valor total da folha (nível competência). */
  valorFolha?: number;
  itens?: CmicFolhaMunicipioItemModel[];
}

export interface CmicFolhaResumoModel {
  codigo: string;
  mes: number;
  ano: number;
  quantidadeMunicipios: number;
  totalBeneficiarios: number;
}

export interface CmicFolhaMunicipioItemModel {
  id: number;
  municipio?: MunicipioModelBasico;
  quantidadeBeneficiarios: number;
}

export interface CmicFolhaInput {
  mes: number;
  ano: number;
  /** Se omitido, a API grava zero. */
  valorFolha?: number;
  itens: CmicFolhaItemInput[];
}

export interface CmicFolhaItemInput {
  municipioCodigo: string;
  quantidadeBeneficiarios: number;
}

/** Atendimento VAPT VUPT (Projetos). */
export interface VaptVuptAtendimentoModelBasico {
  id: number;
  codigo: string;
  mes: number;
  ano: number;
  /** ISO-8601 local (ex.: `2026-04-27T15:30:00`). */
  dataHoraAtendimento?: string;
  equipamento?: EquipamentoModelBasico;
}

export interface VaptVuptAtendimentoInput {
  mes: number;
  ano: number;
  dataHoraAtendimento: string;
  equipamentoCodigo: string;
}

/** Quantificação de usuários atendidos por atendimento VAPT VUPT, órgão e serviço (ids de origem). */
export interface VaptVuptAtendimentoCidadaoModelBasico {
  id: number;
  codigo: string;
  vaptVuptAtendimento?: VaptVuptAtendimentoModelBasico;
  idOrgao: number;
  idServico: number;
  quantidadeUsuariosAtendidas?: number;
  /** Preenchido pela API a partir de `idOrgao` (cadastro de órgão). */
  orgaoVaptVupt?: OrgaoVaptVuptModelBasico;
  /** Preenchido pela API a partir de `idServico` (cadastro de serviço, `idOrigem`). */
  servicoVaptVupt?: ServicoVaptVuptModelBasico;
}

export interface VaptVuptAtendimentoCidadaoFilter {
  atendimentoCodigo?: string;
  idOrgao?: number;
  idServico?: number;
}

export interface VaptVuptAtendimentoTotalUsuariosModel {
  atendimentoCodigo: string;
  totalUsuarios: number;
}

/** Listagem consolidada da página VAPT VUPT (um request). */
export interface VaptVuptAtendimentoListagemModel {
  atendimentos: VaptVuptAtendimentoModelBasico[];
  totaisPorAtendimento: VaptVuptAtendimentoTotalUsuariosModel[];
}

export interface VaptVuptDashboardItemModel {
  label: string;
  total: number;
}

export interface VaptVuptDashboardMesModel {
  mesAno: string;
  totalAtendimentos: number;
  totalUsuarios: number;
}

export interface VaptVuptDashboardResumoModel {
  totalAtendimentos: number;
  totalUsuariosAtendidos: number;
  totalEquipamentosComAtendimento: number;
  equipamentoComMaisAtendimentos: VaptVuptDashboardItemModel;
  atendimentosPorEquipamento: VaptVuptDashboardItemModel[];
  mediaUsuariosPorAtendimentoEquipamento: VaptVuptDashboardItemModel[];
  orgaosMaisAtendimentos: VaptVuptDashboardItemModel[];
  servicosMaisAtendimentos: VaptVuptDashboardItemModel[];
  orgaoServicoMaisDemandados: VaptVuptDashboardItemModel[];
  atendimentosPorDiaSemana: VaptVuptDashboardItemModel[];
  atendimentosPorFaixaHorario: VaptVuptDashboardItemModel[];
  evolucaoMensal: VaptVuptDashboardMesModel[];
}

/** Origem dos KPIs do dashboard Vapt Vupt (schema analítico vs. agregação on-read). */
export type VaptVuptDashboardFonte = 'CONSOLIDADO' | 'ON_READ';

export interface VaptVuptDashboardMetaModel {
  fonte: VaptVuptDashboardFonte;
  consolidacaoCodigo?: string | null;
  publicadoEm?: string | null;
  versaoRegra?: string | null;
}

/** Resposta CQRS do dashboard: métricas + metadados da consolidação. */
export interface VaptVuptDashboardResponseModel {
  resumo: VaptVuptDashboardResumoModel;
  meta: VaptVuptDashboardMetaModel;
}

export interface CasaCidadaoAtendimentoModelBasico {
  id?: number;
  codigo: string;
  cidadao?: CidadaoModelBasico;
  servicoVaptVupt?: ServicoVaptVuptModelBasico;
  dataAtendimento?: string;
}

export interface CasaCidadaoAtendimentoInput {
  cidadaoCodigo: string;
  servicoVaptVuptCodigo: string;
  dataAtendimento: string;
}

export interface CaminhaoCidadaoAtendimentoModelBasico {
  id?: number;
  codigo: string;
  cidadao?: CidadaoModelBasico;
  servicoCaminhao?: ServicoCaminhaoModelBasico;
  equipamento?: EquipamentoModelBasico;
  municipio?: MunicipioModelBasico;
  dataAtendimento?: string;
}

export interface CaminhaoCidadaoAtendimentoInput {
  cidadaoCodigo: string;
  servicoCaminhaoCodigo: string;
  equipamentoCodigo: string;
  municipioCodigo: string;
  dataAtendimento: string;
}

export interface CasaCidadaoDashboardItemModel {
  label: string;
  total: number;
}

export interface CasaCidadaoDashboardMesModel {
  ano: number;
  mes: number;
  totalAtendimentos: number;
  totalCidadaos: number;
}

export interface CasaCidadaoDashboardResumoModel {
  totalAtendimentos: number;
  totalCidadaosDistintos: number;
  mediaAtendimentosPorDia: number;
  cidadaosSexoMasculino?: number;
  cidadaosSexoFeminino?: number;
  cidadaosSexoNaoInformado?: number;
  servicosMaisSolicitados: CasaCidadaoDashboardItemModel[];
  atendimentosPorDiaSemana: CasaCidadaoDashboardItemModel[];
  evolucaoMensal: CasaCidadaoDashboardMesModel[];
}

export type CasaCidadaoDashboardFonte = 'CONSOLIDADO' | 'ON_READ';

export interface CasaCidadaoDashboardMetaModel {
  fonte: CasaCidadaoDashboardFonte;
  consolidacaoCodigo?: string | null;
  publicadoEm?: string | null;
  versaoRegra?: string | null;
}

export interface CasaCidadaoDashboardResponseModel {
  resumo: CasaCidadaoDashboardResumoModel;
  meta: CasaCidadaoDashboardMetaModel;
}

export interface CaminhaoCidadaoDashboardItemModel {
  label: string;
  total: number;
}

export interface CaminhaoCidadaoDashboardMesModel {
  ano: number;
  mes: number;
  totalAtendimentos: number;
  totalCidadaos: number;
}

export interface CaminhaoCidadaoDashboardResumoModel {
  totalAtendimentos: number;
  totalCidadaosDistintos: number;
  mediaAtendimentosPorDia: number;
  cidadaosSexoMasculino?: number;
  cidadaosSexoFeminino?: number;
  cidadaosSexoNaoInformado?: number;
  servicosMaisSolicitados: CaminhaoCidadaoDashboardItemModel[];
  atendimentosPorDiaSemana: CaminhaoCidadaoDashboardItemModel[];
  evolucaoMensal: CaminhaoCidadaoDashboardMesModel[];
}

export type CaminhaoCidadaoDashboardFonte = 'CONSOLIDADO' | 'ON_READ';

export interface CaminhaoCidadaoDashboardMetaModel {
  fonte: CaminhaoCidadaoDashboardFonte;
  consolidacaoCodigo?: string | null;
  publicadoEm?: string | null;
  versaoRegra?: string | null;
}

export interface CaminhaoCidadaoDashboardResponseModel {
  resumo: CaminhaoCidadaoDashboardResumoModel;
  meta: CaminhaoCidadaoDashboardMetaModel;
}

export interface VaptVuptConsolidacaoModel {
  codigo: string;
  codigoCarga?: string | null;
  status: string;
  escopo: string;
  versaoRegra?: string | null;
  publicadoEm?: string | null;
  duracaoMs?: number | null;
  mensagemErro?: string | null;
}

export interface CearaSemFomeFolhaModelBasico {
  id: number;
  codigo: string;
  mes: number;
  ano: number;
  itens?: CearaSemFomeFolhaMunicipioItemModel[];
}

export interface CearaSemFomeFolhaResumoModel {
  codigo: string;
  mes: number;
  ano: number;
  quantidadeMunicipios: number;
  totalBeneficiarios: number;
  totalValorBeneficiarios: number;
}

export interface CearaSemFomeFolhaMunicipioItemModel {
  id: number;
  municipio?: MunicipioModelBasico;
  quantidadeBeneficiarios: number;
  valorBeneficiarios: number;
}

export interface CearaSemFomeFolhaInput {
  mes: number;
  ano: number;
  itens: CearaSemFomeFolhaItemInput[];
}

export interface CearaSemFomeFolhaItemInput {
  municipioCodigo: string;
  quantidadeBeneficiarios: number;
  valorBeneficiarios: number;
}

export interface ValeGasEdicaoModelBasico {
  id: number;
  codigo: string;
  mes: number;
  ano: number;
  /** Valor do voucher na edição (nível competência). */
  valorVoucher?: number;
  itens?: ValeGasEdicaoMunicipioItemModel[];
}

export interface ValeGasEdicaoResumoModel {
  codigo: string;
  mes: number;
  ano: number;
  quantidadeMunicipios: number;
  totalBeneficiarios: number;
}

export interface ValeGasEdicaoMunicipioItemModel {
  id: number;
  municipio?: MunicipioModelBasico;
  quantidadeBeneficiarios: number;
}

export interface ValeGasEdicaoInput {
  mes: number;
  ano: number;
  /** Se omitido, a API grava zero. */
  valorVoucher?: number;
  itens: ValeGasEdicaoItemInput[];
}

export interface ValeGasEdicaoItemInput {
  municipioCodigo: string;
  quantidadeBeneficiarios: number;
}

export interface DemonstrativoAnoModelBasico {
  id: number;
  codigo: string;
  ano: number;
  itens?: DemonstrativoAnoMunicipioItemModel[];
}

export interface DemonstrativoAnoResumoModel {
  codigo: string;
  ano: number;
  quantidadeMunicipios: number;
  totalBe: number;
  totalPaif: number;
  totalPaefi: number;
}

export interface DemonstrativoAnoMunicipioItemModel {
  id: number;
  municipio?: MunicipioModelBasico;
  quantidadeBeneficiarios: number;
  totalBeItem15?: number | null;
  totalPaifItem15?: number | null;
  totalPaefiItem15?: number | null;
}

export interface DemonstrativoAnoInput {
  ano: number;
  itens: DemonstrativoAnoItemInput[];
}

export interface DemonstrativoAnoItemInput {
  municipioCodigo: string;
  quantidadeBeneficiarios: number;
  totalBeItem15?: number | null;
  totalPaifItem15?: number | null;
  totalPaefiItem15?: number | null;
}

export interface CidadaoInput {
  nome: string;
  nomeSocial?: string;
  cpf?: string;
  /** Obrigatório no cadastro/edição de cidadão. */
  nomeMae: string;
  /** ISO-8601 (ex.: data + T00:00:00Z). Obrigatório no cadastro/edição. */
  dataNascimento: string;
  sexo?: Sexo;
  generoId?: number;
  orientacaoSexualId?: number;
  racaCor?: RacaCor;
  etniaId?: number;
  telefone?: string;
  /** Obrigatório no cadastro/edição de cidadão (API valida). */
  celular: string;
  email?: string;
  endereco?: EnderecoInput;
}

/** Funcionário vinculado a um equipamento (CRUD aninhado em `/equipamentos/{codigo}/funcionarios`). */
export interface FuncionarioEquipamentoModelBasico {
  id: number;
  codigo: string;
  nome: string;
  nomeSocial?: string;
  cpf?: string;
  nomeMae?: string;
  dataNascimento?: string;
  sexo?: Sexo;
  genero?: GeneroModelBasico;
  orientacaoSexual?: OrientacaoSexualModelBasico;
  racaCor?: RacaCor;
  etnia?: EtniaModelBasico;
  telefone?: string;
  celular?: string;
  email?: string;
  endereco?: EnderecoModel;
  /** Indica se há foto no servidor (GET .../funcionarios/{cod}/foto). */
  temFoto?: boolean;
}

export interface FuncionarioEquipamentoInput {
  nome: string;
  nomeSocial?: string;
  cpf?: string;
  nomeMae?: string;
  dataNascimento?: string;
  sexo?: Sexo;
  generoId?: number;
  orientacaoSexualId?: number;
  racaCor?: RacaCor;
  etniaId?: number;
  telefone?: string;
  celular?: string;
  email?: string;
  endereco: EnderecoInput;
}

export interface TipoAcolhimentoInput {
  nome: string;
  descricao?: string;
}

export interface AcolhimentoInput {
  equipamentoId: number;
  cidadaoId: number;
  tipoAcolhimentoId: number;
  dataEntrada: string;
  dataSaida?: string;
  motivo?: string;
  status: StatusAcolhimento;
  observacoes?: string;
}

// --- Filters (query params) - módulo ---
export interface TipoEquipamentoFilter {
  nome?: string;
  ativo?: boolean;
  page?: number;
  size?: number;
}

export interface CategoriaFilter {
  nome?: string;
  ativo?: boolean;
  page?: number;
  size?: number;
}

export interface OrgaoVaptVuptFilter {
  idOrgaoOrigem?: number;
  descricao?: string;
  ativo?: boolean;
  page?: number;
  size?: number;
}

export interface GeneroFilter {
  nome?: string;
  ativo?: boolean;
  page?: number;
  size?: number;
}

export interface CargoFilter {
  descricao?: string;
  ativo?: boolean;
  page?: number;
  size?: number;
}

export interface ServicoCaminhaoFilter {
  descricao?: string;
  ativo?: boolean;
  page?: number;
  size?: number;
}

export interface ServicoVaptVuptFilter {
  descricao?: string;
  idOrigem?: number;
  ativo?: boolean;
  page?: number;
  size?: number;
}

export interface PartidoPoliticoFilter {
  descricao?: string;
  sigla?: string;
  ativo?: boolean;
  page?: number;
  size?: number;
}

export interface AutoridadeFilter {
  nome?: string;
  apelido?: string;
  ativo?: boolean;
  cargoId?: number;
  partidoPoliticoId?: number;
  municipioId?: number;
  page?: number;
  size?: number;
}

export interface OrganogramaFilter {
  nome?: string;
  tipo?: string;
  ativo?: boolean;
  page?: number;
  size?: number;
}

export interface DemandaMunicipioFilter {
  descricao?: string;
  municipioId?: number;
  status?: StatusDemandaMunicipio;
  page?: number;
  size?: number;
}

export interface EtniaFilter {
  nome?: string;
  ativo?: boolean;
  page?: number;
  size?: number;
}

export interface OrientacaoSexualFilter {
  nome?: string;
  ativo?: boolean;
  page?: number;
  size?: number;
}

export interface AcaoFilter {
  descricao?: string;
  ativo?: boolean;
  coordenacaoId?: number;
  page?: number;
  size?: number;
}

export interface CoordenacaoFilter {
  descricao?: string;
  ativo?: boolean;
  page?: number;
  size?: number;
}

export interface PeriodoAcaoFilter {
  periodoId?: number;
  acaoId?: number;
  descricaoAcao?: string;
  page?: number;
  size?: number;
}

export interface EstatisticaFilter {
  equipamentoId?: number;
  periodoId?: number;
  periodoAcaoId?: number;
  coordenacaoId?: number;
  page?: number;
  size?: number;
}

export interface ContextoCoordenacaoModel {
  coordenacaoId: number | null;
}

export interface PeriodoFilter {
  mes?: number;
  ano?: number;
  descricao?: string;
  page?: number;
  size?: number;
}

export interface EquipamentoFilter {
  nome?: string;
  tipoEquipamentoId?: number;
  coordenacaoId?: number;
  status?: string;
  page?: number;
  size?: number;
}

export interface ServicoFilter {
  nome?: string;
  tipoServicoId?: number;
  ativo?: boolean;
  page?: number;
  size?: number;
}

export interface EquipamentoServicoFilter {
  equipamentoId?: number;
  equipamentoCodigo?: string;
  servicoId?: number;
  servicoCodigo?: string;
  mes?: number;
  ano?: number;
  page?: number;
  size?: number;
}

export interface CidadaoFilter {
  nome?: string;
  cpf?: string;
  /** Busca unificada: nome e/ou CPF no mesmo termo (preferir em telas de listagem). */
  busca?: string;
  page?: number;
  size?: number;
}

export interface TipoAcolhimentoFilter {
  nome?: string;
  page?: number;
  size?: number;
}

export interface AcolhimentoFilter {
  equipamentoId?: number;
  cidadaoId?: number;
  status?: string;
  page?: number;
  size?: number;
}

// --- Dashboard ---
export interface DashboardGrupoContagemModel {
  label: string;
  total: number;
}

export interface DashboardSerieMensalModel {
  mesAno: string; // "MM/yyyy"
  total: number;
}

export interface DashboardStatsModel {
  stats: Record<string, number>;
  equipamentosPorTipo?: DashboardGrupoContagemModel[];
  equipamentosPorStatus?: DashboardGrupoContagemModel[];
  equipamentosPorCoordenacao?: DashboardGrupoContagemModel[];
  acolhimentosPorTipo?: DashboardGrupoContagemModel[];
  acolhimentosPorStatus?: DashboardGrupoContagemModel[];
  acolhimentosPorMes?: DashboardSerieMensalModel[];
  estatisticasPorMes?: DashboardSerieMensalModel[];
  equipamentoServicosPorCategoria?: DashboardGrupoContagemModel[];
  equipamentoServicosPorTipoServico?: DashboardGrupoContagemModel[];
  equipamentoServicosPorServico?: DashboardGrupoContagemModel[];
  cidadaosDistintosVinculadosServicos?: number;
  cidadaosDistintosPorServico?: DashboardGrupoContagemModel[];
  cidadaosSexoMasculino?: number;
  cidadaosSexoFeminino?: number;
  cidadaosSexoNaoInformado?: number;
}

export interface DashboardPreferenciaItemModel {
  widgetId: string;
  visivel: boolean;
  ordem: number;
}

export interface DashboardPreferenciaItemInput {
  widgetId: string;
  visivel: boolean;
  ordem: number;
}

/** Resposta de GET /dashboard/programas-sociais */
export interface DashboardProgramasSociaisFiltros {
  programa: string;
  municipioCodigoIbge?: number | null;
  mes?: number | null;
  ano?: number | null;
}

export interface DashboardProgramasSociaisItemPrograma {
  programa: string;
  programaLabel: string;
  pessoas: number;
  valorPago: number;
}

export interface DashboardProgramasSociaisItemBeneficiarioUnicoPrograma {
  programa: string;
  programaLabel: string;
  totalBeneficiariosUnicos: number;
}

/** Detalhe por programa (evolução mensal, município, etc.). */
export interface DashboardProgramasSociaisItemProgramaMes {
  programa: string;
  programaLabel: string;
  pessoas: number;
  valorPago: number;
}

export interface DashboardProgramasSociaisItemMunicipio {
  codigoIbge?: number | null;
  municipioNome: string;
  pessoas: number;
  valorPago: number;
  porPrograma?: DashboardProgramasSociaisItemProgramaMes[];
}

export interface DashboardProgramasSociaisItemMes {
  mes: number;
  ano: number;
  mesAno: string;
  pessoas: number;
  valorPago: number;
  /** Quando ausente (API antiga), o front pode usar só os totais. */
  porPrograma?: DashboardProgramasSociaisItemProgramaMes[];
}

export interface DashboardProgramasSociaisModel {
  filtrosAplicados: DashboardProgramasSociaisFiltros;
  totalPessoasContempladas: number;
  totalValorPago: number;
  beneficiariosUnicosTotaisPorPrograma?: DashboardProgramasSociaisItemBeneficiarioUnicoPrograma[];
  porPrograma: DashboardProgramasSociaisItemPrograma[];
  porMunicipio: DashboardProgramasSociaisItemMunicipio[];
  evolucaoMensal: DashboardProgramasSociaisItemMes[];
}

export interface RelatorioTipoDisponivelModel {
  id: string;
  titulo: string;
  descricao: string;
  rotaFrontend: string;
  disponivel: boolean;
  podeGerarPdf: boolean;
  permiteModoNormal: boolean;
  permiteModoAnonimizado: boolean;
}

export interface RelatorioDashboardOpcaoModel {
  id: string;
  label: string;
  podeGerar: boolean;
}

export interface RelatorioCidadaoLinhaModel {
  cpf: string;
  nome: string;
  genero: string;
  telefone: string;
  email: string;
}

export interface RelatorioCidadaoResumoModel {
  titulo: string;
  subtitulo: string;
  dataEmissao: string;
  total: number;
  homens: number;
  mulheres: number;
  naoInformado: number;
  itens: RelatorioCidadaoLinhaModel[];
}
