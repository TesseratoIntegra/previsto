import React, { memo, useMemo, useCallback, useState } from 'react';
import { useVirtualTable } from '../../hooks/useVirtualTable';
import './VirtualTable.scss';

// Configuração das colunas COM LARGURAS ADEQUADAS
const COLUMNS_CONFIG = {
  codigo: { label: 'Código', width: '110px', align: 'left', sortable: true },
  produto: { label: 'Produto', width: '200px', align: 'left', sortable: true },
  filial: { label: 'Filial', width: '70px', align: 'center', sortable: true },
  local: { label: 'Local', width: '70px', align: 'center', sortable: true },
  estoque: { label: 'Estoque', width: '90px', align: 'right', type: 'number', sortable: true },
  reservado: { label: 'Reservado', width: '90px', align: 'right', type: 'number', sortable: true },
  emPedido: { label: 'Em Pedido', width: '90px', align: 'right', type: 'number', sortable: true },
  consumo: { label: 'Consumo', width: '90px', align: 'right', type: 'number', sortable: true },
  consumoMedio: { label: 'Cons. Médio', width: '100px', align: 'right', type: 'number', sortable: true },
  cobertura: { label: 'Cobertura', width: '90px', align: 'right', type: 'number', sortable: true },
  status: { label: 'Status', width: '120px', align: 'center', type: 'badge', sortable: true },
  sugestaoAbastecimento: { label: 'Sugestão', width: '90px', align: 'right', type: 'number', sortable: true },
  prioridade: { label: 'Prioridade', width: '100px', align: 'center', type: 'badge', sortable: true }
};

const ROW_HEIGHT = 50;
const CONTAINER_HEIGHT = 600;

// Função de ordenação otimizada
const sortData = (data, sortField, sortDirection) => {
  if (!sortField || !data || data.length === 0) return data;

  return [...data].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Tratar valores nulos/undefined
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';

    // Conversão para números se necessário
    const config = COLUMNS_CONFIG[sortField];
    if (config?.type === 'number') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    } else {
      // Para strings, converter para lowercase para ordenação case-insensitive
      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();
    }

    let comparison = 0;
    if (aValue > bValue) {
      comparison = 1;
    } else if (aValue < bValue) {
      comparison = -1;
    }

    return sortDirection === 'desc' ? comparison * -1 : comparison;
  });
};

// Componente memoizado para cada linha
const TableRow = memo(({ item, style, index }) => {
  const formatNumber = useCallback((value) => {
    if (value === null || value === undefined || value === '') return '-';
    return typeof value === 'number' ? value.toLocaleString('pt-BR') : value;
  }, []);

  const getBadgeClass = useCallback((value, type) => {
    if (type === 'status') {
      const statusClasses = {
        'CRÍTICO': 'status-critico',
        'BAIXO': 'status-baixo',
        'ADEQUADO': 'status-adequado',
        'EXCESSO': 'status-excesso',
        'SEM MOVIMENTO': 'status-sem-movimento'
      };
      return statusClasses[value] || '';
    }
    
    if (type === 'prioridade') {
      const priorityClasses = {
        'ALTA': 'priority-alta',
        'MÉDIA': 'priority-media',
        'BAIXA': 'priority-baixa'
      };
      return priorityClasses[value] || '';
    }
    
    return '';
  }, []);

  return (
    <div 
      className={`virtual-row ${index % 2 === 0 ? 'even' : 'odd'}`}
      style={style}
    >
      {Object.entries(COLUMNS_CONFIG).map(([key, config]) => {
        let cellValue = item[key];
        
        // Formatação baseada no tipo
        if (config.type === 'number') {
          cellValue = formatNumber(cellValue);
        }
        
        // Tratamento especial para produto
        if (key === 'produto') {
          const isGenerated = !item.produto || item.produto.startsWith('Produto ');
          return (
            <div 
              key={key}
              className={`virtual-cell ${key}-cell ${isGenerated ? 'produto-fallback' : ''}`}
              style={{ width: config.width, textAlign: config.align }}
            >
              {item.produto || `Produto ${item.codigo}`}
              {isGenerated && (
                <span className="fallback-indicator" title="Descrição gerada automaticamente">
                  {' '}*
                </span>
              )}
            </div>
          );
        }

        // Badges
        if (config.type === 'badge') {
          const badgeClass = getBadgeClass(cellValue, key);
          return (
            <div 
              key={key}
              className="virtual-cell badge-cell"
              style={{ width: config.width, textAlign: config.align }}
            >
              <span className={`badge ${badgeClass}`}>
                {cellValue || '-'}
              </span>
            </div>
          );
        }

        // Células normais
        return (
          <div 
            key={key}
            className={`virtual-cell ${key}-cell`}
            style={{ width: config.width, textAlign: config.align }}
          >
            {cellValue || '-'}
          </div>
        );
      })}
    </div>
  );
});

