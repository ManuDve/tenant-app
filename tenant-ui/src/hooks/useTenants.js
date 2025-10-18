import { useEffect, useState } from 'react';
import tenantService from '../services/tenantService';

/**
 * Hook personalizado para obtener y gestionar el estado de los arrendatarios
 * @returns {Object} { tenants, loading, error, refetch }
 */
export const useTenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tenantService.getTenants();
      setTenants(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los arrendatarios');
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  return {
    tenants,
    loading,
    error,
    refetch: fetchTenants,
  };
};
