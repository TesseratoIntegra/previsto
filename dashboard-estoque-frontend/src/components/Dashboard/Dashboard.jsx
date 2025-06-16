import React, { useState, useEffect } from 'react';
import './Dashboard.scss';
import Header from '../Header/Header';
import FileUpload from '../FileUpload/FileUpload';
import MetricsPanel from '../MetricsPanel/MetricsPanel';
import StatusSummary from '../StatusSummary/StatusSummary';
import ProductTable from '../ProductTable/ProductTable';
import FilterPanel from '../FilterPanel/FilterPanel';
import { processData } from '../../services/dataProcessor';
import { fetchEstoqueData, fetchVendasData } from '../../services/api';

const Dashboard = () => {
  const [estoqueFile, setEstoqueFile] = useState(null);
  const [vendasFile, setVendasFile] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    minCoverage: 0,
    hideSemVendas: false
  });
  const [filteredData, setFilteredData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // Função para carregar dados do backend
  const loadDataFromBackend = async () => {
    try {
      setLoading(true);
      setError(null);
      const estoqueData = await fetchEstoqueData();
      const vendasData = await fetchVendasData();
      
      const processed = await processData(estoqueData, vendasData);
      setProcessedData(processed);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar dados do servidor: ' + err.message);
      setLoading(false);
    }
  };

  // Função para processar arquivos carregados
  const handleProcessFiles = async () => {
    if (!estoqueFile || !vendasFile) {
      setError('Por favor, selecione AMBOS os arquivos: estoque E vendas.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Iniciando processamento dos arquivos...');
      console.log('Arquivo de estoque :', estoqueFile.name);
      console.log('Arquivo de vendas:', vendasFile.name);
      
      // Processar os arquivos carregados
      const processed = await processData(estoqueFile, vendasFile);
      
      console.log('Processamento concluído. Dados processados:', processed);
      
      if (!processed || processed.length === 0) {
        throw new Error('Nenhum dado foi processado. Verifique se os arquivos estão no formato correto.');
      }
      
      setProcessedData(processed);
      setLoading(false);
    } catch (err) {
      console.error('Erro no processamento:', err);
      setError('Erro ao processar arquivos: ' + err.message);
      setLoading(false);
    }
  };

  // Aplicar filtros aos dados
  useEffect(() => {
    if (!processedData || !Array.isArray(processedData)) return;

    const filtered = processedData.filter(item => {
      // Proteção contra valores undefined
      const codigo = item.codigo ? item.codigo.toString() : '';
      const produto = item.produto || '';
      const cobertura = typeof item.cobertura === 'number' ? item.cobertura : 0;
      
      const matchesSearch = 
        codigo.toLowerCase().includes(filters.search.toLowerCase()) || 
        produto.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || item.status === filters.status;
      const matchesPriority = !filters.priority || item.prioridade === filters.priority;
      const matchesCoverage = cobertura >= filters.minCoverage;
      
      // Novo filtro para excluir produtos sem vendas
      const matchesSemVendas = !filters.hideSemVendas || item.status !== 'SEM VENDAS';

      return matchesSearch && matchesStatus && matchesPriority && matchesCoverage && matchesSemVendas;
    });

    setFilteredData(filtered);

    // Selecionar top 10 produtos para abastecimento
    const top10 = [...filtered]
      .sort((a, b) => (b.sugestaoAbastecimento || 0) - (a.sugestaoAbastecimento || 0))
      .slice(0, 10);
    
    setTopProducts(top10);
  }, [processedData, filters]);

  // Calcular métricas
  const calculateMetrics = () => {
    if (!processedData || !Array.isArray(processedData)) return null;

    const totalProdutos = processedData.length;
    const totalEstoque = processedData.reduce((sum, item) => sum + (item.estoque || 0), 0);
    const totalVendas = processedData.reduce((sum, item) => sum + (item.vendaTotal || 0), 0);
    const totalValor = processedData.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
    const totalSugestao = processedData.reduce((sum, item) => sum + (item.sugestaoAbastecimento || 0), 0);

    return {
      totalProdutos,
      totalEstoque,
      totalVendas,
      totalValor,
      totalSugestao
    };
  };

  // Calcular resumo de status
  const calculateStatusSummary = () => {
    if (!processedData || !Array.isArray(processedData)) return null;

    const critico = processedData.filter(item => item.status === 'CRÍTICO').length;
    const baixo = processedData.filter(item => item.status === 'BAIXO').length;
    const adequado = processedData.filter(item => item.status === 'ADEQUADO').length;
    const excesso = processedData.filter(item => item.status === 'EXCESSO').length;
    const semVendas = processedData.filter(item => item.status === 'SEM VENDAS').length;

    return {
      critico,
      baixo,
      adequado,
      excesso,
      semVendas
    };
  };

  const metrics = calculateMetrics();
  const statusSummary = calculateStatusSummary();

  return (
    <div className="dashboard">
      <Header title="Dashboard de Análise de Estoque" />
      
      {!processedData ? (
        <div className="upload-section">
          <h2>Upload de Arquivos</h2>
          <div className="upload-container">
            <FileUpload 
              label="Arquivo de Estoque (SB2)" 
              onFileSelect={setEstoqueFile} 
              acceptedFormats=".xlsx,.csv"
              icon="package"
            />
            <FileUpload 
              label="Arquivo de Vendas (Rel. Analise Fat. item.)" 
              onFileSelect={setVendasFile} 
              acceptedFormats=".xlsx,.csv"
              icon="chart-bar"
            />
          </div>
          
          <div className="file-status">
            {estoqueFile && <p>✅ Estoque: {estoqueFile.name}</p>}
            {vendasFile && <p>✅ Vendas: {vendasFile.name}</p>}
          </div>
          <div className='process-botton-content'>
            <button 
              className="process-button"
              onClick={handleProcessFiles}
              disabled={loading || !estoqueFile || !vendasFile}
            >
              {loading ? 'Processando...' : '🚀 Processar Dados e Gerar Dashboard'}
            </button>
            
            <button 
              className="backend-button"
              onClick={loadDataFromBackend}
              disabled={loading}
            >
              {loading ? 'Carregando...' : '📊 Carregar Dados do Servidor'}
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </div>
      ) : (
        <div className="dashboard-content">
          <div className="success-message">
            ✅ Dados processados com sucesso! {processedData.length} produtos analisados.
          </div>
          
          <MetricsPanel metrics={metrics} />
          <StatusSummary summary={statusSummary} />
          
          <FilterPanel 
            filters={filters} 
            setFilters={setFilters} 
          />
          
          <div className="tables-section">
            <h2>Top 10 Produtos que Mais Precisam de Abastecimento</h2>
            <ProductTable 
              data={topProducts} 
              type="top10"
            />
            
            <h2>Análise Completa por Produto</h2>
            <div className="table-info">
              Mostrando todos os {filteredData.length} produtos filtrados de {processedData.length} produtos totais
              {filters.hideSemVendas && (
                <span className="filter-active"> (excluindo produtos sem vendas)</span>
              )}
              {(filteredData.length !== processedData.length && !filters.hideSemVendas) && (
                <span className="filter-active"> (filtros aplicados)</span>
              )}
              {(filteredData.length !== processedData.length && filters.hideSemVendas) && (
                <span className="filter-active"> (múltiplos filtros aplicados)</span>
              )}
            </div>
            <ProductTable 
              data={filteredData} 
              type="complete"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;