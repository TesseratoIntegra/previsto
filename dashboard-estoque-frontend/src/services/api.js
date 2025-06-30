// services/api.js - VERSÃO ATUALIZADA PARA NOVA ESTRUTURA

const API_BASE_URL = 'http://192.168.0.77:8003/api/v1';

const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * 🔄 Função auxiliar para requisições
 */
const makeRequest = async (url, options = {}) => {
  try {
    console.log(`🔄 Requisição: ${url}`);
    
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro HTTP ${response.status}:`, errorText);
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ ${data.results?.length || 0} registros recebidos`);
    return data;
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    throw new Error(`Falha na comunicação: ${error.message}`);
  }
};

/**
 * 📦 Buscar dados de estoque (SB2 com B1_DESC integrado)
 */
export const fetchEstoqueData = async (params = {}) => {
  const { 
    page = 1, 
    page_size = 100, 
    filial = '', 
    local = '',
    codigo = ''
  } = params;
  
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: Math.min(page_size, 1000).toString(),
    });

    if (filial) queryParams.append('B2_FILIAL', filial);
    if (local) queryParams.append('B2_LOCAL', local);
    if (codigo) queryParams.append('B2_COD', codigo);

    const url = `${API_BASE_URL}/stocks/?${queryParams}`;
    const response = await makeRequest(url);

    return {
      success: true,
      data: response.results || [],
      pagination: {
        count: response.count,
        next: response.next,
        previous: response.previous,
        current_page: page,
        total_pages: Math.ceil((response.count || 0) / page_size)
      }
    };
  } catch (error) {
    console.error('Erro ao buscar estoque:', error);
    throw error;
  }
};

/**
 * 🔄 Buscar movimentações (SD3)
 */
export const fetchMovimentacoesData = async (params = {}) => {
  const { 
    page = 1, 
    page_size = 1000, 
    filial = '', 
    local = '',
    codigo = '',
    data_inicio = '',
    data_fim = ''
  } = params;
  
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: Math.min(page_size, 1000).toString(),
      ordering: '-D3_EMISSAO' // Mais recente primeiro
    });

    if (filial) queryParams.append('D3_FILIAL', filial);
    if (local) queryParams.append('D3_LOCAL', local);
    if (codigo) queryParams.append('D3_COD', codigo);
    if (data_inicio) queryParams.append('D3_EMISSAO__gte', data_inicio);
    if (data_fim) queryParams.append('D3_EMISSAO__lte', data_fim);

    const url = `${API_BASE_URL}/stock-moviments/?${queryParams}`;
    const response = await makeRequest(url);

    return {
      success: true,
      data: response.results || [],
      pagination: {
        count: response.count,
        next: response.next,
        previous: response.previous,
        current_page: page,
        total_pages: Math.ceil((response.count || 0) / page_size)
      }
    };
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    throw error;
  }
};

/**
 * 🏢 Buscar filiais disponíveis
 */
export const fetchFiliais = async () => {
  try {
    console.log('🔄 Carregando filiais...');
    
    const response = await fetchEstoqueData({ page_size: 1000 });
    const filiais = [...new Set(
      response.data
        .map(item => item.B2_FILIAL)
        .filter(filial => filial && filial.trim() !== '')
    )].sort();
    
    console.log(`✅ ${filiais.length} filiais encontradas:`, filiais);
    
    return {
      success: true,
      filiais
    };
  } catch (error) {
    console.error('Erro ao buscar filiais:', error);
    return { success: false, filiais: [] };
  }
};

/**
 * 🏪 Buscar locais disponíveis
 */
export const fetchLocais = async (filial = '') => {
  try {
    console.log(`🔄 Carregando locais${filial ? ` da filial ${filial}` : ''}...`);
    
    const response = await fetchEstoqueData({ filial, page_size: 1000 });
    const locais = [...new Set(
      response.data
        .map(item => item.B2_LOCAL)
        .filter(local => local && local.trim() !== '')
    )].sort();
    
    console.log(`✅ ${locais.length} locais encontrados:`, locais);
    
    return {
      success: true,
      locais
    };
  } catch (error) {
    console.error('Erro ao buscar locais:', error);
    return { success: false, locais: [] };
  }
};

/**
 * 🔄 Buscar todas as páginas
 */
