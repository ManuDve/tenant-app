import { API_BASE_URL, API_ENDPOINTS } from '../constants/config';

/**
 * Clase para manejar las llamadas a la API
 */
class TenantService {
  /**
   * Obtiene la lista de arrendatarios
   * @returns {Promise<Array>} Lista de arrendatarios
   * @throws {Error} Si la llamada falla
   */
  async getTenants() {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.TENANTS}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Si es un error 503, podría ser BD no inicializada
        if (response.status === 503) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Base de datos no inicializada');
        }
        throw new Error(
          `Error ${response.status}: ${response.statusText || 'Error desconocido'}`
        );
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  }

  /**
   * Obtiene un arrendatario específico por RUN
   * @param {number} numrun - Número del RUN
   * @param {string} dvrun - Dígito verificador
   * @returns {Promise<Object>} Datos del arrendatario
   */
  async getTenantByRun(numrun, dvrun) {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.TENANTS}/${numrun}-${dvrun}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Error ${response.status}: ${response.statusText || 'Error desconocido'}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching tenant:', error);
      throw error;
    }
  }
}

export default new TenantService();
