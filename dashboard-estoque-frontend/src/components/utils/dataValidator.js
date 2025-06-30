// utils/dataValidator.js - Validação e sanitização de dados

/**
 * Validar dados de estoque
 * @param {Object} item - Item de estoque
 * @returns {Object} Item validado e sanitizado
 */
export const validateEstoqueItem = (item) => {
  if (!item || typeof item !== 'object') {
    throw new Error('Item de estoque inválido');
  }

  // Validações obrigatórias
  if (!item.B2_COD || typeof item.B2_COD !== 'string') {
    throw new Error('Código do produto é obrigatório');
  }

  if (!item.B2_FILIAL || typeof item.B2_FILIAL !== 'string') {
    throw new Error('Filial é obrigatória');
  }

  if (!item.B2_LOCAL || typeof item.B2_LOCAL !== 'string') {
    throw new Error('Local é obrigatório');
  }

  // Sanitização de dados
  return {
    B2_COD: item.B2_COD.trim().toUpperCase(),
    B2_FILIAL: item.B2_FILIAL.trim(),
    B2_LOCAL: item.B2_LOCAL.trim(),
    B2_QATU: parseFloat(item.B2_QATU) || 0,
    produto_desc: item.produto_desc ? item.produto_desc.trim() : null,
    B2_VATU1: parseFloat(item.B2_VATU1) || 0,
    B2_CM1: parseFloat(item.B2_CM1) || 0
  };
};

/**
 * Validar dados de movimentação
 * @param {Object} item - Item de movimentação
 * @returns {Object} Item validado e sanitizado
 */
export const validateMovimentacaoItem = (item) => {
  if (!item || typeof item !== 'object') {
    throw new Error('Item de movimentação inválido');
  }

  // Validações obrigatórias
  if (!item.D3_COD || typeof item.D3_COD !== 'string') {
    throw new Error('Código do produto é obrigatório');
  }

  if (!item.D3_FILIAL || typeof item.D3_FILIAL !== 'string') {
    throw new Error('Filial é obrigatória');
  }

  if (!item.D3_EMISSAO) {
    throw new Error('Data de emissão é obrigatória');
  }

  // Validar data
  const dataEmissao = new Date(item.D3_EMISSAO);
  if (isNaN(dataEmissao.getTime())) {
    throw new Error('Data de emissão inválida');
  }

  // Sanitização de dados
  return {
    D3_COD: item.D3_COD.trim().toUpperCase(),
    D3_FILIAL: item.D3_FILIAL.trim(),
    D3_LOCAL: item.D3_LOCAL ? item.D3_LOCAL.trim() : '',
    D3_EMISSAO: item.D3_EMISSAO,
    D3_QUANT: parseFloat(item.D3_QUANT) || 0,
    D3_TM: item.D3_TM ? item.D3_TM.trim() : '',
    D3_DOC: item.D3_DOC ? item.D3_DOC.trim() : '',
    D3_CUSTO1: parseFloat(item.D3_CUSTO1) || 0
  };
};

/**
 * Validar dados processados
 * @param {Object} item - Item processado
 * @returns {Object} Item validado
 */
export const validateProcessedItem = (item) => {
  if (!item || typeof item !== 'object') {
    throw new Error('Item processado inválido');
  }

  // Validações obrigatórias
  if (!item.codigo || typeof item.codigo !== 'string') {
    throw new Error('Código do produto é obrigatório');
  }

  // Validar números
  const estoque = parseFloat(item.estoque);
  const consumo = parseFloat(item.consumo);
  const consumoMedio = parseFloat(item.consumoMedio);
  const sugestaoAbastecimento = parseFloat(item.sugestaoAbastecimento);

  if (isNaN(estoque) || estoque < 0) {
    throw new Error('Estoque deve ser um número válido >= 0');
  }

  if (isNaN(consumo) || consumo < 0) {
    throw new Error('Consumo deve ser um número válido >= 0');
  }

  // Validar status
  const statusValidos = ['CRÍTICO', 'BAIXO', 'ADEQUADO', 'EXCESSO', 'SEM MOVIMENTO'];
  if (!statusValidos.includes(item.status)) {
    throw new Error(`Status inválido: ${item.status}`);
  }

  // Validar prioridade
  const prioridadesValidas = ['ALTA', 'MÉDIA', 'BAIXA'];
  if (!prioridadesValidas.includes(item.prioridade)) {
    throw new Error(`Prioridade inválida: ${item.prioridade}`);
  }

  return {
    codigo: item.codigo.trim().toUpperCase(),
    produto: item.produto ? item.produto.trim() : `Produto ${item.codigo}`,
    filial: item.filial ? item.filial.trim() : '',
    local: item.local ? item.local.trim() : '',
    estoque: Math.max(0, estoque),
    consumo: Math.max(0, consumo),
    consumoMedio: Math.max(0, consumoMedio),
    status: item.status,
    prioridade: item.prioridade,
    sugestaoAbastecimento: Math.max(0, sugestaoAbastecimento),
    ultimaMovimentacao: item.ultimaMovimentacao,
    totalMovimentacoes: parseInt(item.totalMovimentacoes) || 0
  };
};