const fetchAllPages = async (fetchFunction, params = {}) => {
  const allData = [];
  let currentPage = 1;
  let hasNextPage = true;

  console.log(`🔄 Carregando todas as páginas...`);

  while (hasNextPage && currentPage <= 50) { // Limite de segurança
    try {
      const response = await fetchFunction({
        ...params,
        page: currentPage,
        page_size: 1000
      });

      if (response.success && response.data?.length > 0) {
        allData.push(...response.data);
        console.log(`📄 Página ${currentPage}: ${response.data.length} registros`);
      }

      hasNextPage = !!response.pagination?.next;
      currentPage++;
    } catch (error) {
      console.error(`❌ Erro na página ${currentPage}:`, error);
      break;
    }
  }

  console.log(`✅ Total carregado: ${allData.length} registros`);
  return allData;
};

/**
 * 📊 Processar dados diretos do backend - VERSÃO ATUALIZADA CONFORME ESPECIFICAÇÃO
 */
const processarDados = (estoqueData, movimentacoesData = []) => {
  console.log('🔄 Processando dados conforme nova especificação...');
  console.log(`📦 ${estoqueData.length} registros SB2 (estoque)`);
  console.log(`🔄 ${movimentacoesData.length} movimentações SD3 (período já filtrado pelo backend)`);
  
  // ⚙️ CONFIGURAÇÃO DO PERÍODO (deve vir do backend, mas assumindo 4 meses por enquanto)
  const PERIODO_MESES = 4; // TODO: Buscar do backend ou configurar
  
  // Mapear consumo por chave filial+codigo+local das movimentações já filtradas
  const consumoPorProduto = new Map();
  const tiposSaida = ['RE1', '010', '600', '999', '499', '501', '502', 'DE0', 'DE1', 'DE2'];
  
  console.log('🔍 Processando movimentações SD3 (já filtradas por período no backend)...');
  
  movimentacoesData.forEach((mov, index) => {
    const codigo = mov.D3_COD;
    const filial = mov.D3_FILIAL || '';
    const local = mov.D3_LOCAL || '';
    const quantidade = Number(mov.D3_QUANT) || 0;
    const tm = mov.D3_TM;
    
    // Debug das primeiras movimentações
    if (index < 5) {
      console.log(`   Mov ${index + 1}: ${filial}-${codigo}-${local} | TM: ${tm} | Quant: ${quantidade} | Data: ${mov.D3_EMISSAO}`);
    }
    
    // Verificar se é movimento de saída
    if (tiposSaida.includes(tm) && quantidade > 0 && codigo && filial) {
      const chave = `${filial.trim()}-${codigo.trim()}-${local.trim()}`;
      
      if (!consumoPorProduto.has(chave)) {
        consumoPorProduto.set(chave, 0);
      }
      
      consumoPorProduto.set(chave, consumoPorProduto.get(chave) + quantidade);
    }
  });
  
  console.log(`📤 ${consumoPorProduto.size} produtos únicos com consumo (SD3 já filtrada)`);
  
  // Debug: mostrar produtos com mais consumo
  if (consumoPorProduto.size > 0) {
    const topConsumo = Array.from(consumoPorProduto.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    console.log('🏆 Top 5 produtos com mais consumo:');
    topConsumo.forEach(([chave, consumo]) => {
      console.log(`   ${chave}: ${consumo} unidades`);
    });
  }
  
  // Processar registros SB2 conforme nova especificação
  const dadosProcessados = estoqueData.map((item, index) => {
    // 📦 DADOS DIRETOS DA SB2 (conforme especificação)
    const codigo = (item.B2_COD || '').toString().trim();
    const filial = (item.B2_FILIAL || '').toString().trim();
    const local = (item.B2_LOCAL || '').toString().trim();
    const produto = (item.B1_DESC || `Produto ${codigo}`).toString().trim(); // B1_DESC já vem integrada
    const estoque = Number(item.B2_QATU) || 0;
    const reservado = Number(item.B2_RESERVA) || 0;
    const emPedido = Number(item.B2_QPEDVEN) || 0;
    
    // Debug dos primeiros registros
    if (index < 3) {
      console.log(`📦 SB2 ${index + 1}: ${filial}-${codigo}-${local} | Produto: "${produto}" | Estoque: ${estoque}`);
    }
    
    // 🔄 CONSUMO DAS MOVIMENTAÇÕES (período já filtrado pelo backend)
    const chave = `${filial}-${codigo}-${local}`;
    const consumo = consumoPorProduto.get(chave) || 0;
    
    // 📊 CONSUMO MÉDIO (conforme especificação: consumo/período)
    const consumoMedio = consumo > 0 ? consumo / PERIODO_MESES : 0;
    
    // 📈 COBERTURA (conforme especificação: estoque/consumo_medio)
    let cobertura = 0;
    if (consumoMedio > 0) {
      cobertura = estoque / consumoMedio;
    } else if (estoque > 0) {
      cobertura = Infinity; // Estoque sem movimento
    }
    
    // 🎯 STATUS (mantendo regra atual)
    let status = 'ADEQUADO';
    let prioridade = 'BAIXA';
    
    if (consumo === 0) {
      status = 'SEM MOVIMENTO';
      prioridade = 'BAIXA';
    } else if (cobertura < 1) {
      status = 'CRÍTICO';
      prioridade = 'ALTA';
    } else if (cobertura < 2) {
      status = 'BAIXO';  
      prioridade = 'MÉDIA';
    } else if (cobertura > 6) {
      status = 'EXCESSO';
      prioridade = 'BAIXA';
    }
    
    // 💡 SUGESTÃO (conforme especificação: (consumo_medio * periodo) - estoque)
    const estoqueIdeal = consumoMedio * PERIODO_MESES; // Consumo médio * período
    const sugestaoAbastecimento = Math.max(0, estoqueIdeal - estoque);
    
    // Debug para produto específico
    if (codigo === '000000688') {
      console.log(`🔍 DEBUG produto ${codigo}:`);
      console.log(`   SB2: Filial=${filial} | Local=${local} | Estoque=${estoque} | Produto="${produto}"`);
      console.log(`   SD3: Chave=${chave} | Consumo Total=${consumo} | Consumo Médio=${consumoMedio.toFixed(2)}`);
      console.log(`   Calc: Cobertura=${cobertura === Infinity ? '∞' : cobertura.toFixed(1)} meses | Status=${status}`);
      console.log(`   Sugestão: Estoque Ideal=${estoqueIdeal.toFixed(1)} | Sugestão=${sugestaoAbastecimento.toFixed(1)}`);
    }
    
    return {
      // 📦 DADOS DIRETOS DA SB2 (conforme especificação)
      codigo,
      produto,
      filial,
      local,
      estoque,
      reservado,
      emPedido,
      
      // 🔄 DADOS CALCULADOS CONFORME NOVA ESPECIFICAÇÃO
      consumo,                    // Total no período filtrado (direto do backend SD3)
      consumoMedio,               // consumo/período (nova coluna)
      cobertura,                  // estoque/consumo_medio
      
      // 📊 ANÁLISE E CLASSIFICAÇÃO (regras mantidas)
      status,
      prioridade,
      sugestaoAbastecimento,      // (consumo_medio * periodo) - estoque
      
      // 📈 METADADOS
      periodoMeses: PERIODO_MESES // Para referência
    };
  });
  
  console.log(`✅ ${dadosProcessados.length} registros processados conforme nova especificação`);
  
  // Estatísticas finais
  const comMovimento = dadosProcessados.filter(item => item.consumo > 0).length;
  const semMovimento = dadosProcessados.filter(item => item.consumo === 0).length;
  
  console.log(`📊 Resultado: ${comMovimento} produtos COM movimento | ${semMovimento} produtos SEM movimento`);
  
  return dadosProcessados;
};

/**
 * 📊 Carregar todos os dados
 */
export const fetchAllDashboardData = async (params = {}) => {
  const { filial = '', local = '' } = params;
  
  try {
    console.log('🔄 Carregando todos os dados...');
    
    // Buscar dados em paralelo
    const [estoqueData, movimentacoesData] = await Promise.all([
      fetchAllPages(fetchEstoqueData, { filial, local }),
      fetchAllPages(fetchMovimentacoesData, { filial, local })
    ]);
    
    console.log('📊 Dados carregados:');
    console.log(`   - Estoque: ${estoqueData.length} registros`);
    console.log(`   - Movimentações: ${movimentacoesData.length} registros`);
    
    const dadosProcessados = processarDados(estoqueData, movimentacoesData);
    
    return {
      success: true,
      estoque: estoqueData,
      movimentacoes: movimentacoesData,
      processedData: dadosProcessados,
      totals: {
        estoque: estoqueData.length,
        movimentacoes: movimentacoesData.length
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    throw error;
  }
};

/**
 * 🔗 Testar conexão
 */
export const testApiConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/?page_size=1`);
    return response.ok;
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return false;
  }
};

// Exports para compatibilidade com sistema anterior
export const fetchDashboardData = fetchAllDashboardData;
export const fetchEstoque = fetchEstoqueData;
export const fetchVendasData = () => { 
  console.warn('⚠️ fetchVendasData descontinuado - use fetchMovimentacoesData'); 
  return Promise.resolve({ success: false, data: [] }); 
};