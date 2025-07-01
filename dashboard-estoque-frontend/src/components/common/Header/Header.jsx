import React from 'react';
import './Header.scss';

const Header = () => {
  return (
    <header className="header">
      <div className="header__container">
        <div className="header__brand">
          <h1 className="header__title">Dashboard Estoque</h1>
          <span className="header__subtitle">Sistema de Gestão Protheus</span>
        </div>
        
        <div className="header__info">
          <div className="header__status">
            <span className="header__status-dot header__status-dot--online"></span>
            <span className="header__status-text">Online</span>
          </div>
          
          <div className="header__version">
            v{process.env.REACT_APP_VERSION || '1.0.0'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;