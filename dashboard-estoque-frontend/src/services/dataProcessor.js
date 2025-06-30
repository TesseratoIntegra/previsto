import * as XLSX from 'xlsx';

/**
 * Processa dados de estoque e vendas para gerar análise
 * @param {Object|File} estoqueData Dados de estoque ou arquivo
 * @param {Object|File} vendasData Dados de vendas ou arquivo
 * @returns {Promise<Array>} Dados processados
 */
export const processData = async (estoqueData, vendasData) => {
  console.log('=== INICIANDO PROCESSAMENTO ===');
  console.log('Estoque file:', estoqueData);
  console.log('Vendas file:', vendasData);
  
  // Se os dados são arquivos, precisamos processá-los primeiro
  if (estoqueData instanceof File && vendasData instanceof File) {
    console.log('Processando arquivos...');
    
    const [processedEstoque, processedVendas] = await Promise.all([
      processEstoqueFile(estoqueData),
      processVendasFile(vendasData)
    ]);
    
    console.log('Estoque processado:', processedEstoque);
    console.log('Vendas processadas:', processedVendas);
    
    return combineData(processedEstoque, processedVendas);
  }
  
  // Se os dados já estão processados, apenas combinamos
  return combineData(estoqueData, vendasData);
};

/**
 * Processa arquivo de estoque
 * @param {File} file Arquivo de estoque
 * @returns {Promise<Object>} Dados de estoque normalizados
 */
const processEstoqueFile = async (file) => {
  try {
    console.log('--- PROCESSANDO ARQUIVO DE ESTOQUE ---');
    console.log('Nome do arquivo:', file.name);
    console.log('Tamanho:', file.size, 'bytes');
    
    const data = await parseFile(file);
    console.log('Dados brutos do estoque (primeiras 3 linhas):', data.slice(0, 3));
    console.log('Total de linhas no estoque:', data.length);
    
    const normalized = normalizeEstoqueData(data);
    console.log('Dados normalizados do estoque:', normalized);
    console.log('Quantidade de produtos no estoque:', Object.keys(normalized).length);
    
    return normalized;
  } catch (error) {
    console.error('Erro ao processar arquivo de estoque:', error);
    throw new Error('Erro ao processar arquivo de estoque: ' + error.message);
  }
};

/**
 * Processa arquivo de vendas
 * @param {File} file Arquivo de vendas
 * @returns {Promise<Array>} Dados de vendas normalizados
 */
const processVendasFile = async (file) => {
  try {
    console.log('--- PROCESSANDO ARQUIVO DE VENDAS ---');
    console.log('Nome do arquivo:', file.name);
    console.log('Tamanho:', file.size, 'bytes');
    
    const data = await parseFile(file);
    console.log('Dados brutos das vendas (primeiras 3 linhas):', data.slice(0, 3));
    console.log('Total de linhas nas vendas:', data.length);
    
    const normalized = normalizeVendasData(data);
    console.log('Dados normalizados das vendas:', normalized);
    console.log('Quantidade de registros de vendas:', normalized.length);
    
    return normalized;
  } catch (error) {
    console.error('Erro ao processar arquivo de vendas:', error);
    throw new Error('Erro ao processar arquivo de vendas: ' + error.message);
  }
};

/**
 * Parse de arquivo baseado na extensão (CSV ou Excel)
 * @param {File} file Arquivo a ser parseado
 * @returns {Promise<Array>} Dados parseados
 */
const parseFile = (file) => {
  return new Promise((resolve, reject) => {
    const fileName = file.name.toLowerCase();
    console.log('Fazendo parse do arquivo:', fileName);
    
    if (fileName.endsWith('.csv')) {
      console.log('Detectado como CSV');
      // Processar CSV
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          console.log('Conteúdo CSV lido (primeiros 500 chars):', content.substring(0, 500));
          const data = parseCSV(content);
          console.log('CSV parseado com sucesso, linhas:', data.length);
          resolve(data);
        } catch (error) {
          console.error('Erro no parse CSV:', error);
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo CSV'));
      reader.readAsText(file);
      
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      console.log('Detectado como Excel');
      // Processar Excel
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          console.log('Dados binários lidos, tamanho:', data.length);
          const excelData = parseExcel(data);
          console.log('Excel parseado com sucesso, linhas:', excelData.length);
          resolve(excelData);
        } catch (error) {
          console.error('Erro no parse Excel:', error);
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo Excel'));
      reader.readAsArrayBuffer(file);
      
    } else {
      reject(new Error('Formato de arquivo não suportado. Use .csv, .xlsx ou .xls'));
    }
  });
};

