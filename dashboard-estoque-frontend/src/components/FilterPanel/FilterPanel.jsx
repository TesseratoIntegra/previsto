import React, { memo } from 'react';
import { useOptimizedFilters } from '../../hooks/useOptimizedFilters';
import './FilterPanel.scss';

const FilterPanel = memo(({ 
  data = [], 
  onFiltersChange, 
  className = '' 
}) => {
  const {
    filters,
    filteredData,
    filterOptions,
    updateFilter,
    clearFilters,
    activeFiltersCount,
    isSearching
  } = useOptimizedFilters(data, 300);

  // Notificar componente pai sobre mudanças nos dados filtrados
  React.useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filteredData);
    }
  }, [filteredData, onFiltersChange]);

  return (
    <div className={`filter-panel optimized ${className}`}>
      <div className="filter-header">
        <div className="filter-title">
          <h3>🔍 Filtros</h3>
          {activeFiltersCount > 0 && (
            <span className="active-filters-badge">
              {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="filter-summary">
          <span className="results-count">
            📊 {filteredData.length.toLocaleString('pt-BR')} 
            {filteredData.length === 1 ? ' resultado' : ' resultados'}
          </span>
          {data.length !== filteredData.length && (
            <span className="total-count">
              de {data.length.toLocaleString('pt-BR')} total
            </span>
          )}
        </div>
      </div>
      
      <div className="filter-controls">
        {/* Busca com indicador de loading */}
        <div className="filter-group search-group">
          <label htmlFor="search" className="filter-label">
            🔍 Buscar:
          </label>
          <div className="search-input-wrapper">
            <input
              type="text"
              id="search"
              className="filter-input search-input"
              placeholder="Código ou nome do produto..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              autoComplete="off"
            />
            {isSearching && (
              <div className="search-loading">
                <div className="search-spinner"></div>
              </div>
            )}
          </div>
        </div>

        {/* Grid de filtros principais */}
        <div className="filters-grid">
          {/* Status */}
          <div className="filter-group">
            <label htmlFor="status" className="filter-label">
              📊 Status:
            </label>
            <select
              id="status"
              className="filter-select"
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              <option value="">Todos os status</option>
              {filterOptions.status.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Filial */}
          <div className="filter-group">
            <label htmlFor="filial" className="filter-label">
              🏢 Filial:
            </label>
            <select
              id="filial"
              className="filter-select"
              value={filters.filial}
              onChange={(e) => updateFilter('filial', e.target.value)}
            >
              <option value="">Todas as filiais</option>
              {filterOptions.filiais.map(filial => (
                <option key={filial} value={filial}>
                  {filial}
                </option>
              ))}
            </select>
          </div>

          {/* Local */}
          <div className="filter-group">
            <label htmlFor="local" className="filter-label">
              🏪 Local:
            </label>
            <select
              id="local"
              className="filter-select"
              value={filters.local}
              onChange={(e) => updateFilter('local', e.target.value)}
            >
              <option value="">Todos os locais</option>
              {filterOptions.locais.map(local => (
                <option key={local} value={local}>
                  {local}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkbox de sem movimento */}
        <div className="filter-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              className="checkbox-input"
              checked={filters.hideSemMovimento}
              onChange={(e) => updateFilter('hideSemMovimento', e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            💤 Ocultar itens sem movimento
          </label>
        </div>

        {/* Ações */}
        <div className="filter-actions">
          <button 
            type="button" 
            className="clear-filters-btn"
            onClick={clearFilters}
            disabled={activeFiltersCount === 0}
            title="Limpar todos os filtros"
          >
            🗑️ Limpar Filtros
          </button>
          
          {/* Estatísticas rápidas */}
          {filteredData.length > 0 && (
            <div className="filter-stats">
              <div className="stat-item">
                <span className="stat-label">Crítico:</span>
                <span className="stat-value stat-critico">
                  {filteredData.filter(item => item.status === 'CRÍTICO').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Baixo:</span>
                <span className="stat-value stat-baixo">
                  {filteredData.filter(item => item.status === 'BAIXO').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Adequado:</span>
                <span className="stat-value stat-adequado">
                  {filteredData.filter(item => item.status === 'ADEQUADO').length}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

FilterPanel.displayName = 'FilterPanel';

export default FilterPanel;