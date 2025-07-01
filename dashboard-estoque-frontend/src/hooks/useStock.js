// ===============================================
// src/hooks/useStock.js
import { useState, useEffect, useCallback } from 'react';
import stockService from '../services/stockService';

const useStock = (initialFilters = {}) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    filial: '',
    armazem: '',
    page_size: 50,
    ...initialFilters
  });

  // Função para carregar dados
  const loadStocks = useCallback(async (page = 1, newFilters = {}) => {
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
  }, [filters]);

  // Função para atualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Função para limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      filial: '',
      armazem: '',
      page_size: 50
    });
  }, []);

  // Função para recarregar dados
  const refresh = useCallback(() => {
    if (pagination) {
      loadStocks(pagination.current_page);
    } else {
      loadStocks(1);
    }
  }, [loadStocks, pagination]);

  // Carrega dados quando os filtros mudam
  useEffect(() => {
    loadStocks(1);
  }, [loadStocks]);

  return {
    stocks,
    loading,
    error,
    pagination,
    filters,
    loadStocks,
    updateFilters,
    clearFilters,
    refresh
  };
};

export default useStock;