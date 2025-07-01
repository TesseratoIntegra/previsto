import React from 'react';
import './Layout.scss';
import Header from '../common/Header/Header';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        <div className="layout__container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;