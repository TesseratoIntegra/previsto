// components/index.js - Exportações centralizadas otimizadas

// Componentes principais
export { default as Dashboard } from './Dashboard/Dashboard';
export { default as ErrorBoundary } from './ErrorBoundary/ErrorBoundary';

// Componentes de tabela
export { default as VirtualTable } from './VirtualTable/VirtualTable';
export { default as ProductTable } from './ProductTable/ProductTable'; // Mantido para compatibilidade

// Componentes de interface
export { default as Header } from './Header/Header';
export { default as FilterPanel } from './FilterPanel/FilterPanel';

// Componentes de utilidade
export { default as Pagination } from './Pagination/Pagination';

// Componentes descontinuados (mantidos para compatibilidade)
export { default as FileUpload } from './FileUpload/FileUpload';
export { default as MetricsPanel } from './MetricsPanel/MetricsPanel';
export { default as StatusSummary } from './StatusSummary/StatusSummary';