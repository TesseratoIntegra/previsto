// hooks/usePagination.js
import { useState, useEffect } from 'react';

export const usePagination = (initialPageSize = 50) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const updatePagination = (paginationData) => {
    setTotalCount(paginationData.count || 0);
    setTotalPages(paginationData.total_pages || Math.ceil((paginationData.count || 0) / pageSize));
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
  };

  const resetPagination = () => {
    setCurrentPage(1);
    setTotalCount(0);
    setTotalPages(0);
  };

  return {
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    loading,
    setLoading,
    updatePagination,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    resetPagination
  };
};