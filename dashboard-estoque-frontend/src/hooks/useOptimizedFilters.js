import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Hook para filtros otimizados com debounce e memoização
 * @param {Array} data - Dados para filtrar
 * @param {number} debounceDelay - Delay do debounce em ms
 * @returns {Object} Estado e funções dos filtros
 */
export const useOptimizedFilters = (data = [], debounceDelay = 300) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    filial: '',
    local: '',
    hideSemMovimento: false
  });

  // Debounce apenas para search
  const debouncedSearch = useDebounce(filters.search, debounceDelay);

  // Memoizar opções de filtro
  const filterOptions = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { filiais: [], locais: [], status: [] };
    }

    const filiaisSet = new Set();
    const locaisSet = new Set();
    const statusSet = new Set();

    data.forEach(item => {
      if (item.filial) filiaisSet.add(item.filial);
      if (item.local) locaisSet.add(item.local);
      if (item.status) statusSet.add(item.status);
    });

    return {
      filiais: Array.from(filiaisSet).sort(),
      locais: Array.from(locaisSet).sort(),
      status: Array.from(statusSet).sort()
    };
  }, [data]);

  // Filtrar dados com memoização
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.filter(item => {
      // Filtro de busca (debounced)
      if (debouncedSearch) {
        const searchTerm = debouncedSearch.toLowerCase();
        const matchesSearch = 
          (item.codigo && item.codigo.toLowerCase().includes(searchTerm)) ||
          (item.produto && item.produto.toLowerCase().includes(searchTerm));
        
        if (!matchesSearch) return false;
      }

      // Filtro de status
      if (filters.status && item.status !== filters.status) {
        return false;
      }

      // Filtro de filial
      if (filters.filial && item.filial !== filters.filial) {
        return false;
      }

      // Filtro de local
      if (filters.local && item.local !== filters.local) {
        return false;
      }

      // Filtro de sem movimento
      if (filters.hideSemMovimento && item.status === 'SEM MOVIMENTO') {
        return false;
      }

      return true;
    });
  }, [data, debouncedSearch, filters.status, filters.filial, filters.local, filters.hideSemMovimento]);

  // Update filter callback memoizado
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Clear filters callback memoizado
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      filial: '',
      local: '',
      hideSemMovimento: false
    });
  }, []);

  // Contar filtros ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.filial) count++;
    if (filters.local) count++;
    if (filters.hideSemMovimento) count++;
    return count;
  }, [filters]);

  return {
    filters,
    filteredData,
    filterOptions,
    updateFilter,
    clearFilters,
    activeFiltersCount,
    isSearching: filters.search !== debouncedSearch
  };
};

export default useOptimizedFilters;