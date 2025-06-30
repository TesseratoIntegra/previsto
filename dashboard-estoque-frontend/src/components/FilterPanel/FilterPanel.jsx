import React, { useMemo } from 'react';
import './FilterPanel.scss';

// ✅ FILTERPANEL SIMPLIFICADO PARA PERFORMANCE
const FilterPanel = ({ filters, setFilters, data = [] }) => {
  
  // ✅ Extrair opções únicas de forma otimizada
  const filterOptions = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { filiais: [], locais: [], status: [] };
    }

    const filiaisSet = new Set();
    const locaisSet = new Set();
    const statusSet = new Set();

    // Uma única passagem pelos dados
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      filial: '',
      local: '',
      hideSemMovimento: false
    });
  };

  // ✅ Contar filtros ativos de forma simples
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.filial) count++;
    if (filters.local) count++;
    if (filters.hideSemMovimento) count++;
    return count;
  }, [filters]);

  return (
    <div className="filter-panel simplified">
      <div className="filter-header">
        <h3>🔍 Filtros</h3>
        {activeFiltersCount > 0 && (
          <span className="active-filters-badge">
            {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <div className="filter-controls">
        {/* ✅ GRID SIMPLIFICADO - APENAS ESSENCIAIS */}
        <div className="filter-grid-simple">
          {/* Busca */}
          <div className="filter-group">
            <label htmlFor="search">🔍 Buscar:</label>
            <input
              type="text"
              id="search"
              placeholder="Código ou produto..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="filter-group">
            <label htmlFor="status">📊 Status:</label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos</option>
              {filterOptions.status.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Filial */}
          <div className="filter-group">
            <label htmlFor="filial">🏢 Filial:</label>
            <select
              id="filial"
              value={filters.filial}
              onChange={(e) => handleFilterChange('filial', e.target.value)}
            >
              <option value="">Todas</option>
              {filterOptions.filiais.map(filial => (
                <option key={filial} value={filial}>{filial}</option>
              ))}
            </select>
          </div>

          {/* Local */}
          <div className="filter-group">
            <label htmlFor="local">🏪 Local:</label>
            <select
              id="local"
              value={filters.local}
              onChange={(e) => handleFilterChange('local', e.target.value)}
            >
              <option value="">Todos</option>
              {filterOptions.locais.map(local => (
                <option key={local} value={local}>{local}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ✅ CHECKBOX SIMPLIFICADO */}
        <div className="filter-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.hideSemMovimento || false}
              onChange={(e) => handleFilterChange('hideSemMovimento', e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            💤 Ocultar sem movimento
          </label>
        </div>

        {/* ✅ AÇÕES SIMPLIFICADAS */}
        <div className="filter-actions">
          <button 
            type="button" 
            className="clear-filters-btn"
            onClick={clearFilters}
            disabled={activeFiltersCount === 0}
          >
            🗑️ Limpar Filtros
          </button>
          
          {/* ✅ ESTATÍSTICAS SIMPLES */}
          {data.length > 0 && (
            <div className="filter-stats">
              <small>
                📊 {data.length.toLocaleString('pt-BR')} produto{data.length !== 1 ? 's' : ''} disponível{data.length !== 1 ? 'is' : ''}
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;