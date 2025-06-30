import React, { useState, useEffect, useMemo } from 'react';
import './Dashboard.scss';
import Header from '../Header/Header';
import ProductTable from '../ProductTable/ProductTable';
import FilterPanel from '../FilterPanel/FilterPanel';
import { fetchAllDashboardData, testApiConnection } from '../../services/api';

const Dashboard = () => {
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  
  // ✅ PAGINAÇÃO LOCAL PARA PERFORMANCE
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 100;
  
  // ✅ FILTROS SIMPLIFICADOS
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    filial: '',
    local: '',
    hideSemMovimento: false
  });
  
  const [filteredData, setFilteredData] = useState([]);

  // ✅ MÉTRICAS SIMPLES E RÁPIDAS
  const metrics = useMemo(() => {
    if (!processedData || !Array.isArray(processedData)) return null;
    
    return {
      totalProdutos: processedData.length,
      totalEstoque: processedData.reduce((sum, item) => sum + (item.estoque || 0), 0),
      totalConsumo: processedData.reduce((sum, item) => sum + (item.consumo || 0), 0),
      totalSugestao: processedData.reduce((sum, item) => sum + (item.sugestaoAbastecimento || 0), 0)
    };
  }, [processedData]);

  // ✅ STATUS SUMMARY SIMPLIFICADO
  const statusSummary = useMemo(() => {
    if (!processedData || !Array.isArray(processedData)) return null;
    
    const summary = processedData.reduce((acc, item) => {
      const status = item.status || 'ADEQUADO';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      critico: summary['CRÍTICO'] || 0,
      baixo: summary['BAIXO'] || 0,
      adequado: summary['ADEQUADO'] || 0,
      excesso: summary['EXCESSO'] || 0,
      semMovimento: summary['SEM MOVIMENTO'] || 0
    };
  }, [processedData]);

  // Testar conexão na inicialização
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await testApiConnection();
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      } catch (error) {
        setConnectionStatus('disconnected');
      }
    };
    
    checkConnection();
  }, []);

  // Carregar dados do backend
  const loadDataFromBackend = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Carregando dados do backend...');
      const response = await fetchAllDashboardData(params);
      
      if (response.success) {
        setProcessedData(response.processedData);
        console.log(`✅ ${response.processedData.length} produtos carregados`);
      } else {
        throw new Error('Erro ao processar dados do backend');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do servidor: ' + err.message);
      setLoading(false);
    }
  };

  // ✅ FILTROS OTIMIZADOS (sem debounce complexo)
  useEffect(() => {
    if (!processedData || !Array.isArray(processedData)) return;

    let filtered = processedData;

    // Filtro de busca simples
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item => {
        const codigo = (item.codigo || '').toString().toLowerCase();
        const produto = (item.produto || '').toString().toLowerCase();
        return codigo.includes(searchTerm) || produto.includes(searchTerm);
      });
    }

    // Filtros categóricos
    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    if (filters.filial) {
      filtered = filtered.filter(item => item.filial === filters.filial);
    }

    if (filters.local) {
      filtered = filtered.filter(item => item.local === filters.local);
    }

    // Filtro sem movimento
    if (filters.hideSemMovimento) {
      filtered = filtered.filter(item => (item.consumo || 0) > 0);
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset para página 1 quando filtrar
  }, [processedData, filters]);

  // ✅ DADOS PAGINADOS PARA PERFORMANCE
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  // ✅ INFO DE PAGINAÇÃO
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    return {
      current_page: currentPage,
      total_pages: totalPages,
      count: filteredData.length,
      page_size: ITEMS_PER_PAGE,
      start_item: (currentPage - 1) * ITEMS_PER_PAGE + 1,
      end_item: Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)
    };
  }, [filteredData.length, currentPage]);

  // Carregar dados automaticamente na inicialização
  useEffect(() => {
    if (connectionStatus === 'connected') {
      loadDataFromBackend();
    }
  }, [connectionStatus]);

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return '#28a745';
      case 'disconnected': return '#dc3545';
      default: return '#ffc107';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return '🟢 Conectado';
      case 'disconnected': return '🔴 Desconectado';
      default: return '🟡 Verificando...';
    }
  };

  // ✅ HANDLERS DE PAGINAÇÃO
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll suave para o topo da tabela
    document.querySelector('.product-table-container')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  const handlePageSizeChange = (newSize) => {
    // Para futuras expansões, por enquanto fixo em 100
    console.log('Page size change:', newSize);
  };

  return (
    <div className="dashboard">
      <Header title="Dashboard de Estoque - Protheus" />
      
      {/* Status de conexão */}
      <div className="connection-status" style={{ color: getStatusColor(connectionStatus) }}>
        {getStatusText(connectionStatus)}
        {connectionStatus === 'disconnected' && (
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Tentar Novamente
          </button>
        )}
      </div>

      {/* Interface principal */}
      {!processedData ? (
        <div className="loading-section">
          <div className="loading-card">
            <h2>📊 Sistema de Análise de Estoque</h2>
            <p>Conectando com dados do Protheus (SB2 + SD3)...</p>
            
            <button 
              className="load-button"
              onClick={() => loadDataFromBackend()}
              disabled={loading || connectionStatus !== 'connected'}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Carregando dados...
                </>
              ) : (
                '📊 Carregar Dados do Protheus'
              )}
            </button>
            
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      ) : (
        <div className="dashboard-content">
          {/* ✅ MÉTRICAS SIMPLIFICADAS */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">📦</div>
              <div className="metric-content">
                <div className="metric-value">{formatNumber(metrics.totalProdutos)}</div>
                <div className="metric-label">Produtos</div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">🏭</div>
              <div className="metric-content">
                <div className="metric-value">{formatNumber(metrics.totalEstoque)}</div>
                <div className="metric-label">Estoque Total</div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">🔄</div>
              <div className="metric-content">
                <div className="metric-value">{formatNumber(metrics.totalConsumo)}</div>
                <div className="metric-label">Consumo Total</div>
              </div>
            </div>
            
            <div className="metric-card highlight">
              <div className="metric-icon">💡</div>
              <div className="metric-content">
                <div className="metric-value">{formatNumber(metrics.totalSugestao)}</div>
                <div className="metric-label">Sugestão Total</div>
              </div>
            </div>
          </div>

          {/* ✅ STATUS SUMMARY SIMPLIFICADO */}
          <div className="status-summary">
            <h3>📊 Resumo de Status</h3>
            <div className="status-cards">
              <div className="status-card critico">
                <div className="status-header">
                  <span className="status-icon">🚨</span>
                  <span className="status-title">Crítico</span>
                </div>
                <div className="status-value">{statusSummary.critico}</div>
              </div>
              
              <div className="status-card baixo">
                <div className="status-header">
                  <span className="status-icon">⚠️</span>
                  <span className="status-title">Baixo</span>
                </div>
                <div className="status-value">{statusSummary.baixo}</div>
              </div>
              
              <div className="status-card adequado">
                <div className="status-header">
                  <span className="status-icon">✅</span>
                  <span className="status-title">Adequado</span>
                </div>
                <div className="status-value">{statusSummary.adequado}</div>
              </div>
              
              <div className="status-card excesso">
                <div className="status-header">
                  <span className="status-icon">📈</span>
                  <span className="status-title">Excesso</span>
                </div>
                <div className="status-value">{statusSummary.excesso}</div>
              </div>
              
              <div className="status-card sem-movimento">
                <div className="status-header">
                  <span className="status-icon">💤</span>
                  <span className="status-title">Sem Movimento</span>
                </div>
                <div className="status-value">{statusSummary.semMovimento}</div>
              </div>
            </div>
          </div>
          
          {/* ✅ FILTROS SIMPLIFICADOS */}
          <FilterPanel 
            filters={filters} 
            setFilters={setFilters}
            data={processedData}
          />
          
          {/* ✅ TABELA ÚNICA COM PAGINAÇÃO */}
          <div className="tables-section">
            <div className="table-header">
              <h2>📊 Análise de Produtos</h2>
              <div className="pagination-summary">
                Exibindo {paginationInfo.start_item}-{paginationInfo.end_item} de {paginationInfo.count} produtos
                {filteredData.length !== processedData.length && (
                  <span className="filter-active"> (filtrado de {processedData.length} total)</span>
                )}
              </div>
            </div>
            
            <ProductTable 
              data={paginatedData}
              pagination={paginationInfo}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;