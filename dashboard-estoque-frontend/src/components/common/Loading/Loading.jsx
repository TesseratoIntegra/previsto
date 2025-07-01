import React from 'react';
import './Loading.scss';

const Loading = ({ message = 'Carregando...', size = 'medium' }) => {
  return (
    <div className={`loading loading--${size}`}>
      <div className="loading__spinner">
        <div className="loading__spinner-circle"></div>
      </div>
      <span className="loading__message">{message}</span>
    </div>
  );
};

export default Loading;