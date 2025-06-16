import React from 'react';
import './FilterPanel.scss';

const FilterPanel = ({ filters, setFilters }) => {
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
      priority: '',
      minCoverage: 0,
      hideSemVendas: false
    });
  };

  return (
    <div className="filter-panel">
      <h3>Filtros</h3>
      
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="search">Buscar Produto:</label>
          <input
            type="text"
            id="search"
            placeholder="Código ou nome do produto..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="CRÍTICO">Crítico</option>
            <option value="BAIXO">Baixo</option>
            <option value="ADEQUADO">Adequado</option>
            <option value="EXCESSO">Excesso</option>
            <option value="SEM VENDAS">Sem Vendas</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="priority">Prioridade:</label>
          <select
            id="priority"
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">Todas</option>
            <option value="ALTA">Alta</option>
            <option value="MÉDIA">Média</option>
            <option value="BAIXA">Baixa</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="minCoverage">Cobertura Mínima (meses):</label>
          <input
            type="number"
            id="minCoverage"
            min="0"
            step="0.1"
            value={filters.minCoverage}
            onChange={(e) => handleFilterChange('minCoverage', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="filter-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.hideSemVendas || false}
              onChange={(e) => handleFilterChange('hideSemVendas', e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            Excluir produtos sem vendas
          </label>
        </div>

        <div className="filter-actions">
          <button 
            type="button" 
            className="clear-filters-btn"
            onClick={clearFilters}
          >
            Limpar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;