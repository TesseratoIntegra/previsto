import React from 'react';
import './MetricsPanel.scss';

const MetricsPanel = ({ metrics }) => {
  if (!metrics) return null;
  
  const { totalProdutos, totalEstoque, totalVendas, totalValor, totalSugestao } = metrics;
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };
  
  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };
  
  return (
    <div className="metrics-panel">
      <div className="metric-card">
        <div className="metric-icon">📦</div>
        <div className="metric-content">
          <div className="metric-value">{formatNumber(totalProdutos)}</div>
          <div className="metric-label">Produtos</div>
        </div>
      </div>
      
      <div className="metric-card">
        <div className="metric-icon">🏭</div>
        <div className="metric-content">
          <div className="metric-value">{formatNumber(totalEstoque)}</div>
          <div className="metric-label">Estoque Total</div>
        </div>
      </div>
      
      <div className="metric-card">
        <div className="metric-icon">🛒</div>
        <div className="metric-content">
          <div className="metric-value">{formatNumber(totalVendas)}</div>
          <div className="metric-label">Vendas (Qtd)</div>
        </div>
      </div>
      
      <div className="metric-card">
        <div className="metric-icon">💰</div>
        <div className="metric-content">
          <div className="metric-value">{formatCurrency(totalValor)}</div>
          <div className="metric-label">Valor Total</div>
        </div>
      </div>
      
      <div className="metric-card highlight">
        <div className="metric-icon">🔄</div>
        <div className="metric-content">
          <div className="metric-value">{formatNumber(totalSugestao)}</div>
          <div className="metric-label">Sugestão de Abastecimento</div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;