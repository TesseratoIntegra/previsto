/**
 * Utilitários para formatação de dados
 */

/**
 * Formata números com separadores de milhares
 * @param {number|string} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais (padrão: 2)
 * @returns {string} - Número formatado
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0';
  }

  return numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Formata percentuais
 * @param {number|string} value - Valor em percentual
 * @param {number} decimals - Número de casas decimais (padrão: 1)
 * @returns {string} - Percentual formatado
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || value === '') {
    return '0%';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0%';
  }

  return `${numValue.toFixed(decimals)}%`;
};

/**
 * Formata valores monetários em Real brasileiro
 * @param {number|string} value - Valor monetário
 * @param {number} decimals - Número de casas decimais (padrão: 2)
 * @returns {string} - Valor formatado em R$
 */
export const formatCurrency = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') {
    return 'R$ 0,00';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return 'R$ 0,00';
  }

  return numValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Formata datas para formato brasileiro
 * @param {string|Date} date - Data a ser formatada
 * @param {boolean} includeTime - Se deve incluir horário (padrão: false)
 * @returns {string} - Data formatada
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) {
    return '-';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return dateObj.toLocaleDateString('pt-BR', options);
};

/**
 * Formata códigos de produto removendo espaços e padronizando
 * @param {string} code - Código do produto
 * @returns {string} - Código formatado
 */
export const formatProductCode = (code) => {
  if (!code) {
    return '-';
  }

  return code.toString().trim().toUpperCase();
};

/**
 * Formata descrições limitando caracteres e adicionando reticências
 * @param {string} description - Descrição a ser formatada
 * @param {number} maxLength - Tamanho máximo (padrão: 50)
 * @returns {string} - Descrição formatada
 */
export const formatDescription = (description, maxLength = 50) => {
  if (!description) {
    return '-';
  }

  const cleanDescription = description.toString().trim();
  
  if (cleanDescription.length <= maxLength) {
    return cleanDescription;
  }

  return `${cleanDescription.substring(0, maxLength)}...`;
};

/**
 * Formata status com texto amigável
 * @param {string} status - Status do estoque
 * @returns {object} - Objeto com texto e classe CSS
 */
export const formatStatus = (status) => {
  const statusMap = {
    'DISPONIVEL': {
      text: 'Disponível',
      className: 'status--success'
    },
    'BAIXO_ESTOQUE': {
      text: 'Baixo Estoque',
      className: 'status--warning'
    },
    'SEM_ESTOQUE': {
      text: 'Sem Estoque',
      className: 'status--danger'
    },
    'ALTA_RESERVA': {
      text: 'Alta Reserva',
      className: 'status--info'
    }
  };

  return statusMap[status] || {
    text: 'N/A',
    className: 'status--default'
  };
};

/**
 * Remove caracteres especiais e espaços extras
 * @param {string} text - Texto a ser limpo
 * @returns {string} - Texto limpo
 */
export const cleanText = (text) => {
  if (!text) {
    return '';
  }

  return text.toString().trim().replace(/\s+/g, ' ');
};

/**
 * Valida se um valor é um número válido
 * @param {any} value - Valor a ser validado
 * @returns {boolean} - Se é um número válido
 */
export const isValidNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return false;
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(numValue) && isFinite(numValue);
};

/**
 * Converte string para número seguro
 * @param {string|number} value - Valor a ser convertido
 * @param {number} defaultValue - Valor padrão se conversão falhar
 * @returns {number} - Número convertido ou valor padrão
 */
export const toNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(numValue) ? defaultValue : numValue;
};