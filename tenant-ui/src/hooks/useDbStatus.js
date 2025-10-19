import { useEffect, useState } from 'react';
import tenantService from '../services/tenantService';

/**
 * Hook para verificar si la base de datos está inicializada
 * @returns {Object} { isInitialized, loading, error, refetch }
 */
export const useDbStatus = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkDbStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      // Intenta obtener tenants para verificar si la BD existe
      await tenantService.getTenants();
      setIsInitialized(true);
    } catch (err) {
      // Si hay error de BD no inicializada, no está inicializada
      if (err.message && err.message.includes('no inicializada')) {
        setIsInitialized(false);
      } else {
        setError(err.message);
      }
      setIsInitialized(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDbStatus();
  }, []);

  return {
    isInitialized,
    loading,
    error,
    refetch: checkDbStatus,
  };
};
