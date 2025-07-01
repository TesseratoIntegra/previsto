import React from 'react';
import './ErrorMessage.scss';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <div className="error-message__icon">⚠️</div>
      <div className="error-message__content">
        <h3 className="error-message__title">Erro ao carregar dados</h3>
        <p className="error-message__text">{message}</p>
        {onRetry && (
          <button 
            className="btn btn--primary error-message__retry"
            onClick={onRetry}
          >
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;