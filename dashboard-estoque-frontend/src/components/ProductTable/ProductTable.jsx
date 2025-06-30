import React, { useState, useMemo, useCallback } from 'react';
import './ProductTable.scss';

const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc'
};

// ✅ CONFIGURAÇÃO DAS COLUNAS - OTIMIZADA
const COLUMNS_CONFIG = {
  codigo: { label: 'Código', type: 'text', sortable: true },
  produto: { label: 'Produto', type: 'text', sortable: true },
  filial: { label: 'Filial', type: 'text', sortable: true },
  local: { label: 'Local', type: 'text', sortable: true },
  estoque: { label: 'Estoque', type: 'number', sortable: true },
  reservado: { label: 'Reservado', type: 'number', sortable: true },
  emPedido: { label: 'Em Pedido', type: 'number', sortable: true },
  consumo: { label: 'Consumo', type: 'number', sortable: true, highlight: true },
  consumoMedio: { label: 'Consumo Médio', type: 'number', sortable: true, highlight: true },
  cobertura: { label: 'Cobertura', type: 'number', sortable: true },
  status: { label: 'Status', type: 'badge', sortable: true },
  sugestaoAbastecimento: { label: 'Sugestão', type: 'number', sortable: true, highlight: true },
  prioridade: { label: 'Prioridade', type: 'badge', sortable: true }
};

