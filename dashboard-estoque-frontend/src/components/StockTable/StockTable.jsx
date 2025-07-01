import React, { useState, useEffect } from 'react';
import './StockTable.scss';
import StockHeader from './StockHeader/StockHeader';
import StockRow from './StockRow/StockRow';
import StockFilters from './StockFilters/StockFilters';
import Loading from '../common/Loading/Loading';
import ErrorMessage from '../common/ErrorMessage/ErrorMessage';
import Pagination from '../common/Pagination/Pagination';
import stockService from '../../services/stockService';

const StockTable = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    filial: '',
    armazem: '',
    page_size: 50
  });

  // Carrega dados do estoque
  const loadStocks = async (page = 1, newFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        ...filters,
        ...newFilters
      };

      const result = await stockService.getDetailedStocks(params);

      if (result.success) {
        setStocks(result.data);
        setPagination(result.pagination);
        setCurrentPage(page);
      } else {
        setError(result.error);
        setStocks([]);
        setPagination(null);
      }
    } catch (err) {
      setError('Erro inesperado ao carregar dados');
      setStocks([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  // Carrega dados na inicialização
  useEffect(() => {
    loadStocks(1);
  }, []);

  // Handler para mudança de filtros
  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    loadStocks(1, newFilters);
  };

  // Handler para mudança de página
  const handlePageChange = (page) => {
    loadStocks(page);
  };

  // Handler para mudança de tamanho da página
  const handlePageSizeChange = (pageSize) => {
    const newFilters = { ...filters, page_size: pageSize };
    setFilters(newFilters);
    loadStocks(1, newFilters);
  };

  // Handler para atualizar dados
  const handleRefresh = () => {
    loadStocks(currentPage);
  };

  if (loading && stocks.length === 0) {
    return <Loading message="Carregando dados de estoque..." />;
  }

  return (
    <div className="stock-table">
      <div className="stock-table__header">
        <div className="stock-table__title">
          <h1>Saldos em Estoque (SB2)</h1>
          <p>Visualização completa dos dados de estoque por filial e armazém</p>
        </div>
        
        <div className="stock-table__actions">
          <button 
            className="btn btn--secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      <StockFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        loading={loading}
      />

      {error && (
        <ErrorMessage 
          message={error}
          onRetry={() => loadStocks(currentPage)}
        />
      )}

      {pagination && (
        <div className="stock-table__info">
          <span className="stock-table__count">
            Mostrando {stocks.length} de {pagination.count} registros
          </span>
          <span className="stock-table__page-info">
            Página {pagination.current_page} de {pagination.total_pages}
          </span>
        </div>
      )}

      <div className="stock-table__container">
        <div className="stock-table__wrapper">
          <table className="stock-table__table">
            <StockHeader />
            <tbody>
              {stocks.map((stock, index) => (
                <StockRow 
                  key={`${stock.filial}-${stock.code}-${stock.local}-${index}`}
                  stock={stock}
                  index={index}
                />
              ))}
            </tbody>
          </table>
          
          {loading && stocks.length > 0 && (
            <div className="stock-table__loading-overlay">
              <Loading size="small" message="Atualizando..." />
            </div>
          )}
        </div>
      </div>

      {stocks.length === 0 && !loading && !error && (
        <div className="stock-table__empty">
          <h3>Nenhum registro encontrado</h3>
          <p>Tente ajustar os filtros ou verifique se existem dados para os critérios selecionados.</p>
        </div>
      )}

      {pagination && pagination.total_pages > 1 && (
        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          loading={loading}
        />
      )}
    </div>
  );
};

export default StockTable;