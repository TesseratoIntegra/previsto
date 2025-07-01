import React from 'react';
import './StockHeader.scss';

const StockHeader = () => {
  return (
    <thead className="stock-header">
      <tr className="stock-header__row">
        {/* Identificação */}
        <th className="stock-header__cell stock-header__cell--filial">
          <span className="stock-header__label">Filial</span>
          <small className="stock-header__field">B2_FILIAL</small>
        </th>
        
        <th className="stock-header__cell stock-header__cell--codigo">
          <span className="stock-header__label">Código</span>
          <small className="stock-header__field">B2_COD</small>
        </th>
        
        <th className="stock-header__cell stock-header__cell--descricao">
          <span className="stock-header__label">Descrição</span>
          <small className="stock-header__field">B1_DESC</small>
        </th>
        
        <th className="stock-header__cell stock-header__cell--local">
          <span className="stock-header__label">Local</span>
          <small className="stock-header__field">B2_LOCAL</small>
        </th>
        
        {/* Informações do Produto */}
        <th className="stock-header__cell stock-header__cell--tipo">
          <span className="stock-header__label">Tipo</span>
          <small className="stock-header__field">B1_TIPO</small>
        </th>
        
        <th className="stock-header__cell stock-header__cell--um">
          <span className="stock-header__label">UM</span>
          <small className="stock-header__field">B1_UM</small>
        </th>
        
        <th className="stock-header__cell stock-header__cell--grupo">
          <span className="stock-header__label">Grupo</span>
          <small className="stock-header__field">B1_GRUPO</small>
        </th>
        
        {/* Quantidades SB2 */}
        <th className="stock-header__cell stock-header__cell--saldo-atual">
          <span className="stock-header__label">Saldo Atual</span>
          <small className="stock-header__field">B2_QATU</small>
        </th>
        
        <th className="stock-header__cell stock-header__cell--reserva">
          <span className="stock-header__label">Reservado</span>
          <small className="stock-header__field">B2_RESERVA</small>
        </th>
        
        <th className="stock-header__cell stock-header__cell--pedido-venda">
          <span className="stock-header__label">Ped. Venda</span>
          <small className="stock-header__field">B2_QPEDVEN</small>
        </th>
        
        {/* Campos Calculados */}
        <th className="stock-header__cell stock-header__cell--disponivel">
          <span className="stock-header__label">Disponível</span>
          <small className="stock-header__field">CALC</small>
        </th>
        
        <th className="stock-header__cell stock-header__cell--perc-reservado">
          <span className="stock-header__label">% Reservado</span>
          <small className="stock-header__field">CALC</small>
        </th>
        
        <th className="stock-header__cell stock-header__cell--status">
          <span className="stock-header__label">Status</span>
          <small className="stock-header__field">CALC</small>
        </th>
      </tr>
    </thead>
  );
};

export default StockHeader;