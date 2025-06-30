import React from 'react';
import './StatusSummary.scss';

const StatusSummary = ({ summary }) => {
  if (!summary) return null;
  
  const { critico, baixo, adequado, excesso, semVendas, semMovimento, total } = summary;
  
  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };
  
  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return ((value / total) * 100).toFixed(1);
  };
  
  return (
    
    <div className="status-summary">
      
      
      <div className="status-grid">
        <div className="status-card critico">
          <div className="status-icon">🔴</div>
          <div className="status-content">
            <div className="status-value">{formatNumber(critico)}</div>
            <div className="status-label">Crítico</div>
            <div className="status-percentage">{calculatePercentage(critico, total)}%</div>
          </div>
        </div>
        
        <div className="status-card baixo">
          <div className="status-icon">🟡</div>
          <div className="status-content">
            <div className="status-value">{formatNumber(baixo)}</div>
            <div className="status-label">Baixo</div>
            <div className="status-percentage">{calculatePercentage(baixo, total)}%</div>
          </div>
        </div>
        
        <div className="status-card adequado">
          <div className="status-icon">🟢</div>
          <div className="status-content">
            <div className="status-value">{formatNumber(adequado)}</div>
            <div className="status-label">Adequado</div>
            <div className="status-percentage">{calculatePercentage(adequado, total)}%</div>
          </div>
        </div>
        
        <div className="status-card excesso">
          <div className="status-icon">🔵</div>
          <div className="status-content">
            <div className="status-value">{formatNumber(excesso)}</div>
            <div className="status-label">Excesso</div>
            <div className="status-percentage">{calculatePercentage(excesso, total)}%</div>
          </div>
        </div>
        
        <div className="status-card sem-vendas">
          <div className="status-icon">⚫</div>
          <div className="status-content">
            <div className="status-value">{formatNumber(semVendas)}</div>
            <div className="status-label">Sem Vendas</div>
            <div className="status-percentage">{calculatePercentage(semVendas, total)}%</div>
          </div>
        </div>
        
        <div className="status-card sem-movimento">
          <div className="status-icon">⚫</div>
          <div className="status-content">
            <div className="status-value">{formatNumber(semMovimento)}</div>
            <div className="status-label">Sem Movimento</div>
            <div className="status-percentage">{calculatePercentage(semMovimento, total)}%</div>
          </div>
        </div>
        
        <div className="status-card total">
          <div className="status-icon">📊</div>
          <div className="status-content">
            <div className="status-value">{formatNumber(total)}</div>
            <div className="status-label">Total</div>
            <div className="status-percentage">100%</div>
          </div>
        </div>
      </div>
      
      {/* Indicadores de ação */}
      <div className="action-indicators">
        <div className="urgent-actions">
          <h4>Ações Urgentes</h4>
          <div className="action-item">
            <span className="action-icon">🔴</span>
            <span className="action-text">
              {formatNumber(critico)} produtos precisam de reposição imediata
            </span>
          </div>
          {baixo > 0 && (
            <div className="action-item">
              <span className="action-icon">🟡</span>
              <span className="action-text">
                {formatNumber(baixo)} produtos precisam de atenção
              </span>
            </div>
          )}
        </div>
        
        {excesso > 0 && (
          <div className="optimization-actions">
            <h4>Oportunidades de Otimização</h4>
            <div className="action-item">
              <span className="action-icon">🔵</span>
              <span className="action-text">
                {formatNumber(excesso)} produtos com estoque em excesso
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusSummary;