import React, { useState } from 'react';
import './StockFilters.scss';

const StockFilters = ({ filters, onFiltersChange, loading }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleInputChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      filial: '',
      armazem: '',
      page_size: 50
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  return (
    <div className="stock-filters">
      <div className="stock-filters__container">
        <div className="stock-filters__title">
          <h3>Filtros</h3>
          <span className="stock-filters__subtitle">
            Filtre os dados por filial e armazém
          </span>
        </div>

        <div className="stock-filters__form">
          <div className="stock-filters__grid">
            {/* Filtro Filial */}
            <div className="stock-filters__field">
              <label className="stock-filters__label" htmlFor="filter-filial">
                Filial
              </label>
              <input
                id="filter-filial"
                type="text"
                className="stock-filters__input"
                placeholder="Ex: 01"
                value={localFilters.filial}
                onChange={(e) => handleInputChange('filial', e.target.value)}
                onKeyPress={handleKeyPress}
                maxLength={2}
                disabled={loading}
              />
              <small className="stock-filters__hint">
                Código da filial (2 dígitos)
              </small>
            </div>

            {/* Filtro Armazém */}
            <div className="stock-filters__field">
              <label className="stock-filters__label" htmlFor="filter-armazem">
                Armazém
              </label>
              <input
                id="filter-armazem"
                type="text"
                className="stock-filters__input"
                placeholder="Ex: 01"
                value={localFilters.armazem}
                onChange={(e) => handleInputChange('armazem', e.target.value)}
                onKeyPress={handleKeyPress}
                maxLength={2}
                disabled={loading}
              />
              <small className="stock-filters__hint">
                Código do armazém (2 dígitos)
              </small>
            </div>

            {/* Page Size */}
            <div className="stock-filters__field">
              <label className="stock-filters__label" htmlFor="filter-page-size">
                Itens por Página
              </label>
              <select
                id="filter-page-size"
                className="stock-filters__select"
                value={localFilters.page_size}
                onChange={(e) => handleInputChange('page_size', parseInt(e.target.value))}
                disabled={loading}
              >
                <option value={25}>25 itens</option>
                <option value={50}>50 itens</option>
                <option value={100}>100 itens</option>
                <option value={200}>200 itens</option>
                <option value={500}>500 itens</option>
              </select>
              <small className="stock-filters__hint">
                Quantidade de registros por página
              </small>
            </div>
          </div>

          {/* Ações */}
          <div className="stock-filters__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleApplyFilters}
              disabled={loading}
            >
              {loading ? 'Aplicando...' : 'Aplicar Filtros'}
            </button>

            <button
              type="button"
              className="btn btn--outline"
              onClick={handleClearFilters}
              disabled={loading}
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Filtros Ativos */}
        {(filters.filial || filters.armazem) && (
          <div className="stock-filters__active">
            <span className="stock-filters__active-label">Filtros ativos:</span>
            <div className="stock-filters__tags">
              {filters.filial && (
                <span className="stock-filters__tag">
                  Filial: {filters.filial}
                  <button
                    className="stock-filters__tag-remove"
                    onClick={() => handleInputChange('filial', '')}
                    type="button"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.armazem && (
                <span className="stock-filters__tag">
                  Armazém: {filters.armazem}
                  <button
                    className="stock-filters__tag-remove"
                    onClick={() => handleInputChange('armazem', '')}
                    type="button"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockFilters;