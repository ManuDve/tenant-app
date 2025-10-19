import { API_BASE_URL, API_ENDPOINTS } from '../constants/config';

/**
 * Servicio para operaciones de administración de la base de datos
 */
const adminService = {
  /**
   * Limpia la base de datos
   * @returns {Promise<Object>} Respuesta del servidor
   */
  clearDatabase: async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.ADMIN_CLEAR}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al limpiar la base de datos');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Pobla la base de datos con datos iniciales
   * @returns {Promise<Object>} Respuesta del servidor
   */
  seedDatabase: async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.ADMIN_SEED}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al poblar la base de datos');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};

export default adminService;
