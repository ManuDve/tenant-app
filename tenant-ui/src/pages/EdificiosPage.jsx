import { useState, useMemo, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import edificioService from '../services/edificioService';
import { LoadingSpinner, ErrorAlert, EmptyState } from '../components/ui/StateComponents';

/**
 * Página para ver listado de edificios
 */
function EdificiosPage() {
  const [edificios, setEdificios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Cargar edificios automáticamente al montar
  useEffect(() => {
    handleCargarEdificios();
  }, []);

  const handleCargarEdificios = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await edificioService.obtenerTodos();
      setEdificios(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
      setEdificios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (columnKey) => {
    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
    setCurrentPage(1);
  };

  const sortedEdificios = useMemo(() => {
    if (!sortConfig.key) return edificios;

    const sorted = [...edificios].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null || bValue == null) return 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue, 'es')
          : bValue.localeCompare(aValue, 'es');
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return sorted;
  }, [edificios, sortConfig]);

  const paginatedEdificios = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedEdificios.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedEdificios, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedEdificios.length / itemsPerPage);
  const totalMorosidad = edificios.reduce((sum, e) => sum + (e.promedioMorosidad || 0), 0);

  if (loading && edificios.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <MainLayout
      title="Gestión de Edificios"
      subtitle="Listado de edificios y promedio de morosidad"
    >
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Controles */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <button
            onClick={handleCargarEdificios}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Cargando...' : 'Cargar Edificios'}
          </button>
        </div>

        {error && <ErrorAlert message={error} />}

        {/* Resumen */}
        {edificios.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total de Edificios</p>
                <p className="text-3xl font-bold text-blue-600">{edificios.length}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Morosidad Total</p>
                <p className="text-3xl font-bold text-red-600">
                  ${totalMorosidad.toLocaleString('es-CL')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Promedio por Edificio</p>
                <p className="text-3xl font-bold text-green-600">
                  ${Math.round(totalMorosidad / edificios.length).toLocaleString('es-CL')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabla */}
        {edificios.length > 0 ? (
          <>
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="w-full bg-white">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    {[
                      { key: 'idEdif', label: 'ID' },
                      { key: 'nombreEdif', label: 'Nombre' },
                      { key: 'direccion', label: 'Dirección' },
                      { key: 'comuna', label: 'Comuna' },
                      { key: 'promedioMorosidad', label: 'Promedio Morosidad' },
                    ].map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {col.label}
                          {sortConfig.key === col.key && (
                            <span className="text-xs">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedEdificios.map((edificio, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {edificio.idEdif}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {edificio.nombreEdif}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {edificio.direccion}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {edificio.comuna}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-red-600">
                        ${(edificio.promedioMorosidad || 0).toLocaleString('es-CL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex flex-col gap-4 bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                  <span className="font-semibold">
                    {Math.min(currentPage * itemsPerPage, sortedEdificios.length)}
                  </span>{' '}
                  de <span className="font-semibold">{sortedEdificios.length}</span> resultados
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700 font-medium">
                    Mostrar:
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-600">por página</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  Inicio
                </button>

                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  Anterior
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))
                    .map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  Siguiente
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  Final
                </button>
              </div>
            </div>
          </>
        ) : (
          !loading && <EmptyState message="No hay edificios cargados. Presiona 'Cargar Edificios' para obtener datos." />
        )}
      </div>
    </MainLayout>
  );
}

export default EdificiosPage;
