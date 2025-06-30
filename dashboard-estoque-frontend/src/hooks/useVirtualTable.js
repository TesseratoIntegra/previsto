import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Hook para virtualização de tabela
 * @param {Array} data - Dados da tabela
 * @param {number} itemHeight - Altura de cada item em px
 * @param {number} containerHeight - Altura do container em px
 * @returns {Object} Dados e funções para virtualização
 */
export const useVirtualTable = (data = [], itemHeight = 50, containerHeight = 600) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const bufferCount = 5; // Itens extras para smooth scrolling
  
  const startIndex = useMemo(() => {
    const index = Math.floor(scrollTop / itemHeight);
    return Math.max(0, index - bufferCount);
  }, [scrollTop, itemHeight, bufferCount]);
  
  const endIndex = useMemo(() => {
    const index = startIndex + visibleCount + (bufferCount * 2);
    return Math.min(data.length - 1, index);
  }, [startIndex, visibleCount, bufferCount, data.length]);
  
  const visibleData = useMemo(() => {
    return data.slice(startIndex, endIndex + 1);
  }, [data, startIndex, endIndex]);
  
  const totalHeight = data.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  const handleScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);
  
  return {
    visibleData,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex,
    visibleCount
  };
};

export default useVirtualTable;