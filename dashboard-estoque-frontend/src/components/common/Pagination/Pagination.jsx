import React from 'react';
import './Pagination.scss';

const Pagination = ({ pagination, onPageChange, onPageSizeChange, loading }) => {
  const { current_page, total_pages, page_size } = pagination;
  
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, current_page - delta);
      i <= Math.min(total_pages - 1, current_page + delta);
      i++
    ) {
      range.push(i);
    }

    if (current_page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current_page + delta < total_pages - 1) {
      rangeWithDots.push('...', total_pages);
    } else if (total_pages > 1) {
      rangeWithDots.push(total_pages);
    }

    return rangeWithDots;
  };

  const handlePageClick = (page) => {
    if (page !== current_page && page !== '...' && !loading) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (current_page > 1 && !loading) {
      onPageChange(current_page - 1);
    }
  };

  const handleNext = () => {
    if (current_page < total_pages && !loading) {
      onPageChange(current_page + 1);
    }
  };

  const handlePageSizeChange = (e) => {
    if (!loading) {
      onPageSizeChange(parseInt(e.target.value));
    }
  };

  return (
    <div className="pagination">
      <div className="pagination__info">
        <span className="pagination__page-size">
          <label htmlFor="page-size-select">Itens por página:</label>
          <select
            id="page-size-select"
            value={page_size}
            onChange={handlePageSizeChange}
            disabled={loading}
            className="pagination__select"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
          </select>
        </span>
      </div>

      <div className="pagination__controls">
        <button
          className="pagination__btn pagination__btn--prev"
          onClick={handlePrevious}
          disabled={current_page <= 1 || loading}
        >
          ← Anterior
        </button>

        <div className="pagination__pages">
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              className={`pagination__btn pagination__btn--page ${
                page === current_page ? 'pagination__btn--active' : ''
              } ${page === '...' ? 'pagination__btn--dots' : ''}`}
              onClick={() => handlePageClick(page)}
              disabled={page === '...' || loading}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          className="pagination__btn pagination__btn--next"
          onClick={handleNext}
          disabled={current_page >= total_pages || loading}
        >
          Próximo →
        </button>
      </div>
    </div>
  );
};

export default Pagination;