/**
 * Parse CSV
 * @param {string} content Conteúdo do arquivo CSV
 * @returns {Array} Dados parseados
 */
const parseCSV = (content) => {
  console.log('--- PARSE CSV ---');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('Arquivo CSV está vazio');
  }
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  console.log('Headers CSV:', headers);
  
  const data = lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row = {};
    
    headers.forEach((header, headerIndex) => {
      row[header] = values[headerIndex] || '';
    });
    
    if (index < 3) {
      console.log(`Linha ${index + 1}:`, row);
    }
    
    return row;
  });
  
  console.log('CSV parseado com', data.length, 'linhas');
  return data;
};

/**
 * Parse Excel usando XLSX
 * @param {Uint8Array} data Dados binários do arquivo Excel
 * @returns {Array} Dados parseados
 */
const parseExcel = (data) => {
  try {
    console.log('--- PARSE EXCEL ---');
    
    // Ler o workbook
    const workbook = XLSX.read(data, { 
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false
    });
    
    console.log('Workbook lido. Planilhas disponíveis:', workbook.SheetNames);
    
    // Pegar a primeira planilha
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log('Usando planilha:', sheetName);
    
    // Usar método de array de arrays para melhor controle
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      raw: false
    });
    
    console.log('Dados brutos (primeiras 5 linhas):', rawData.slice(0, 5));
    
    if (rawData.length === 0) {
      throw new Error('Planilha Excel está vazia');
    }
    
    // Encontrar a linha de headers (primeira linha que tem dados relevantes)
    let headerRowIndex = -1;
    let headers = [];
    
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row = rawData[i];
      if (row && row.length > 0) {
        // Verificar se esta linha parece ser um header
        const hasHeaders = row.some(cell => 
          cell && typeof cell === 'string' && (
            cell.toLowerCase().includes('produto') ||
            cell.toLowerCase().includes('codigo') ||
            cell.toLowerCase().includes('codpro') ||
            cell.toLowerCase().includes('descr') ||
            cell.toLowerCase().includes('saldo') ||
            cell.toLowerCase().includes('estoque') ||
            cell.toLowerCase().includes('quant') ||
            cell.toLowerCase().includes('valor')
          )
        );
        
        if (hasHeaders) {
          headerRowIndex = i;
          headers = row.filter(cell => cell && cell.trim() !== '');
          console.log(`Headers encontrados na linha ${i}:`, headers);
          break;
        }
      }
    }
    
    if (headerRowIndex === -1) {
      // Se não encontrou headers específicos, usar a primeira linha não vazia
      for (let i = 0; i < rawData.length; i++) {
        if (rawData[i] && rawData[i].length > 0 && rawData[i].some(cell => cell)) {
          headerRowIndex = i;
          headers = rawData[i];
          console.log(`Usando linha ${i} como headers:`, headers);
          break;
        }
      }
    }
    
    if (headerRowIndex === -1 || headers.length === 0) {
      throw new Error('Não foi possível encontrar headers válidos no Excel');
    }
    
    // Converter para array de objetos
    const jsonData = [];
    
    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;
      
      const obj = {};
      headers.forEach((header, index) => {
        if (header && header.trim() !== '') {
          obj[header.trim()] = (row[index] || '').toString().trim();
        }
      });
      
      // Só adicionar se a linha tem pelo menos um valor
      if (Object.values(obj).some(value => value && value !== '')) {
        jsonData.push(obj);
      }
    }
    
    console.log('Excel processado:', jsonData.length, 'linhas de dados');
    console.log('Headers finais:', headers);
    console.log('Primeiras 3 linhas processadas:', jsonData.slice(0, 3));
    
    return jsonData;
    
  } catch (error) {
    console.error('Erro detalhado no parse Excel:', error);
    throw new Error(`Erro ao processar Excel: ${error.message}`);
  }
};

/**
 * Normaliza dados de estoque - ATUALIZADO PARA SUPORTAR B2_DPROD
 * @param {Array} data Dados brutos de estoque
 * @returns {Object} Dados normalizados indexados por código
 */
