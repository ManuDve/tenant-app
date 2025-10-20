import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DatabaseControls from '../components/DatabaseControls';
import morosidadService from '../services/morosidadService';
import edificioService from '../services/edificioService';
import tenantService from '../services/tenantService';
import { LoadingSpinner, ErrorAlert } from './ui/StateComponents';

/**
 * HomePage con Dashboard de estadísticas generales y navegación
 */
function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalMorosos: 0,
    totalEdificios: 0,
    totalDeuda: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);

  // Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      setLoadingStats(true);
      try {
        // Intentar cargar datos para verificar si BD está inicializada
        const [tenantsData, morosidadData, edificiosData] = await Promise.allSettled([
          tenantService.obtenerTodos(),
          morosidadService.obtenerDetalle(),
          edificioService.obtenerTodos(),
        ]);

        let newStats = {
          totalTenants: 0,
          totalMorosos: 0,
          totalEdificios: 0,
          totalDeuda: 0,
        };

        let initialized = true;

        // Procesar tenants
        if (tenantsData.status === 'fulfilled' && Array.isArray(tenantsData.value)) {
          newStats.totalTenants = tenantsData.value.length;
        } else if (tenantsData.status === 'rejected') {
          initialized = false;
        }

        // Procesar morosidades
        if (morosidadData.status === 'fulfilled' && Array.isArray(morosidadData.value)) {
          newStats.totalMorosos = morosidadData.value.length;
          newStats.totalDeuda = morosidadData.value.reduce((sum, m) => sum + (m.deuda || 0), 0);
        } else if (morosidadData.status === 'rejected') {
          initialized = false;
        }

        // Procesar edificios
        if (edificiosData.status === 'fulfilled' && Array.isArray(edificiosData.value)) {
          newStats.totalEdificios = edificiosData.value.length;
        } else if (edificiosData.status === 'rejected') {
          initialized = false;
        }

        setStats(newStats);
        setDbInitialized(initialized);
      } catch (err) {
        console.error('Error loading stats:', err);
        setDbInitialized(false);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  const navigationCards = [
    {
      title: 'Tenants',
      description: 'Ver lista de todos los arrendatarios, dueños y representantes',
      path: '/tenants',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      stat: stats.totalTenants,
      statLabel: 'Registros',
    },
    {
      title: 'Morosidades',
      description: 'Ver lista de deudores con deudas mayores a $100,000',
      path: '/morosidad',
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
      stat: `$${stats.totalDeuda.toLocaleString('es-CL')}`,
      statLabel: 'Deuda Total',
    },
    {
      title: 'Edificios',
      description: 'Ver lista de edificios con métricas de morosidad',
      path: '/edificios',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      stat: stats.totalEdificios,
      statLabel: 'Edificios',
    },
    {
      title: 'Auditoría Morosidad',
      description: 'Historial de cambios en morosidades mayores a $100,000',
      path: '/auditoria-morosidad',
      color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
      stat: '-',
      statLabel: 'Auditoria',
    },
    {
      title: 'Auditoría Pagos',
      description: 'Historial de pagos parciales registrados',
      path: '/auditoria-pagos',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      stat: '-',
      statLabel: 'Pagos',
    },
    {
      title: 'Flujo de Prueba',
      description: 'Ejecutar manualmente 14 pasos del flujo completo',
      path: '/flow',
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
      stat: '14',
      statLabel: 'Pasos',
    },
  ];

  if (loadingStats) {
    return <LoadingSpinner />;
  }

  return (
    <MainLayout
      title="Dashboard Principal"
      subtitle="Panel de control y navegación de la aplicación"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Sección de Controles de Base de Datos */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-indigo-600">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Administración de Base de Datos</h2>
          <p className="text-gray-600 mb-4 text-sm">
            Usa estos controles para inicializar o limpiar la base de datos. Estos son pasos importantes antes de ejecutar el flujo de prueba.
          </p>
          <DatabaseControls onDataRefresh={() => window.location.reload()} />
        </div>

        {/* Información de Estado */}
        {!dbInitialized && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 text-yellow-800">
            <p className="font-semibold">Base de datos no inicializada</p>
            <p className="text-sm mt-1">
              Por favor, ejecuta "Poblar Base de Datos" en la sección de Administración antes de continuar.
            </p>
          </div>
        )}

        {/* Estadísticas Generales */}
        {dbInitialized && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Estadísticas Generales</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                <p className="text-gray-600 text-sm font-medium mb-2">Total Tenants</p>
                <p className="text-3xl font-bold text-blue-700">{stats.totalTenants}</p>
                <p className="text-xs text-gray-600 mt-2">registros activos</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md p-6 border-l-4 border-red-600">
                <p className="text-gray-600 text-sm font-medium mb-2">Total Morosos</p>
                <p className="text-3xl font-bold text-red-700">{stats.totalMorosos}</p>
                <p className="text-xs text-gray-600 mt-2">deudores registrados</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6 border-l-4 border-green-600">
                <p className="text-gray-600 text-sm font-medium mb-2">Total Edificios</p>
                <p className="text-3xl font-bold text-green-700">{stats.totalEdificios}</p>
                <p className="text-xs text-gray-600 mt-2">edificios registrados</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-6 border-l-4 border-purple-600">
                <p className="text-gray-600 text-sm font-medium mb-2">Deuda Total</p>
                <p className="text-3xl font-bold text-purple-700">
                  ${(stats.totalDeuda / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-gray-600 mt-2">millones de pesos</p>
              </div>
            </div>
          </div>
        )}

        {/* Navegación Principal */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Secciones Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {navigationCards.map((card) => (
              <button
                key={card.path}
                onClick={() => navigate(card.path)}
                className={`p-6 rounded-lg shadow-md border-2 transition-all hover:shadow-lg active:scale-95 ${card.color}`}
              >
                <div className="text-3xl mb-3">{card.stat}</div>
                <h3 className="text-lg font-bold text-gray-900 text-left mb-1">{card.title}</h3>
                <p className="text-sm text-gray-600 text-left mb-4">{card.description}</p>
                <div className="bg-white bg-opacity-50 rounded p-2 text-center">
                  <div className="text-xs text-gray-600">{card.statLabel}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Instrucciones de Uso</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Inicia por "Administración de Base de Datos" para inicializar los datos</li>
            <li>Revisa las estadísticas generales para confirmar que los datos fueron cargados</li>
            <li>Usa las tarjetas de navegación para explorar diferentes secciones</li>
            <li>Ejecuta el "Flujo de Prueba" para realizar pruebas del sistema completo</li>
            <li>Consulta las auditorías para ver historial de cambios</li>
          </ol>
        </div>
      </div>
    </MainLayout>
  );
}

export default HomePage;
