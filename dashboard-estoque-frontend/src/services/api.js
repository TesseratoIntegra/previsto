// services/api.js - VERSÃO CORRIGIDA CONFORME ESPECIFICAÇÃO

const API_BASE_URL = 'http://192.168.0.77:8003/api/v1';

// Cache simples para requisições
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * 🔄 Função auxiliar para requisições com cache e retry
 */
const makeRequest = async (url, options = {}, useCache = false) => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  // Verificar cache
  if (useCache && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`🔄 Cache hit: ${url}`);
      return cached.data;
    } else {
      cache.delete(cacheKey);
    }
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
  
  try {
    console.log(`🔄 Requisição: ${url}`);
    
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro HTTP ${response.status}:`, errorText);
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Armazenar no cache se solicitado
    if (useCache) {
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    }
    
    console.log(`✅ ${data.results?.length || data.length || 'Dados'} recebidos`);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Requisição cancelada por timeout');
    }
    
    console.error('❌ Erro na requisição:', error);
    throw new Error(`Falha na comunicação: ${error.message}`);
  }
};

/**
 * 📦 Buscar dados de estoque - ENDPOINT: /stocks/
 */
export const fetchEstoqueData = async (params = {}) => {
  const { 
    page = 1, 
    page_size = 1000,
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
    const response = await makeRequest(url, {}, true); // Usar cache

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
 * 🔄 Buscar movimentações - ENDPOINT: /stock-moviments/
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
    const response = await makeRequest(url, {}, true); // Usar cache

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
    
    // ⚠️ FALLBACK: Se não conseguir buscar movimentações, retorna array vazio
    console.warn('⚠️ Continuando sem dados de movimentação - apenas com estoque');
    return {
      success: true,
      data: [],
      pagination: {
        count: 0,
        next: null,
        previous: null,
        current_page: 1,
        total_pages: 1
      }
    };
  }
};

/**
 * 🔍 Função para buscar TODOS os dados com paginação automática
 */
const fetchAllPages = async (fetchFunction, baseParams = {}) => {
  const allData = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const response = await fetchFunction({
        ...baseParams,
        page,
        page_size: 1000 // Máximo por requisição
      });
      
      if (response.success && response.data) {
        allData.push(...response.data);
        
        // Verificar se há mais páginas
        hasMore = response.pagination.next !== null;
        page++;
        
        console.log(`📄 Página ${page - 1} carregada: ${response.data.length} registros`);
        
        // Pequeno delay para não sobrecarregar o servidor
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(`Erro na página ${page}:`, error);
      
      // ⚠️ Se for erro de movimentações, continua sem elas
      if (fetchFunction === fetchMovimentacoesData) {
        console.warn('⚠️ Falha ao carregar movimentações - continuando apenas com estoque');
        break;
      }
      hasMore = false;
    }
  }
  
  return allData;
};

/**
 * 🎯 Processamento de dados CONFORME NOVA ESPECIFICAÇÃO
 */
const processarDados = (estoqueData, movimentacoesData = []) => {
  console.log('🔄 Processando dados conforme especificação...');
  console.log(`📦 ${estoqueData.length} registros SB2 (estoque)`);
  console.log(`🔄 ${movimentacoesData.length} movimentações SD3`);
  
  // ⚙️ PERÍODO DE ANÁLISE (deve vir do backend, assumindo 4 meses)
  const PERIODO_MESES = 4; // TODO: Configurar ou buscar do backend
  
  // Debug: Verificar estrutura dos dados SB2
  if (estoqueData.length > 0) {
    const primeiroRegistro = estoqueData[0];
    console.log('🔍 Estrutura SB2 (primeiro registro):', Object.keys(primeiroRegistro));
    console.log('📦 Dados SB2:', primeiroRegistro);
  }
  
  // Mapear consumo por CÓDIGO + FILIAL + LOCAL (soma todas as saídas da mesma combinação)
  const consumoPorProdutoLocal = new Map();
  const tiposSaida = ['RE1', '010', '600', '999', '499', '501', '502', 'DE0', 'DE1', 'DE2'];
  
  console.log('🔍 Processando movimentações SD3 - SOMA POR CÓDIGO+FILIAL+LOCAL...');
  
  movimentacoesData.forEach((mov, index) => {
    const codigo = mov.D3_COD?.toString().trim();
    const filial = mov.D3_FILIAL?.toString().trim();
    const local = mov.D3_LOCAL?.toString().trim();
    const quantidade = Number(mov.D3_QUANT) || 0;
    const tm = mov.D3_TM?.toString().trim();
    
    // Debug das primeiras movimentações
    if (index < 5) {
      console.log(`   SD3 ${index + 1}: ${filial}-${codigo}-${local} | TM: ${tm} | Quant: ${quantidade}`);
    }
    
    // Verificar se é movimento de saída e tem dados válidos
    if (tiposSaida.includes(tm) && quantidade > 0 && codigo && filial && local) {
      const chave = `${filial}-${codigo}-${local}`;
      
      if (!consumoPorProdutoLocal.has(chave)) {
        consumoPorProdutoLocal.set(chave, 0);
      }
      
      const consumoAnterior = consumoPorProdutoLocal.get(chave);
      const novoConsumo = consumoAnterior + quantidade;
      consumoPorProdutoLocal.set(chave, novoConsumo);
      
      // Debug para as primeiras somas
      if (index < 10) {
        console.log(`     ➤ ${chave}: ${consumoAnterior} + ${quantidade} = ${novoConsumo}`);
      }
    }
  });
  
  console.log(`📤 ${consumoPorProdutoLocal.size} combinações únicas (código+filial+local) com consumo`);
  
  // Debug: Top 10 combinações com mais consumo
  if (consumoPorProdutoLocal.size > 0) {
    const topConsumo = Array.from(consumoPorProdutoLocal.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    console.log('🏆 Top 10 combinações com mais consumo:');
    topConsumo.forEach(([chave, consumo], index) => {
      console.log(`   ${index + 1}. ${chave}: ${consumo} unidades`);
    });
  }
  
  // Processar registros SB2 conforme especificação
  const dadosProcessados = estoqueData.map((item, index) => {
    // 📦 DADOS DIRETOS DA SB2 (conforme especificação)
    const codigo = (item.B2_COD || '').toString().trim();
    const filial = (item.B2_FILIAL || '').toString().trim();
    const local = (item.B2_LOCAL || '').toString().trim();
    
    // 🔍 DESCRIÇÃO DO PRODUTO - MÚLTIPLAS TENTATIVAS
    let produto = '';
    
    // Tentar diferentes campos que podem conter a descrição
    if (item.B1_DESC) {
      produto = item.B1_DESC.toString().trim();
    } else if (item.produto_desc) {
      produto = item.produto_desc.toString().trim();
    } else if (item.produto) {
      produto = item.produto.toString().trim();
    } else if (item.descricao) {
      produto = item.descricao.toString().trim();
    } else {
      produto = `Produto ${codigo}`;
    }
    
    // Dados quantitativos SB2
    const estoque = Number(item.B2_QATU) || 0;
    const reservado = Number(item.B2_RESERVA) || 0;
    const emPedido = Number(item.B2_QPEDVEN) || 0;
    
    // Debug dos primeiros registros
    if (index < 3) {
      console.log(`📦 SB2 ${index + 1}: ${filial}-${codigo}-${local}`);
      console.log(`   Produto: "${produto}" (fonte: ${item.B1_DESC ? 'B1_DESC' : item.produto_desc ? 'produto_desc' : 'fallback'})`);
      console.log(`   Estoque: ${estoque} | Reservado: ${reservado} | Em Pedido: ${emPedido}`);
    }
    
    // 🔄 CONSUMO DAS MOVIMENTAÇÕES (SOMA POR CÓDIGO+FILIAL+LOCAL)
    const chave = `${filial}-${codigo}-${local}`;
    const consumo = consumoPorProdutoLocal.get(chave) || 0;
    
    // 📊 CÁLCULOS CONFORME ESPECIFICAÇÃO
    const consumoMedio = consumo > 0 ? consumo / PERIODO_MESES : 0;
    
    // 📈 COBERTURA (estoque/consumo_medio) - conforme especificação
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
    
    // 💡 SUGESTÃO ((consumo_medio * periodo) - estoque) - conforme especificação
    const estoqueIdeal = consumoMedio * PERIODO_MESES;
    const sugestaoAbastecimento = Math.max(0, estoqueIdeal - estoque);
    
    return {
      // 📦 DADOS DIRETOS DA SB2 (conforme especificação)
      codigo,
      produto, // ← CORRIGIDO: Múltiplas fontes para descrição
      filial,
      local,
      estoque,
      reservado, // ← ADICIONADO conforme especificação
      emPedido,  // ← ADICIONADO conforme especificação
      
      // 🔄 DADOS CALCULADOS CONFORME ESPECIFICAÇÃO
      consumo,                    // Total no período (direto do backend SD3)
      consumoMedio,               // consumo/período (nova coluna)
      cobertura: cobertura === Infinity ? 999 : Math.round(cobertura * 10) / 10, // limitado para exibição
      
      // 📊 ANÁLISE E CLASSIFICAÇÃO (regras mantidas)
      status,
      prioridade,
      sugestaoAbastecimento: Math.round(sugestaoAbastecimento),
      
      // 📈 METADADOS
      periodoMeses: PERIODO_MESES
    };
  });
  
  console.log(`✅ ${dadosProcessados.length} registros processados conforme especificação`);
  
  // Estatísticas finais
  const comMovimento = dadosProcessados.filter(item => item.consumo > 0).length;
  const semMovimento = dadosProcessados.filter(item => item.consumo === 0).length;
  
  console.log(`📊 Resultado: ${comMovimento} COM movimento | ${semMovimento} SEM movimento`);
  
  return dadosProcessados;
};

/**
 * 🚀 Função principal otimizada e resiliente
 */
export const fetchAllDashboardData = async () => {
  try {
    console.log('🚀 Iniciando carregamento completo dos dados...');
    const startTime = performance.now();
    
    // Carregar dados de estoque primeiro (obrigatório)
    console.log('📦 Carregando dados de estoque...');
    const estoqueData = await fetchAllPages(fetchEstoqueData);
    
    if (estoqueData.length === 0) {
      throw new Error('Nenhum dado de estoque encontrado');
    }
    
    // Tentar carregar movimentações (opcional)
    console.log('🔄 Carregando dados de movimentações...');
    let movimentacoesData = [];
    
    try {
      movimentacoesData = await fetchAllPages(fetchMovimentacoesData);
      console.log(`✅ ${movimentacoesData.length} movimentações carregadas`);
    } catch (error) {
      console.warn('⚠️ Falha ao carregar movimentações - continuando apenas com estoque:', error.message);
    }
    
    // Processar dados
    const dadosProcessados = processarDados(estoqueData, movimentacoesData);
    
    const endTime = performance.now();
    console.log(`🎉 Carregamento completo em ${Math.round(endTime - startTime)}ms`);
    
    return {
      success: true,
      estoque: estoqueData,
      movimentacoes: movimentacoesData,
      processedData: dadosProcessados,
      totals: {
        estoque: estoqueData.length,
        movimentacoes: movimentacoesData.length,
        processados: dadosProcessados.length
      },
      timestamp: new Date().toISOString(),
      performance: {
        loadTime: Math.round(endTime - startTime),
        cacheHits: cache.size
      },
      warnings: movimentacoesData.length === 0 ? ['Dados de movimentação não disponíveis'] : []
    };
  } catch (error) {
    console.error('❌ Erro ao carregar dados completos:', error);
    throw error;
  }
};

/**
 * 🔗 Testar conexão otimizado
 */
export const testApiConnection = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    const response = await fetch(`${API_BASE_URL}/stocks/?page_size=1`, {
      signal: controller.signal,
      headers: defaultOptions.headers
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return false;
  }
};

/**
 * 🧹 Limpar cache
 */
export const clearCache = () => {
  cache.clear();
  console.log('🧹 Cache limpo');
};

// Exports para compatibilidade
export const fetchDashboardData = fetchAllDashboardData;
export const fetchEstoque = fetchEstoqueData;

// Função descontinuada
export const fetchVendasData = () => { 
  console.warn('⚠️ fetchVendasData descontinuado - use fetchMovimentacoesData'); 
  return Promise.resolve({ success: false, data: [] }); 
};