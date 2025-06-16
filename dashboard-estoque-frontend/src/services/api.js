// API para comunicação com o backend Django

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://seu-dominio-de-producao.com/api'
  : 'http://localhost:8000/api';

/**
 * Busca dados de estoque do backend
 * @returns {Promise<Array>} Dados de estoque
 */
export const fetchEstoqueData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/estoque/`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados de estoque: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados de estoque:', error);
    throw error;
  }
};

/**
 * Busca dados de vendas do backend
 * @returns {Promise<Array>} Dados de vendas
 */
export const fetchVendasData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/vendas/`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados de vendas: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados de vendas:', error);
    throw error;
  }
};

/**
 * Busca dados processados (combinados de estoque e vendas) do backend
 * @returns {Promise<Array>} Dados processados
 */
export const fetchProcessedData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/processados/`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados processados: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados processados:', error);
    throw error;
  }
};

/**
 * Envia arquivo de estoque para processamento no backend
 * @param {File} file Arquivo de estoque
 * @returns {Promise<Object>} Resultado do upload
 */
export const uploadEstoqueFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload/estoque/`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao enviar arquivo de estoque: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao enviar arquivo de estoque:', error);
    throw error;
  }
};

/**
 * Envia arquivo de vendas para processamento no backend
 * @param {File} file Arquivo de vendas
 * @returns {Promise<Object>} Resultado do upload
 */
export const uploadVendasFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload/vendas/`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao enviar arquivo de vendas: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao enviar arquivo de vendas:', error);
    throw error;
  }
};