TableRow.displayName = 'TableRow';

const VirtualTable = ({ data = [], loading = false }) => {
  // Estados de ordenação
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' ou 'desc'

  // Dados ordenados memoizados
  const sortedData = useMemo(() => {
    return sortData(data, sortField, sortDirection);
  }, [data, sortField, sortDirection]);

  // Handler para clique no header
  const handleSort = useCallback((field) => {
    if (!COLUMNS_CONFIG[field]?.sortable) return;

    if (sortField === field) {
      // Se já está ordenando por este campo, inverte a direção
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Novo campo, começa com descendente (maior para menor)
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField]);

  // Ícone de ordenação
  const getSortIcon = useCallback((field) => {
    if (sortField !== field) return '⇅'; // Ícone neutro
    return sortDirection === 'desc' ? '↓' : '↑';
  }, [sortField, sortDirection]);

  const {
    visibleData,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex
  } = useVirtualTable(sortedData, ROW_HEIGHT, CONTAINER_HEIGHT);

  // Header memoizado com ordenação
  const tableHeader = useMemo(() => (
    <div className="virtual-header">
      {Object.entries(COLUMNS_CONFIG).map(([key, config]) => (
        <div 
          key={key}
          className={`virtual-header-cell ${config.sortable ? 'sortable' : ''} ${sortField === key ? 'active' : ''}`}
          style={{ width: config.width, textAlign: config.align }}
          onClick={() => handleSort(key)}
          title={config.sortable ? 'Clique para ordenar' : ''}
        >
          <span className="header-label">{config.label}</span>
          {config.sortable && (
            <span className="sort-icon">{getSortIcon(key)}</span>
          )}
        </div>
      ))}
    </div>
  ), [handleSort, getSortIcon, sortField]);

  if (loading) {
    return (
      <div className="virtual-table-container">
        <div className="virtual-table-loading">
          <div className="loading-spinner"></div>
          <span>Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="virtual-table-container">
        <div className="virtual-table-empty">
          <div className="empty-icon">📊</div>
          <h3>Nenhum dado encontrado</h3>
          <p>Ajuste os filtros ou carregue novos dados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="virtual-table-container">
      {tableHeader}
      
      <div 
        className="virtual-table-viewport"
        style={{ height: CONTAINER_HEIGHT }}
        onScroll={handleScroll}
      >
        <div 
          className="virtual-table-content"
          style={{ height: totalHeight }}
        >
          <div 
            className="virtual-table-visible"
            style={{ transform: `translateY(${offsetY}px)` }}
          >
            {visibleData.map((item, index) => (
              <TableRow
                key={`${startIndex + index}-${item.codigo || index}`}
                item={item}
                index={startIndex + index}
                style={{ height: ROW_HEIGHT }}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="virtual-table-footer">
        <div className="footer-info">
          <span>
            📊 Exibindo {visibleData.length} de {sortedData.length} registros
          </span>
          {sortField && (
            <span className="sort-info">
              🔄 Ordenado por: <strong>{COLUMNS_CONFIG[sortField].label}</strong> 
              ({sortDirection === 'desc' ? 'Maior → Menor' : 'Menor → Maior'})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(VirtualTable);