const normalizeEstoqueData = (data) => {
  console.log('--- NORMALIZANDO DADOS DE ESTOQUE ---');
  const normalized = {};
  
  if (!Array.isArray(data) || data.length === 0) {
    console.log('Dados de estoque vazios ou inválidos');
    return normalized;
  }
  
  console.log('Primeira linha para análise de colunas:', data[0]);
  console.log('Colunas disponíveis:', Object.keys(data[0]));
  
  // Detectar automaticamente as colunas corretas
  const columns = Object.keys(data[0]);
  let codigoCol = null;
  let descricaoCol = null;
  let saldoCol = null;
  
  columns.forEach(col => {
    const colLower = col.toLowerCase();
    
    // Detectar coluna de código
    if (!codigoCol && (
      colLower.includes('produto') || 
      colLower.includes('codpro') || 
      colLower.includes('codigo') ||
      colLower === 'sb2' ||
      colLower.includes('cod') ||
      colLower.includes('b2_cod')  // ← SUPORTE PARA SB2
    )) {
      codigoCol = col;
    }
    
    // Detectar coluna de descrição - ATUALIZADO
    if (!descricaoCol && (
      colLower.includes('descr') || 
      colLower.includes('nome') || 
      colLower.includes('produtop') ||
      colLower.includes('descricao') ||
      colLower.includes('b1_desc')  // ← DESCRIÇÃO INTEGRADA DA SB1 NA SB2
    )) {
      descricaoCol = col;
    }
    
    // Detectar coluna de saldo/estoque
    if (!saldoCol && (
      colLower.includes('saldo') || 
      colLower.includes('estoque') ||
      colLower.includes('atual') ||
      colLower.includes('b2_qatu')  // ← SUPORTE PARA SB2
    )) {
      saldoCol = col;
    }
  });
  
  console.log('Colunas detectadas:');
  console.log('- Código:', codigoCol);
  console.log('- Descrição:', descricaoCol, '← PODE SER B1_DESC integrada');
  console.log('- Saldo:', saldoCol);
  
  data.forEach((row, index) => {
    const codigo = codigoCol ? row[codigoCol] : null;
    const descricao = descricaoCol ? row[descricaoCol] : '';
    const saldo = saldoCol ? parseFloat(row[saldoCol]) || 0 : 0;
    
    if (index < 3) {
      console.log(`Linha ${index}: codigo=${codigo}, descricao=${descricao}, saldo=${saldo}`);
    }
    
    if (codigo && codigo !== null && codigo !== '' && codigo !== 'Produto') {
      normalized[codigo] = {
        codigo,
        descricao,
        saldo
      };
    }
  });
  
  console.log('Produtos normalizados:', Object.keys(normalized).length);
  console.log('Primeiros 3 produtos:', Object.values(normalized).slice(0, 3));
  
  return normalized;
};

/**
 * Normaliza dados de vendas
 * @param {Array} data Dados brutos de vendas
 * @returns {Array} Dados normalizados de vendas
 */
const normalizeVendasData = (data) => {
  console.log('--- NORMALIZANDO DADOS DE VENDAS ---');
  const vendas = [];
  
  if (!Array.isArray(data) || data.length === 0) {
    console.log('Dados de vendas vazios ou inválidos');
    return vendas;
  }
  
  console.log('Primeira linha para análise de colunas:', data[0]);
  console.log('Colunas disponíveis:', Object.keys(data[0]));
  
  // Detectar automaticamente as colunas corretas
  const columns = Object.keys(data[0]);
  let codigoCol = null;
  let descricaoCol = null;
  let quantidadeCol = null;
  let valorCol = null;
  
  columns.forEach(col => {
    const colLower = col.toLowerCase();
    
    // Detectar coluna de código
    if (!codigoCol && (
      colLower.includes('codpro') || 
      colLower.includes('codigo') ||
      colLower === 'codpro'
    )) {
      codigoCol = col;
    }
    
    // Detectar coluna de descrição
    if (!descricaoCol && (
      colLower.includes('descrpro') || 
      colLower.includes('descricao') ||
      colLower.includes('descr')
    )) {
      descricaoCol = col;
    }
    
    // Detectar coluna de quantidade
    if (!quantidadeCol && (
      colLower.includes('quant') ||
      colLower.includes('qtd') ||
      colLower === 'quantidade'
    )) {
      quantidadeCol = col;
    }
    
    // Detectar coluna de valor
    if (!valorCol && (
      colLower.includes('valor') || 
      colLower.includes('vlrtotal') ||
      colLower.includes('total') ||
      colLower.includes('preco')
    )) {
      valorCol = col;
    }
  });
  
  console.log('Colunas detectadas:');
  console.log('- Código:', codigoCol);
  console.log('- Descrição:', descricaoCol);
  console.log('- Quantidade:', quantidadeCol);
  console.log('- Valor:', valorCol);
  
  data.forEach((row, index) => {
    const codigo = codigoCol ? row[codigoCol] : null;
    const descricao = descricaoCol ? row[descricaoCol] : '';
    const quantidade = quantidadeCol ? parseFloat(row[quantidadeCol]) || 0 : 0;
    const valor = valorCol ? parseFloat(row[valorCol]) || 0 : 0;
    
    if (index < 3) {
      console.log(`Linha ${index}: codigo=${codigo}, descricao=${descricao}, quantidade=${quantidade}, valor=${valor}`);
    }
    
    if (codigo && codigo !== null && codigo !== '' && codigo !== 'CODPRO' && codigo !== 'ITEMPRO') {
      vendas.push({
        codigo,
        descricao,
        quantidade,
        valor
      });
    }
  });
  
  console.log('Registros de vendas normalizados:', vendas.length);
  console.log('Primeiros 3 registros:', vendas.slice(0, 3));
  
  return vendas;
};

