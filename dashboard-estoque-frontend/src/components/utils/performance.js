// utils/performance.js - Utilitários de performance

/**
 * Debounce function
 * @param {Function} func - Função a ser debounced
 * @param {number} wait - Tempo de espera em ms
 * @param {boolean} immediate - Executar imediatamente
 * @returns {Function} Função debounced
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

/**
 * Throttle function
 * @param {Function} func - Função a ser throttled
 * @param {number} limit - Limite de tempo em ms
 * @returns {Function} Função throttled
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Medidor de performance
 */
export class PerformanceMonitor {
  constructor() {
    this.measurements = new Map();
  }

  start(label) {
    this.measurements.set(label, {
      start: performance.now(),
      end: null,
      duration: null
    });
  }

  end(label) {
    const measurement = this.measurements.get(label);
    if (measurement) {
      measurement.end = performance.now();
      measurement.duration = measurement.end - measurement.start;
      console.log(`⏱️ ${label}: ${Math.round(measurement.duration)}ms`);
      return measurement.duration;
    }
    return null;
  }

  getDuration(label) {
    const measurement = this.measurements.get(label);
    return measurement ? measurement.duration : null;
  }

  getAllMeasurements() {
    const results = {};
    this.measurements.forEach((value, key) => {
      results[key] = value.duration;
    });
    return results;
  }

  clear() {
    this.measurements.clear();
  }
}

/**
 * Cache LRU simples
 */
export class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      // Move para o final (mais recente)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove o mais antigo (primeiro item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

/**
 * Chunker para processar arrays grandes em lotes
 * @param {Array} array - Array a ser processado
 * @param {number} chunkSize - Tamanho do lote
 * @returns {Array} Array de chunks
 */
export const chunk = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Processamento assíncrono de chunks para não bloquear a UI
 * @param {Array} data - Dados a serem processados
 * @param {Function} processor - Função de processamento
 * @param {number} chunkSize - Tamanho do chunk
 * @param {Function} onProgress - Callback de progresso
 * @returns {Promise<Array>} Dados processados
 */
export const processInChunks = async (data, processor, chunkSize = 1000, onProgress = null) => {
  const chunks = chunk(data, chunkSize);
  const results = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const processed = await new Promise((resolve) => {
      // Usar setTimeout para não bloquear a UI
      setTimeout(() => {
        const result = chunk.map(processor);
        resolve(result);
      }, 0);
    });
    
    results.push(...processed);
    
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: chunks.length,
        percentage: Math.round(((i + 1) / chunks.length) * 100)
      });
    }
  }
  
  return results;
};

/**
 * Memoização simples
 * @param {Function} fn - Função a ser memoizada
 * @param {Function} keyGenerator - Gerador de chave do cache
 * @returns {Function} Função memoizada
 */
export const memoize = (fn, keyGenerator = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  return function(...args) {
    const key = keyGenerator(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Observer para mudanças de tamanho de elemento
 * @param {Element} element - Elemento a ser observado
 * @param {Function} callback - Callback para mudanças
 * @returns {ResizeObserver} Observer
 */
export const observeResize = (element, callback) => {
  if (!window.ResizeObserver) {
    console.warn('ResizeObserver não suportado');
    return null;
  }
  
  const observer = new ResizeObserver(throttle((entries) => {
    for (const entry of entries) {
      callback(entry.contentRect);
    }
  }, 100));
  
  observer.observe(element);
  return observer;
};

/**
 * Lazy loading para componentes React
 * @param {Function} importFn - Função de import
 * @param {Object} fallback - Componente de fallback
 * @returns {React.Component} Componente lazy
 */
export const createLazyComponent = (importFn, fallback = null) => {
  const LazyComponent = React.lazy(importFn);
  
  return function LazyWrapper(props) {
    return (
      <React.Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
};

/**
 * Formatação de números otimizada
 */
export const formatters = {
  // Cache dos formatters
  _cache: new Map(),
  
  // Formatter de números para pt-BR
  number: (() => {
    const formatter = new Intl.NumberFormat('pt-BR');
    return (value) => {
      if (value === null || value === undefined || value === '') return '-';
      const num = parseFloat(value);
      return isNaN(num) ? '-' : formatter.format(num);
    };
  })(),
  
  // Formatter de moeda
  currency: (() => {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    return (value) => {
      if (value === null || value === undefined || value === '') return '-';
      const num = parseFloat(value);
      return isNaN(num) ? '-' : formatter.format(num);
    };
  })(),
  
  // Formatter de porcentagem
  percentage: (() => {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
    return (value) => {
      if (value === null || value === undefined || value === '') return '-';
      const num = parseFloat(value) / 100;
      return isNaN(num) ? '-' : formatter.format(num);
    };
  })()
};

/**
 * Verificação de performance do dispositivo
 * @returns {Object} Informações de performance
 */
export const getDevicePerformance = () => {
  const nav = navigator;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  
  return {
    cores: nav.hardwareConcurrency || 4,
    memory: nav.deviceMemory || 4,
    connection: connection ? {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    } : null,
    isLowEnd: (nav.deviceMemory || 4) < 4 || (nav.hardwareConcurrency || 4) < 4
  };
};

// Instância global do monitor de performance
export const perfMonitor = new PerformanceMonitor();

export default {
  debounce,
  throttle,
  PerformanceMonitor,
  LRUCache,
  chunk,
  processInChunks,
  memoize,
  observeResize,
  createLazyComponent,
  formatters,
  getDevicePerformance,
  perfMonitor
};