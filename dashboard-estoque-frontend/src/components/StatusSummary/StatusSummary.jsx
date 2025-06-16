import React from 'react';
import './StatusSummary.scss';

const StatusSummary = ({ summary }) => {
  if (!summary) return null;
  
  const { critico, baixo, adequado, excesso, semVendas } = summary;
  const total = critico + baixo + adequado + excesso + semVendas;
  
  const getPercentage = (value) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  };
  
  return (
    <div className="status-summary">
      <h3>Resumo de Status do Estoque</h3>
      <div className="status-cards">
        <div className="status-card critico">
          <div className="status-header">
            <span className="status-icon">🚨</span>
            <span className="status-title">Crítico</span>
          </div>
          <div className="status-value">{critico}</div>
          <div className="status-percentage">{getPercentage(critico)}%</div>
        </div>
        
        <div className="status-card baixo">
          <div className="status-header">
            <span className="status-icon">⚠️</span>
            <span className="status-title">Baixo</span>
          </div>
          <div className="status-value">{baixo}</div>
          <div className="status-percentage">{getPercentage(baixo)}%</div>
        </div>
        
        <div className="status-card adequado">
          <div className="status-header">
            <span className="status-icon">✅</span>
            <span className="status-title">Adequado</span>
          </div>
          <div className="status-value">{adequado}</div>
          <div className="status-percentage">{getPercentage(adequado)}%</div>
        </div>
        
        <div className="status-card excesso">
          <div className="status-header">
            <span className="status-icon">📈</span>
            <span className="status-title">Excesso</span>
          </div>
          <div className="status-value">{excesso}</div>
          <div className="status-percentage">{getPercentage(excesso)}%</div>
        </div>
        
        <div className="status-card sem-vendas">
          <div className="status-header">
            <span className="status-icon">💤</span>
            <span className="status-title">Sem Vendas</span>
          </div>
          <div className="status-value">{semVendas}</div>
          <div className="status-percentage">{getPercentage(semVendas)}%</div>
        </div>
      </div>
    </div>
  );
};

export default StatusSummary;