/**
 * Combina dados de estoque e vendas
 * @param {Object} estoqueData Dados normalizados de estoque
 * @param {Array} vendasData Dados normalizados de vendas
 * @returns {Array} Dados combinados e processados
 */
const combineData = (estoqueData, vendasData) => {
  console.log('--- COMBINANDO DADOS ---');
  console.log('Produtos no estoque:', Object.keys(estoqueData).length);
  console.log('Registros de vendas:', vendasData.length);
  
  // Agregar vendas por código de produto
  const vendasAgregadas = {};
  
  vendasData.forEach(venda => {
    const { codigo, quantidade, valor } = venda;
    
    if (!vendasAgregadas[codigo]) {
      vendasAgregadas[codigo] = {
        codigo,
        descricao: venda.descricao,
        quantidade: 0,
        valor: 0
      };
    }
    
    vendasAgregadas[codigo].quantidade += quantidade;
    vendasAgregadas[codigo].valor += valor;
  });
  
  console.log('Produtos com vendas agregadas:', Object.keys(vendasAgregadas).length);
  
  // Calcular métricas e combinar dados
  const combined = [];
  const mesesAnalise = 4; // Padrão: 4 meses
  const coberturaIdeal = 2; // Padrão: 2 meses
  
  // Calcular valor total de vendas para PDV
  const valorTotalVendas = Object.values(vendasAgregadas).reduce((sum, venda) => sum + venda.valor, 0);
  console.log('Valor total de vendas:', valorTotalVendas);
  
  // Processar dados de vendas
  Object.values(vendasAgregadas).forEach(venda => {
    const codigo = venda.codigo;
    const estoqueInfo = estoqueData[codigo] || { codigo, descricao: venda.descricao, saldo: 0 };
    
    const vendaTotal = venda.quantidade;
    const valorTotal = venda.valor;
    const mediaMensal = vendaTotal / mesesAnalise;
    const estoque = estoqueInfo.saldo;
    const pdv = (valorTotal / valorTotalVendas) * 100;
    const cobertura = mediaMensal > 0 ? estoque / mediaMensal : 0;
    const estoqueIdeal = Math.ceil(mediaMensal * coberturaIdeal);
    const sugestaoAbastecimento = Math.max(0, estoqueIdeal - estoque);
    
    // Determinar status do estoque
    let status = 'ADEQUADO';
    if (cobertura < 1) {
      status = 'CRÍTICO';
    } else if (cobertura < 2) {
      status = 'BAIXO';
    } else if (cobertura > 3) {
      status = 'EXCESSO';
    }
    
    // Determinar prioridade de abastecimento
    let prioridade = 'BAIXA';
    if (status === 'CRÍTICO') {
      prioridade = 'ALTA';
    } else if (status === 'BAIXO') {
      prioridade = 'MÉDIA';
    }
    
    combined.push({
      codigo,
      produto: estoqueInfo.descricao,
      vendaTotal,
      valorTotal,
      mediaMensal,
      estoque,
      pdv,
      cobertura,
      estoqueIdeal,
      sugestaoAbastecimento,
      status,
      prioridade
    });
  });
  
  // Adicionar produtos que estão no estoque mas não têm vendas
  Object.values(estoqueData).forEach(item => {
    if (!vendasAgregadas[item.codigo]) {
      combined.push({
        codigo: item.codigo,
        produto: item.descricao,
        vendaTotal: 0,
        valorTotal: 0,
        mediaMensal: 0,
        estoque: item.saldo,
        pdv: 0,
        cobertura: item.saldo > 0 ? Infinity : 0,
        estoqueIdeal: 0,
        sugestaoAbastecimento: 0,
        status: 'SEM VENDAS',
        prioridade: 'BAIXA'
      });
    }
  });
  
  console.log('Dados finais combinados:', combined.length, 'produtos');
  console.log('Primeiros 3 produtos combinados:', combined.slice(0, 3));
  
  return combined;
};