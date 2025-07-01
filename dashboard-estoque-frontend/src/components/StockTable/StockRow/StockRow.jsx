import React from 'react';
import './StockRow.scss';
import { formatNumber, formatPercentage } from '../../../utils/formatters';

const StockRow = ({ stock, index }) => {
  const isEvenRow = index % 2 === 0;
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'DISPONIVEL':
        return 'stock-row__status--disponivel';
      case 'BAIXO_ESTOQUE':
        return 'stock-row__status--baixo';
      case 'SEM_ESTOQUE':
        return 'stock-row__status--sem-estoque';
      case 'ALTA_RESERVA':
        return 'stock-row__status--alta-reserva';
      default:
        return 'stock-row__status--default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'DISPONIVEL':
        return 'Disponível';
      case 'BAIXO_ESTOQUE':
        return 'Baixo Estoque';
      case 'SEM_ESTOQUE':
        return 'Sem Estoque';
      case 'ALTA_RESERVA':
        return 'Alta Reserva';
      default:
        return 'N/A';
    }
  };

  return (
    <tr className={`stock-row ${isEvenRow ? 'stock-row--even' : 'stock-row--odd'}`}>
      {/* Identificação */}
      <td className="stock-row__cell stock-row__cell--filial">
        <span className="stock-row__badge stock-row__badge--filial">
          {stock.filial || '-'}
        </span>
      </td>
      
      <td className="stock-row__cell stock-row__cell--codigo">
        <code className="stock-row__code">
          {stock.code || '-'}
        </code>
      </td>
      
      <td className="stock-row__cell stock-row__cell--descricao">
        <span className="stock-row__description" title={stock.description}>
          {stock.description || '-'}
        </span>
      </td>
      
      <td className="stock-row__cell stock-row__cell--local">
        <span className="stock-row__badge stock-row__badge--local">
          {stock.local || '-'}
        </span>
      </td>
      
      {/* Informações do Produto */}
      <td className="stock-row__cell stock-row__cell--tipo">
        <span className="stock-row__badge stock-row__badge--tipo">
          {stock.tipo || '-'}
        </span>
      </td>
      
      <td className="stock-row__cell stock-row__cell--um">
        <span className="stock-row__text">
          {stock.unidade_medida || '-'}
        </span>
      </td>
      
      <td className="stock-row__cell stock-row__cell--grupo">
        <span className="stock-row__text">
          {stock.grupo || '-'}
        </span>
      </td>
      
      {/* Quantidades SB2 */}
      <td className="stock-row__cell stock-row__cell--saldo-atual">
        <span className="stock-row__number stock-row__number--primary">
          {formatNumber(stock.balance)}
        </span>
      </td>
      
      <td className="stock-row__cell stock-row__cell--reserva">
        <span className="stock-row__number stock-row__number--warning">
          {formatNumber(stock.reserved || 0)}
        </span>
      </td>
      
      <td className="stock-row__cell stock-row__cell--pedido-venda">
        <span className="stock-row__number stock-row__number--info">
          {formatNumber(stock.pedido_venda || 0)}
        </span>
      </td>
      
      {/* Campos Calculados */}
      <td className="stock-row__cell stock-row__cell--disponivel">
        <span className={`stock-row__number ${
          stock.saldo_disponivel > 0 
            ? 'stock-row__number--success' 
            : 'stock-row__number--danger'
        }`}>
          {formatNumber(stock.saldo_disponivel || 0)}
        </span>
      </td>
      
      <td className="stock-row__cell stock-row__cell--perc-reservado">
        <span className="stock-row__percentage">
          {formatPercentage(stock.percentual_reservado || 0)}
        </span>
      </td>
      
      <td className="stock-row__cell stock-row__cell--status">
        <span className={`stock-row__status ${getStatusClass(stock.status_estoque)}`}>
          {getStatusText(stock.status_estoque)}
        </span>
      </td>
    </tr>
  );
};

export default StockRow;