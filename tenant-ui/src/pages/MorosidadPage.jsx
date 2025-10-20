import { useState, useMemo, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import morosidadService from '../services/morosidadService';
import { LoadingSpinner, ErrorAlert, EmptyState } from '../components/ui/StateComponents';

function MorosidadPage() {
  const [morosos, setMorosos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    handleCargarMorosos();
  }, []);

  const handleCargarMorosos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await morosidadService.obtenerDetalle();
      setMorosos(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
      setMorosos([]);
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

  const stats = useMemo(() => {
    const totalDeuda = morosos.reduce(
      (sum, m) => sum + parseFloat(m.montoTotalMoroso || m.deuda || m.montoMoroso || m.monto || 0),
      0
    );
    const promedioDeuda = morosos.length > 0 ? totalDeuda / morosos.length : 0;
    return {
      totalMorosos: morosos.length,
      totalDeuda,
      promedioDeuda,
    };
  }, [morosos]);

  const sortedMorosos = useMemo(() => {
    if (!sortConfig.key) return morosos;

    const sorted = [...morosos].sort((a, b) => {
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
  }, [morosos, sortConfig]);

  const paginatedMorosos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedMorosos.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedMorosos, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedMorosos.length / itemsPerPage);

  if (loading && morosos.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <MainLayout
      title="Morosidades"
      subtitle="Historial de residentes con deuda registrada"
    >
      <div className="max-w-7xl mx-auto space-y-4">
        {morosos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border-l-4 border-blue-600">
              <p className="text-gray-600 text-sm font-medium mb-1">Total Morosos</p>
              <p className="text-2xl font-bold text-blue-700">{stats.totalMorosos}</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md p-6 border-l-4 border-red-600">
              <p className="text-gray-600 text-sm font-medium mb-1">Total Deuda</p>
              <p className="text-2xl font-bold text-red-700">
                ${stats.totalDeuda.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-6 border-l-4 border-purple-600">
              <p className="text-gray-600 text-sm font-medium mb-1">Promedio Deuda</p>
              <p className="text-2xl font-bold text-purple-700">
                ${stats.promedioDeuda.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        )}

        {error && <ErrorAlert message={error} />}

        {morosos.length > 0 ? (
          <>
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="w-full bg-white">
                <thead>
                  <tr className="bg-red-600 text-white">
                    {[
                      { key: 'numrun', label: 'RUN' },
                      { key: 'nombreCompleto', label: 'Nombre Completo' },
                      { key: 'montoTotalMoroso', label: 'Deuda' },
                      { key: 'fechaUltimaActualizacion', label: 'Fecha Actualización' },
                    ].map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-red-700 transition-colors"
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
                  {paginatedMorosos.map((moroso, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {moroso.numrun}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {moroso.nombreCompleto}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-red-600">
                        ${(moroso.montoTotalMoroso || 0).toLocaleString('es-CL')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {moroso.fechaUltimaActualizacion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                  <span className="font-semibold">
                    {Math.min(currentPage * itemsPerPage, sortedMorosos.length)}
                  </span>{' '}
                  de <span className="font-semibold">{sortedMorosos.length}</span> resultados
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700 font-medium">Mostrar:</label>
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
                            ? 'bg-red-600 text-white'
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
          !loading && <EmptyState message="No hay registros de morosidad." />
        )}
      </div>
    </MainLayout>
  );
}

export default MorosidadPage;
