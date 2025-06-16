import React, { useState } from 'react';
import './ProductTable.scss';

const ProductTable = ({ data, type }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Só para o top10

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value || 0);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'CRÍTICO': return 'status-critico';
      case 'BAIXO': return 'status-baixo';
      case 'ADEQUADO': return 'status-adequado';
      case 'EXCESSO': return 'status-excesso';
      case 'SEM VENDAS': return 'status-sem-vendas';
      default: return '';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'ALTA': return 'priority-alta';
      case 'MÉDIA': return 'priority-media';
      case 'BAIXA': return 'priority-baixa';
      default: return '';
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
  }, [data, sortConfig]);

  // Paginação apenas para top10
  const shouldPaginate = type === 'top10';
  const displayData = shouldPaginate ? sortedData.slice(0, itemsPerPage) : sortedData;

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === 'asc' ? '↗️' : '↘️';
  };

  if (!data || data.length === 0) {
    return (
      <div className="product-table-empty">
        <p>Nenhum produto encontrado.</p>
      </div>
    );
  }

  // Contar produtos com descrição gerada automaticamente
  const produtosFallback = data.filter(item => 
    !item.produto || 
    item.produto.trim() === '' || 
    item.produto.startsWith('Produto ')
  ).length;

  return (
    <div className="product-table-container">
      <div className={`table-wrapper ${type === 'complete' ? 'scrollable' : ''}`}>
        <table className="product-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('codigo')}>
                Código {getSortIcon('codigo')}
              </th>
              <th onClick={() => handleSort('produto')}>
                Produto {getSortIcon('produto')}
              </th>
              <th onClick={() => handleSort('estoque')}>
                Estoque {getSortIcon('estoque')}
              </th>
              <th onClick={() => handleSort('mediaMensal')}>
                Média Mensal {getSortIcon('mediaMensal')}
              </th>
              <th onClick={() => handleSort('cobertura')}>
                Cobertura {getSortIcon('cobertura')}
              </th>
              <th onClick={() => handleSort('status')}>
                Status {getSortIcon('status')}
              </th>
              <th onClick={() => handleSort('sugestaoAbastecimento')}>
                Sugestão {getSortIcon('sugestaoAbastecimento')}
              </th>
              <th onClick={() => handleSort('prioridade')}>
                Prioridade {getSortIcon('prioridade')}
              </th>
              {type === 'complete' && (
                <>
                  <th onClick={() => handleSort('pdv')}>
                    PDV % {getSortIcon('pdv')}
                  </th>
                  <th onClick={() => handleSort('valorTotal')}>
                    Valor Total {getSortIcon('valorTotal')}
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {displayData.map((item, index) => {
              const isProductFallback = !item.produto || item.produto.trim() === '' || item.produto.startsWith('Produto ');
              const displayName = item.produto && item.produto.trim() !== '' 
                ? item.produto 
                : `Produto ${item.codigo || 'N/A'}`;
              
              return (
                <tr key={`${item.codigo}-${index}`}>
                  <td>{item.codigo || 'N/A'}</td>
                  <td className={`produto-nome ${isProductFallback ? 'produto-fallback' : ''}`}>
                    {displayName}
                    {isProductFallback && (
                      <span className="fallback-indicator" title="Descrição gerada automaticamente">
                        {' '}*
                      </span>
                    )}
                  </td>
                  <td>{formatNumber(item.estoque)}</td>
                  <td>{formatNumber(item.mediaMensal)}</td>
                  <td>
                    {item.cobertura === Infinity ? '∞' : formatNumber(item.cobertura)}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                      {item.status || 'N/A'}
                    </span>
                  </td>
                  <td className="sugestao-destaque">
                    {formatNumber(item.sugestaoAbastecimento)}
                  </td>
                  <td>
                    <span className={`priority-badge ${getPriorityClass(item.prioridade)}`}>
                      {item.prioridade || 'N/A'}
                    </span>
                  </td>
                  {type === 'complete' && (
                    <>
                      <td>{formatNumber(item.pdv)}%</td>
                      <td>{formatCurrency(item.valorTotal)}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {produtosFallback > 0 && (
        <div className="table-note">
          <span className="note-icon">ℹ️</span>
          {produtosFallback} produto(s) marcado(s) com (*) tiveram a descrição gerada automaticamente devido a dados incompletos nos arquivos originais.
        </div>
      )}
    </div>
  );
};

export default ProductTable;