/**
 * Validar array de dados
 * @param {Array} data - Array de dados
 * @param {Function} validator - Função de validação
 * @returns {Array} Array validado
 */
export const validateDataArray = (data, validator) => {
  if (!Array.isArray(data)) {
    throw new Error('Dados devem ser um array');
  }

  const validatedData = [];
  const errors = [];

  data.forEach((item, index) => {
    try {
      const validatedItem = validator(item);
      validatedData.push(validatedItem);
    } catch (error) {
      errors.push({
        index,
        item,
        error: error.message
      });
    }
  });

  if (errors.length > 0) {
    console.warn(`⚠️ ${errors.length} itens com erro foram ignorados:`, errors);
  }

  console.log(`✅ ${validatedData.length} de ${data.length} itens validados com sucesso`);
  
  return validatedData;
};

/**
 * Sanitizar string
 * @param {string} str - String a ser sanitizada
 * @returns {string} String sanitizada
 */
export const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .trim()
    .replace(/\s+/g, ' ') // Múltiplos espaços para um só
    .replace(/[^\w\s\-\.]/g, '') // Remove caracteres especiais
    .substring(0, 255); // Limita tamanho
};

/**
 * Validar e formatar número
 * @param {any} value - Valor a ser formatado
 * @param {number} defaultValue - Valor padrão
 * @returns {number} Número formatado
 */
export const validateNumber = (value, defaultValue = 0) => {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : Math.max(0, num);
};

/**
 * Validar data
 * @param {any} date - Data a ser validada
 * @returns {Date|null} Data válida ou null
 */
export const validateDate = (date) => {
  if (!date) return null;
  
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return null;
  
  // Verificar se a data não é muito antiga (mais de 10 anos)
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  
  if (parsedDate < tenYearsAgo) return null;
  
  return parsedDate;
};

/**
 * Verificar integridade dos dados
 * @param {Object} data - Dados a serem verificados
 * @returns {Object} Relatório de integridade
 */
export const checkDataIntegrity = (data) => {
  const report = {
    isValid: true,
    errors: [],
    warnings: [],
    statistics: {}
  };

  try {
    // Verificar se é objeto válido
    if (!data || typeof data !== 'object') {
      report.isValid = false;
      report.errors.push('Dados não são um objeto válido');
      return report;
    }

    // Verificar propriedades essenciais
    const requiredProperties = ['estoque', 'movimentacoes', 'processedData'];
    requiredProperties.forEach(prop => {
      if (!Array.isArray(data[prop])) {
        report.errors.push(`Propriedade '${prop}' deve ser um array`);
        report.isValid = false;
      }
    });

    if (!report.isValid) return report;

    // Estatísticas
    report.statistics = {
      totalEstoque: data.estoque?.length || 0,
      totalMovimentacoes: data.movimentacoes?.length || 0,
      totalProcessados: data.processedData?.length || 0,
      timestamp: data.timestamp
    };

    // Verificar consistência entre dados
    if (data.estoque.length !== data.processedData.length) {
      report.warnings.push(
        `Divergência entre estoque (${data.estoque.length}) e processados (${data.processedData.length})`
      );
    }

    // Verificar duplicatas em dados processados
    const codigosUnicos = new Set();
    const duplicatas = [];
    
    data.processedData.forEach(item => {
      const key = `${item.filial}-${item.local}-${item.codigo}`;
      if (codigosUnicos.has(key)) {
        duplicatas.push(key);
      } else {
        codigosUnicos.add(key);
      }
    });

    if (duplicatas.length > 0) {
      report.warnings.push(`${duplicatas.length} duplicatas encontradas nos dados processados`);
    }

    // Verificar dados inconsistentes
    const inconsistentes = data.processedData.filter(item => {
      return item.estoque < 0 || 
             item.consumo < 0 || 
             item.consumoMedio < 0 ||
             item.sugestaoAbastecimento < 0;
    });

    if (inconsistentes.length > 0) {
      report.warnings.push(`${inconsistentes.length} itens com dados inconsistentes (valores negativos)`);
    }

    console.log('📊 Relatório de integridade:', report);
    return report;

  } catch (error) {
    report.isValid = false;
    report.errors.push(`Erro na verificação: ${error.message}`);
    return report;
  }
};

// Exportações padrão para facilitar importação
export default {
  validateEstoqueItem,
  validateMovimentacaoItem,
  validateProcessedItem,
  validateDataArray,
  sanitizeString,
  validateNumber,
  validateDate,
  checkDataIntegrity
};