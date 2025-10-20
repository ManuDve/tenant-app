import { API_BASE_URL, API_ENDPOINTS } from '../constants/config';

/**
 * Servicio para operaciones de morosidades
 */
const morosidadService = {
  /**
   * Genera un reporte de morosidades
   * @param {number} annoMes - Año-Mes en formato YYYYMM
   * @returns {Promise<Object>}
   */
  generarReporte: async (annoMes) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MOROSIDADES_REPORTE}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ annoMes }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al generar reporte');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene detalle de morosidades
   * @param {number} numrun - RUN del residente (opcional)
   * @returns {Promise<Array>}
   */
  obtenerDetalle: async (numrun = null) => {
    try {
      let url = `${API_BASE_URL}${API_ENDPOINTS.MOROSIDADES_DETALLE}`;
      if (numrun) {
        url += `?numrun=${numrun}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener detalle de morosidades');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene auditoría de morosidades
   * @returns {Promise<Array>}
   */
  obtenerAuditoria: async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MOROSIDADES_AUDITORIA}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener auditoría');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene auditoría de pagos
   * @returns {Promise<Array>}
   */
  obtenerAuditoriaPagos: async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MOROSIDADES_AUDITORIA_PAGOS}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener auditoría de pagos');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};

export default morosidadService;
