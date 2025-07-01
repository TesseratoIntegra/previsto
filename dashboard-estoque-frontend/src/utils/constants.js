// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  DEFAULT_PAGE_SIZE: parseInt(process.env.REACT_APP_DEFAULT_PAGE_SIZE) || 50,
  MAX_PAGE_SIZE: parseInt(process.env.REACT_APP_MAX_PAGE_SIZE) || 1000
};

// Status do Estoque
export const STOCK_STATUS = {
  DISPONIVEL: 'DISPONIVEL',
  BAIXO_ESTOQUE: 'BAIXO_ESTOQUE',
  SEM_ESTOQUE: 'SEM_ESTOQUE',
  ALTA_RESERVA: 'ALTA_RESERVA'
};

// Labels dos Status
export const STOCK_STATUS_LABELS = {
  [STOCK_STATUS.DISPONIVEL]: 'Disponível',
  [STOCK_STATUS.BAIXO_ESTOQUE]: 'Baixo Estoque',
  [STOCK_STATUS.SEM_ESTOQUE]: 'Sem Estoque',
  [STOCK_STATUS.ALTA_RESERVA]: 'Alta Reserva'
};

// Cores dos Status
export const STOCK_STATUS_COLORS = {
  [STOCK_STATUS.DISPONIVEL]: '#10b981',
  [STOCK_STATUS.BAIXO_ESTOQUE]: '#f59e0b',
  [STOCK_STATUS.SEM_ESTOQUE]: '#ef4444',
  [STOCK_STATUS.ALTA_RESERVA]: '#8b5cf6'
};

// Opções de itens por página
export const PAGE_SIZE_OPTIONS = [
  { value: 25, label: '25 itens' },
  { value: 50, label: '50 itens' },
  { value: 100, label: '100 itens' },
  { value: 200, label: '200 itens' },
  { value: 500, label: '500 itens' }
];

// Campos da tabela SB2
export const SB2_FIELDS = {
  B2_FILIAL: 'B2_FILIAL',
  B2_COD: 'B2_COD',
  B2_LOCAL: 'B2_LOCAL',
  B2_QATU: 'B2_QATU',
  B2_RESERVA: 'B2_RESERVA',
  B2_QPEDVEN: 'B2_QPEDVEN'
};

// Campos da tabela SB1 (relacionados)
export const SB1_FIELDS = {
  B1_DESC: 'B1_DESC',
  B1_TIPO: 'B1_TIPO',
  B1_UM: 'B1_UM',
  B1_GRUPO: 'B1_GRUPO'
};

// Campos calculados
export const CALCULATED_FIELDS = {
  SALDO_DISPONIVEL: 'saldo_disponivel',
  PERCENTUAL_RESERVADO: 'percentual_reservado',
  STATUS_ESTOQUE: 'status_estoque'
};

// Endpoints da API
export const API_ENDPOINTS = {
  STOCKS: '/stocks',
  STOCK_MOVEMENTS: '/stocks_moviment',
  SALES: '/sales',
  DELIVERIES: '/deliveries'
};

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
  SERVER_ERROR: 'Erro interno do servidor. Tente novamente em alguns instantes.',
  NOT_FOUND: 'Dados não encontrados.',
  TIMEOUT: 'Timeout na consulta. Tente refinar os filtros.',
  INVALID_PARAMS: 'Parâmetros inválidos. Verifique os filtros aplicados.',
  UNKNOWN_ERROR: 'Erro desconhecido. Tente novamente.'
};

// Configurações de formatação
export const FORMAT_CONFIG = {
  CURRENCY_LOCALE: 'pt-BR',
  CURRENCY_CODE: 'BRL',
  NUMBER_DECIMALS: 2,
  PERCENTAGE_DECIMALS: 1,
  DATE_LOCALE: 'pt-BR',
  TIMEZONE: 'America/Sao_Paulo'
};

// Breakpoints responsivos
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  XXL: '1536px'
};

// Debounce delays
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  RESIZE: 150,
  SCROLL: 100
};

// Local Storage keys
export const STORAGE_KEYS = {
  FILTERS: 'stock_table_filters',
  PAGE_SIZE: 'stock_table_page_size',
  SORT_CONFIG: 'stock_table_sort_config'
};

// Validação
export const VALIDATION = {
  FILIAL_MAX_LENGTH: 2,
  ARMAZEM_MAX_LENGTH: 2,
  PRODUTO_MAX_LENGTH: 15,
  DESCRIPTION_MAX_LENGTH: 100
};