const ProductTable = ({ 
  data = [], 
  pagination = null,
  onPageChange = null,
  onPageSizeChange = null,
  loading = false 
}) => {
  // ✅ HOOKS SEMPRE EXECUTADOS
  const [sortConfig, setSortConfig] = useState({ 
    key: null, 
    direction: SORT_DIRECTIONS.ASC 
  });

  // ✅ Formatadores otimizados
  const formatters = useMemo(() => ({
    number: (value) => {
      if (value === Infinity) return '∞';
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
      }).format(value || 0);
    },
    
    integer: (value) => {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value || 0);
    },

    consumoMedio: (value) => {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
      }).format(value || 0);
    }
  }), []);

  // ✅ Classes para badges - memoizadas
  const statusClasses = useMemo(() => ({
    'CRÍTICO': 'status-critico',
    'BAIXO': 'status-baixo',
    'ADEQUADO': 'status-adequado',
    'EXCESSO': 'status-excesso',
    'SEM MOVIMENTO': 'status-sem-movimento'
  }), []);

  const priorityClasses = useMemo(() => ({
    'ALTA': 'priority-alta',
    'MÉDIA': 'priority-media',
    'BAIXA': 'priority-baixa'
  }), []);

  // ✅ Ordenação otimizada
  const handleSort = useCallback((key) => {
    setSortConfig(prevConfig => {
      let direction = SORT_DIRECTIONS.ASC;
      if (prevConfig.key === key && prevConfig.direction === SORT_DIRECTIONS.ASC) {
        direction = SORT_DIRECTIONS.DESC;
      }
      return { key, direction };
    });
  }, []);

  // ✅ Dados ordenados - só executa se necessário
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !data.length) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // Ordenação numérica
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === SORT_DIRECTIONS.ASC ? aVal - bVal : bVal - aVal;
      }

      // Ordenação de texto
      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();
      
      if (sortConfig.direction === SORT_DIRECTIONS.ASC) {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
  }, [data, sortConfig]);

  // ✅ Ícone de ordenação
  const getSortIcon = useCallback((columnKey) => {
    if (sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === SORT_DIRECTIONS.ASC ? '↗️' : '↘️';
  }, [sortConfig]);

  // ✅ Função para renderizar valor da célula (sem JSX)
  const getCellValue = useCallback((item, columnKey, config) => {
    const value = item[columnKey];
    
    switch (config.type) {
      case 'number':
        if (columnKey === 'cobertura' && value === Infinity) {
          return '∞';
        }
        if (columnKey === 'consumo' || columnKey === 'sugestaoAbastecimento') {
          return formatters.integer(value);
        }
        if (columnKey === 'consumoMedio') {
          return formatters.consumoMedio(value);
        }
        return formatters.number(value);
        
      case 'badge':
        return value || 'N/A';
        
      default:
        return value || 'N/A';
    }
  }, [formatters]);

  // ✅ Paginação simples e eficiente
  const PaginationControls = useCallback(() => {
    if (!pagination || !onPageChange) return null;

    const { current_page, total_pages } = pagination;
    const pages = [];
    
    // Mostrar no máximo 5 páginas
    const startPage = Math.max(1, current_page - 2);
    const endPage = Math.min(total_pages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination-controls">
        <button 
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page <= 1}
          className="pagination-btn"
        >
          ← Anterior
        </button>
        
        <div className="pagination-pages">
          {startPage > 1 && (
            <>
              <button onClick={() => onPageChange(1)} className="pagination-btn">1</button>
              {startPage > 2 && <span className="pagination-ellipsis">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`pagination-btn ${page === current_page ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}
          
          {endPage < total_pages && (
            <>
              {endPage < total_pages - 1 && <span className="pagination-ellipsis">...</span>}
              <button onClick={() => onPageChange(total_pages)} className="pagination-btn">{total_pages}</button>
            </>
          )}
        </div>
        
        <button 
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page >= total_pages}
          className="pagination-btn"
        >
          Próxima →
        </button>
      </div>
    );
  }, [pagination, onPageChange]);

  // ✅ Verifica se não há dados
  if (!data || data.length === 0) {
    return (
      <div className="product-table-empty">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Carregando produtos...</p>
          </div>
        ) : (
          <div className="empty-state">
            <p>📭 Nenhum produto encontrado.</p>
            <small>Tente ajustar os filtros ou verificar se há dados disponíveis.</small>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="product-table-container">
      {loading && (
        <div className="table-loading-overlay">
          <div className="loading-spinner"></div>
          <span>Carregando...</span>
        </div>
      )}
      
      <div className={`table-wrapper ${loading ? 'loading' : ''}`}>
        <table className="product-table">
          <thead>
            <tr>
              {Object.entries(COLUMNS_CONFIG).map(([columnKey, config]) => (
                <th 
                  key={columnKey}
                  onClick={config.sortable ? () => handleSort(columnKey) : undefined}
                  className={config.sortable ? 'sortable' : ''}
                  title={config.sortable ? 'Clique para ordenar' : ''}
                >
                  {config.label} {config.sortable && getSortIcon(columnKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr key={`${item.codigo}-${item.filial}-${item.local}-${index}`} className={loading ? 'row-loading' : ''}>
                {Object.entries(COLUMNS_CONFIG).map(([columnKey, config]) => {
                  const cellValue = getCellValue(item, columnKey, config);
                  
                  // Tratamento especial para produto
                  if (columnKey === 'produto') {
                    const isGenerated = !item.produto || item.produto.startsWith('Produto ');
                    return (
                      <td key={columnKey} className={`produto-nome ${isGenerated ? 'produto-fallback' : ''}`}>
                        {item.produto || `Produto ${item.codigo}`}
                        {isGenerated && (
                          <span className="fallback-indicator" title="Descrição gerada automaticamente">
                            {' '}*
                          </span>
                        )}
                      </td>
                    );
                  }

                  // Tratamento para badges
                  if (config.type === 'badge') {
                    const badgeClass = columnKey === 'status' 
                      ? statusClasses[cellValue] || ''
                      : priorityClasses[cellValue] || '';
                    
                    return (
                      <td key={columnKey} className={config.highlight ? `${columnKey}-highlight` : ''}>
                        <span className={`${columnKey}-badge ${badgeClass}`}>
                          {cellValue}
                        </span>
                      </td>
                    );
                  }

                  // Classes especiais por coluna
                  let cellClass = '';
                  if (columnKey === 'filial') cellClass = 'filial-codigo';
                  else if (columnKey === 'local') cellClass = 'armazem-codigo';
                  else if (columnKey === 'consumoMedio') cellClass = 'consumo-medio-destaque';
                  else if (columnKey === 'consumo') cellClass = 'consumo-destaque';
                  else if (columnKey === 'sugestaoAbastecimento') cellClass = 'sugestao-destaque';
                  else if (config.highlight) cellClass = `${columnKey}-highlight`;

                  return (
                    <td key={columnKey} className={cellClass}>
                      {cellValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* ✅ PAGINAÇÃO OTIMIZADA */}
      <PaginationControls />
      
      {/* ✅ ESTATÍSTICAS SIMPLIFICADAS */}
      <div className="table-stats">
        <div className="stats-simple">
          <span>📊 {data.length} produto(s) nesta página</span>
          {pagination && (
            <span>📄 Página {pagination.current_page} de {pagination.total_pages}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductTable;