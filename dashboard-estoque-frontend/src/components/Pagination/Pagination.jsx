// components/Pagination/Pagination.jsx
import React from 'react';
import './Pagination.scss';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalCount,
  pageSize,
  onPageChange, 
  onPageSizeChange,
  loading = false 
}) => {
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  if (totalPages <= 1) {
    return (
      <div className="pagination-container">
        <div className="pagination-info">
          <span>
            Mostrando {totalCount} registro{totalCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          Mostrando {startItem} - {endItem} de {totalCount} registros
        </span>
        
        <select 
          value={pageSize} 
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          disabled={loading}
          className="page-size-select"
        >
          <option value={25}>25 por página</option>
          <option value={50}>50 por página</option>
          <option value={100}>100 por página</option>
          <option value={200}>200 por página</option>
        </select>
      </div>

      <div className="pagination-controls">
        <button 
          onClick={() => onPageChange(1)} 
          disabled={currentPage === 1 || loading}
          className="pagination-btn first"
          title="Primeira página"
        >
          « Primeira
        </button>
        
        <button 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1 || loading}
          className="pagination-btn prev"
          title="Página anterior"
        >
          ‹ Anterior
        </button>

        <div className="page-numbers">
          {generatePageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={loading}
              className={`pagination-btn page-number ${
                page === currentPage ? 'active' : ''
              } ${typeof page !== 'number' ? 'ellipsis' : ''}`}
              title={typeof page === 'number' ? `Página ${page}` : ''}
            >
              {page}
            </button>
          ))}
        </div>

        <button 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages || loading}
          className="pagination-btn next"
          title="Próxima página"
        >
          Próxima ›
        </button>
        
        <button 
          onClick={() => onPageChange(totalPages)} 
          disabled={currentPage === totalPages || loading}
          className="pagination-btn last"
          title="Última página"
        >
          Última »
        </button>
      </div>

      {loading && (
        <div className="pagination-loading">
          <div className="loading-spinner"></div>
          <span>Carregando...</span>
        </div>
      )}
    </div>
  );
};

export default Pagination;