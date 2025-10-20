import { API_BASE_URL, API_ENDPOINTS } from '../constants/config';

/**
 * Servicio para operaciones de edificios
 */
const edificioService = {
  /**
   * Obtiene lista de edificios
   * @returns {Promise<Array>}
   */
  obtenerTodos: async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.EDIFICIOS}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener edificios');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};

export default edificioService;
