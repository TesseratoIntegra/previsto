import { useState, useMemo } from 'react';

const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular dados paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  // Calcular informações de paginação
  const paginationInfo = useMemo(() => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      startItem,
      endItem,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1
    };
  }, [data.length, currentPage, itemsPerPage]);

  // Função para ir para uma página específica
  const goToPage = (page) => {
    if (page >= 1 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
    }
  };

  // Função para ir para a próxima página
  const goToNext = () => {
    if (paginationInfo.hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Função para ir para a página anterior
  const goToPrevious = () => {
    if (paginationInfo.hasPrevious) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Função para ir para a primeira página
  const goToFirst = () => {
    setCurrentPage(1);
  };

  // Função para ir para a última página
  const goToLast = () => {
    setCurrentPage(paginationInfo.totalPages);
  };

  // Função para resetar paginação
  const reset = () => {
    setCurrentPage(1);
  };

  // Função para gerar páginas visíveis
  const getVisiblePages = (delta = 2) => {
    const { currentPage, totalPages } = paginationInfo;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return {
    paginatedData,
    paginationInfo,
    goToPage,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast,
    reset,
    getVisiblePages
  };
};

export default usePagination;