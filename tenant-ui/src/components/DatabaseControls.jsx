import { useState } from 'react';
import adminService from '../services/adminService';

/**
 * Componente para controlar la base de datos (limpiar y poblar)
 */
function DatabaseControls({ onSeedSuccess, onClearSuccess }) {
  const [loadingClear, setLoadingClear] = useState(false);
  const [loadingSeed, setLoadingSeed] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleClearDatabase = async () => {
    if (!window.confirm('¿Estás seguro de que deseas limpiar la base de datos? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoadingClear(true);
    setMessage(null);
    setError(null);

    try {
      const response = await adminService.clearDatabase();
      setMessage('Base de datos limpiada exitosamente');
      if (onClearSuccess) onClearSuccess(response);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoadingClear(false);
    }
  };

  const handleSeedDatabase = async () => {
    setLoadingSeed(true);
    setMessage(null);
    setError(null);

    try {
      const response = await adminService.seedDatabase();
      setMessage('Base de datos poblada exitosamente');
      if (onSeedSuccess) onSeedSuccess(response);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoadingSeed(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={handleClearDatabase}
          disabled={loadingClear || loadingSeed}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center gap-2"
        >
          {loadingClear ? (
            <>
              <span className="inline-block animate-spin">⟳</span>
              Limpiando...
            </>
          ) : (
            'Limpiar Base de Datos'
          )}
        </button>

        <button
          onClick={handleSeedDatabase}
          disabled={loadingClear || loadingSeed}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center gap-2"
        >
          {loadingSeed ? (
            <>
              <span className="inline-block animate-spin">⟳</span>
              Poblando (esto puede tardar)...
            </>
          ) : (
            'Poblar Base de Datos'
          )}
        </button>
      </div>

      {message && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">{message}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}

export default DatabaseControls;
