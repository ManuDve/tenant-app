import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DatabaseControls from '../components/DatabaseControls';
import { useDbStatus } from '../hooks/useDbStatus';

/**
 * Página de inicio con controles de base de datos
 */
function HomePage() {
  const navigate = useNavigate();
  const { isInitialized, loading, refetch } = useDbStatus();
  const [dbInitialized, setDbInitialized] = useState(false);

  // Actualizar estado local cuando cambia el estado de la BD
  useEffect(() => {
    setDbInitialized(isInitialized);
  }, [isInitialized]);

  const handleSeedSuccess = () => {
    setDbInitialized(true);
    refetch();
  };

  const handleClearSuccess = () => {
    setDbInitialized(false);
    refetch();
  };

  return (
    <MainLayout title="Inicio" subtitle="Gestión de Tenants">
      <div className="max-w-4xl mx-auto">
        {/* Tarjeta Principal */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido al Sistema de Tenants</h2>
            <p className="text-gray-600">
              Administra la base de datos y visualiza el listado de arrendatarios
            </p>
          </div>

          {/* Controles de BD */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Administración de Base de Datos</h3>
            <DatabaseControls
              onSeedSuccess={handleSeedSuccess}
              onClearSuccess={handleClearSuccess}
            />
          </div>

          {/* Instrucciones */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Instrucciones</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">1.</span>
                <span><strong>Limpiar Base de Datos:</strong> Elimina todos los registros. Usa esto para empezar de cero.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">2.</span>
                <span><strong>Poblar Base de Datos:</strong> Inserta datos de prueba iniciales. Necesario para ver registros.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">3.</span>
                <span><strong>Ver Tenants:</strong> Accede al listado completo de arrendatarios una vez la BD esté poblada.</span>
              </li>
            </ul>
          </div>

          {/* Estado de BD */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Estado Actual</h3>
            {loading ? (
              <div className="flex items-center gap-3">
                <span className="inline-block animate-spin">⟳</span>
                <span className="text-gray-700">Verificando estado de la base de datos...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${dbInitialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-700">
                  Base de datos: <strong>{dbInitialized ? 'Inicializada' : 'No inicializada'}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Botón para ir a Tenants */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/tenants')}
              disabled={!dbInitialized}
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md text-lg"
              title={dbInitialized ? 'Ver lista de tenants' : 'Primero debes poblar la base de datos'}
            >
              {dbInitialized ? 'Ver Tenants' : 'Pobla la BD primero'}
            </button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">Nota Importante</h3>
          <p className="text-yellow-800">
            Si ves el mensaje "Base de datos no inicializada" al intentar acceder a Tenants, 
            primero ejecuta el botón <strong>"Poblar Base de Datos"</strong> desde esta página.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export default HomePage;
