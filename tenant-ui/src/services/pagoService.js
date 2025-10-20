import { API_BASE_URL, API_ENDPOINTS } from '../constants/config';

/**
 * Servicio para operaciones de pagos
 */
const pagoService = {
  /**
   * Registra un pago parcial
   * @param {Object} data - Datos del pago
   * @returns {Promise<Object>}
   */
  registrarParcial: async (data) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.PAGOS_REGISTRAR}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar pago');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};

export default pagoService;
