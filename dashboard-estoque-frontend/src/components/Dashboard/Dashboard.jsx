import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import Header from '../Header/Header';
import VirtualTable from '../VirtualTable/VirtualTable';
import FilterPanel from '../FilterPanel/FilterPanel';
import { fetchAllDashboardData, testApiConnection } from '../../services/api';
import './Dashboard.scss';

const Dashboard = () => {
  // Estados principais
  const [processedData, setProcessedData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Formatação de números memoizada
  const formatNumber = useCallback((value) => {
    if (value === null || value === undefined || value === '') return '0';
    return typeof value === 'number' ? value.toLocaleString('pt-BR') : value.toString();
  }, []);

  // Métricas otimizadas com memoização
  const metrics = useMemo(() => {
    if (!processedData || !Array.isArray(processedData)) {
      return {
        totalProdutos: 0,
        totalEstoque: 0,
        totalConsumo: 0,
        totalSugestao: 0
      };
    }
    
    return processedData.reduce((acc, item) => ({
      totalProdutos: acc.totalProdutos + 1,
      totalEstoque: acc.totalEstoque + (parseFloat(item.estoque) || 0),
      totalConsumo: acc.totalConsumo + (parseFloat(item.consumo) || 0),
      totalSugestao: acc.totalSugestao + (parseFloat(item.sugestaoAbastecimento) || 0)
    }), {
      totalProdutos: 0,
      totalEstoque: 0,
      totalConsumo: 0,
      totalSugestao: 0
    });
  }, [processedData]);

  // Status summary otimizado
  const statusSummary = useMemo(() => {
    if (!processedData || !Array.isArray(processedData)) {
      return {
        critico: 0,
        baixo: 0,
        adequado: 0,
        excesso: 0,
        semMovimento: 0
      };
    }
    
    return processedData.reduce((acc, item) => {
      const status = item.status || 'ADEQUADO';
      switch (status) {
        case 'CRÍTICO':
          acc.critico++;
          break;
        case 'BAIXO':
          acc.baixo++;
          break;
        case 'ADEQUADO':
          acc.adequado++;
          break;
        case 'EXCESSO':
          acc.excesso++;
          break;
        case 'SEM MOVIMENTO':
          acc.semMovimento++;
          break;
        default:
          acc.adequado++;
      }
      return acc;
    }, {
      critico: 0,
      baixo: 0,
      adequado: 0,
      excesso: 0,
      semMovimento: 0
    });
  }, [processedData]);

  // Callback para mudanças nos filtros
  const handleFiltersChange = useCallback((newFilteredData) => {
    setFilteredData(newFilteredData);
  }, []);

  // Função para carregar dados otimizada
  const loadDataFromBackend = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Iniciando carregamento dos dados...');
      const response = await fetchAllDashboardData();
      
      if (response.success && response.processedData) {
        setProcessedData(response.processedData);
        console.log(`✅ ${response.processedData.length} registros carregados com sucesso`);
      } else {
        throw new Error('Dados não foram recebidos corretamente do servidor');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err);
      setError(`Erro ao carregar dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Testar conexão na inicialização
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await testApiConnection();
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        
        if (isConnected) {
          console.log('✅ Conexão com API estabelecida');
        } else {
          console.warn('⚠️ Falha na conexão com API');
        }
      } catch (err) {
        console.error('❌ Erro ao testar conexão:', err);
        setConnectionStatus('error');
      }
    };
    
    checkConnection();
  }, []);

  // Loading inicial ou erro de conexão
  if (connectionStatus === 'checking') {
    return (
      <div className="dashboard">
        <Header title="Dashboard de Estoque" />
        <div className="dashboard-loading">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <h3>Verificando conexão...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="dashboard optimized">
        <Header title="Dashboard de Estoque" />
        
        {!processedData ? (
          <div className="dashboard-welcome">
            <div className="welcome-card">
              <div className="welcome-header">
                <div className="welcome-icon">📊</div>
                <h2>Sistema de Análise de Estoque</h2>
                <p>Conectando com dados do Protheus (SB2 + SD3)</p>
              </div>
              
              <div className="connection-status">
                <div className={`status-indicator ${connectionStatus}`}>
                  <span className="status-dot"></span>
                  <span className="status-text">
                    {connectionStatus === 'connected' ? 'Conectado' : 
                     connectionStatus === 'disconnected' ? 'Desconectado' : 'Erro de conexão'}
                  </span>
                </div>
              </div>
              
              <button 
                className="load-data-btn"
                onClick={loadDataFromBackend}
                disabled={loading || connectionStatus !== 'connected'}
              >
                {loading ? (
                  <>
                    <div className="button-spinner"></div>
                    Carregando dados...
                  </>
                ) : (
                  <>
                    <span className="button-icon">📊</span>
                    Carregar Dados do Protheus
                  </>
                )}
              </button>
              
              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="dashboard-content">
            {/* Métricas principais */}
            <div className="metrics-section">
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon products">📦</div>
                  <div className="metric-content">
                    <div className="metric-value">{formatNumber(metrics.totalProdutos)}</div>
                    <div className="metric-label">Produtos</div>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-icon stock">🏭</div>
                  <div className="metric-content">
                    <div className="metric-value">{formatNumber(metrics.totalEstoque)}</div>
                    <div className="metric-label">Estoque Total</div>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-icon consumption">🔄</div>
                  <div className="metric-content">
                    <div className="metric-value">{formatNumber(metrics.totalConsumo)}</div>
                    <div className="metric-label">Consumo Total</div>
                  </div>
                </div>
                
                <div className="metric-card highlight">
                  <div className="metric-icon suggestion">💡</div>
                  <div className="metric-content">
                    <div className="metric-value">{formatNumber(metrics.totalSugestao)}</div>
                    <div className="metric-label">Sugestão Total</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Summary */}
            <div className="status-section">
              <h3 className="section-title">📊 Resumo de Status</h3>
              <div className="status-grid">
                <div className="status-card critico">
                  <div className="status-content">
                    <span className="status-icon">🚨</span>
                    <div className="status-info">
                      <div className="status-value">{statusSummary.critico}</div>
                      <div className="status-label">Crítico</div>
                    </div>
                  </div>
                </div>
                
                <div className="status-card baixo">
                  <div className="status-content">
                    <span className="status-icon">⚠️</span>
                    <div className="status-info">
                      <div className="status-value">{statusSummary.baixo}</div>
                      <div className="status-label">Baixo</div>
                    </div>
                  </div>
                </div>
                
                <div className="status-card adequado">
                  <div className="status-content">
                    <span className="status-icon">✅</span>
                    <div className="status-info">
                      <div className="status-value">{statusSummary.adequado}</div>
                      <div className="status-label">Adequado</div>
                    </div>
                  </div>
                </div>
                
                <div className="status-card excesso">
                  <div className="status-content">
                    <span className="status-icon">📈</span>
                    <div className="status-info">
                      <div className="status-value">{statusSummary.excesso}</div>
                      <div className="status-label">Excesso</div>
                    </div>
                  </div>
                </div>
                
                <div className="status-card sem-movimento">
                  <div className="status-content">
                    <span className="status-icon">💤</span>
                    <div className="status-info">
                      <div className="status-value">{statusSummary.semMovimento}</div>
                      <div className="status-label">Sem Movimento</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Filtros */}
            <FilterPanel 
              data={processedData}
              onFiltersChange={handleFiltersChange}
            />
            
            {/* Tabela Virtual */}
            <div className="table-section">
              <div className="table-header">
                <h3 className="section-title">📋 Análise de Produtos</h3>
                <div className="table-info">
                  Exibindo {filteredData.length.toLocaleString('pt-BR')} de {processedData.length.toLocaleString('pt-BR')} produtos
                </div>
              </div>
              
              <VirtualTable 
                data={filteredData}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;