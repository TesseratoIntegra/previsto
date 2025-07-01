import api from './api';

class StockService {
  
  /**
   * Busca dados de estoque (SB2) com paginação e filtros
   * @param {Object} params - Parâmetros de consulta
   * @param {number} params.page - Página atual
   * @param {number} params.page_size - Itens por página
   * @param {string} params.filial - Código da filial
   * @param {string} params.armazem - Código do armazém
   * @returns {Promise} - Dados de estoque paginados
   */
  async getStocks(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Paginação
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      
      // Filtros
      if (params.filial) queryParams.append('filial', params.filial);
      if (params.armazem) queryParams.append('armazem', params.armazem);
      
      const response = await api.get(`/stocks/?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data.results || [],
        pagination: {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          total_pages: response.data.total_pages,
          current_page: response.data.current_page,
          page_size: response.data.page_size,
        }
      };
    } catch (error) {
      console.error('[StockService] Erro ao buscar estoque:', error);
      
      return {
        success: false,
        error: this.handleError(error),
        data: [],
        pagination: null
      };
    }
  }

  /**
   * Busca dados detalhados de estoque com informações completas
   * Inclui todos os campos da SB2 + dados relacionados da SB1
   * @param {Object} params - Parâmetros de consulta
   * @returns {Promise} - Dados detalhados de estoque
   */
  async getDetailedStocks(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Paginação
      queryParams.append('page', params.page || 1);
      queryParams.append('page_size', params.page_size || 50);
      
      // Filtros
      if (params.filial) queryParams.append('filial', params.filial);
      if (params.armazem) queryParams.append('armazem', params.armazem);
      
      const response = await api.get(`/stocks/?${queryParams.toString()}`);
      
      // Processar dados para incluir campos calculados
      const processedData = response.data.results?.map(item => ({
        ...item,
        saldo_disponivel: (item.balance || 0) - (item.reserved || 0),
        percentual_reservado: item.balance > 0 ? 
          ((item.reserved || 0) / item.balance * 100).toFixed(2) : 0,
        status_estoque: this.getStockStatus(item.balance, item.reserved)
      })) || [];
      
      return {
        success: true,
        data: processedData,
        pagination: {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          total_pages: response.data.total_pages,
          current_page: response.data.current_page,
          page_size: response.data.page_size,
        }
      };
    } catch (error) {
      console.error('[StockService] Erro ao buscar estoque detalhado:', error);
      
      return {
        success: false,
        error: this.handleError(error),
        data: [],
        pagination: null
      };
    }
  }

  /**
   * Calcula status do estoque baseado nos saldos
   * @param {number} balance - Saldo atual
   * @param {number} reserved - Quantidade reservada
   * @returns {string} - Status do estoque
   */
  getStockStatus(balance = 0, reserved = 0) {
    const available = balance - reserved;
    
    if (available <= 0) return 'SEM_ESTOQUE';
    if (available <= 10) return 'BAIXO_ESTOQUE';
    if (reserved > balance * 0.8) return 'ALTA_RESERVA';
    return 'DISPONIVEL';
  }

  /**
   * Formata mensagem de erro para exibição
   * @param {Error} error - Objeto de erro
   * @returns {string} - Mensagem de erro formatada
   */
  handleError(error) {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          return 'Parâmetros inválidos. Verifique os filtros aplicados.';
        case 404:
          return 'Endpoint não encontrado. Verifique a configuração da API.';
        case 500:
          return 'Erro interno do servidor. Tente novamente em alguns instantes.';
        case 408:
          return 'Timeout na consulta. Tente refinar os filtros.';
        default:
          return `Erro ${error.response.status}: ${error.response.data?.message || 'Erro desconhecido'}`;
      }
    } else if (error.request) {
      return 'Erro de conexão. Verifique sua internet e se o servidor está funcionando.';
    } else {
      return `Erro de configuração: ${error.message}`;
    }
  }

  /**
   * Busca resumo do estoque por filial
   * @returns {Promise} - Resumo agregado do estoque
   */
  async getStockSummary() {
    try {
      const response = await api.get('/stocks/summary/');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('[StockService] Erro ao buscar resumo:', error);
      
      return {
        success: false,
        error: this.handleError(error),
        data: null
      };
    }
  }
}

export default new StockService();