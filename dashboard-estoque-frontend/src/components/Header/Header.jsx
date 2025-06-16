import React from 'react';
import './Header.scss';

const Header = ({ title }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-icon">
          📊
        </div>
        <div className="header-text">
          <h1 className="header-title">{title}</h1>
          <p className="header-subtitle">Sistema de análise de estoque e vendas</p>
        </div>
      </div>
      <div className="header-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </header>
  );
};

export default Header;