import { useState, useMemo, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import morosidadService from '../services/morosidadService';
import { LoadingSpinner, ErrorAlert, EmptyState } from '../components/ui/StateComponents';

/**
 * Página para ver auditoría de pagos
 */
function AuditoriaPagosPage() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Cargar auditoría de pagos automáticamente al montar
  useEffect(() => {
    handleCargarAuditoria();
  }, []);

  const handleCargarAuditoria = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await morosidadService.obtenerAuditoriaPagos();
      setPagos(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
      setPagos([]);
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

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalPagos = pagos.reduce((sum, p) => {
      const monto = p.montoCancelado || 0;
      return sum + (parseFloat(monto) || 0);
    }, 0);
    const promedioPago = pagos.length > 0 ? totalPagos / pagos.length : 0;
    return {
      totalPagos,
      promedioPago,
      cantidadPagos: pagos.length,
    };
  }, [pagos]);

  const sortedPagos = useMemo(() => {
    if (!sortConfig.key) return pagos;

    const sorted = [...pagos].sort((a, b) => {
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
  }, [pagos, sortConfig]);

  const paginatedPagos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedPagos.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedPagos, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedPagos.length / itemsPerPage);

  if (loading && pagos.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <MainLayout
      title="Auditoría de Pagos"
      subtitle="Historial de pagos parciales registrados"
    >
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Controles */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <button
            onClick={handleCargarAuditoria}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Cargando...' : 'Cargar Auditoría de Pagos'}
          </button>
        </div>

        {error && <ErrorAlert message={error} />}

        {/* Estadísticas */}
        {pagos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6 border-l-4 border-green-600">
              <p className="text-gray-600 text-sm font-medium mb-1">Total de Pagos</p>
              <p className="text-2xl font-bold text-green-700">
                ${stats.totalPagos.toLocaleString('es-CL')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border-l-4 border-blue-600">
              <p className="text-gray-600 text-sm font-medium mb-1">Cantidad de Pagos</p>
              <p className="text-2xl font-bold text-blue-700">
                {stats.cantidadPagos}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-6 border-l-4 border-purple-600">
              <p className="text-gray-600 text-sm font-medium mb-1">Promedio por Pago</p>
              <p className="text-2xl font-bold text-purple-700">
                ${stats.promedioPago.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        )}

        {/* Tabla */}
        {pagos.length > 0 ? (
          <>
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="w-full bg-white">
                <thead>
                  <tr className="bg-green-600 text-white">
                    {[
                      { key: 'annoMes', label: 'Período' },
                      { key: 'montoCancelado', label: 'Monto' },
                      { key: 'idEdif', label: 'Edificio' },
                      { key: 'nroDepto', label: 'Depto' },
                      { key: 'operacion', label: 'Operación' },
                      { key: 'fechaAuditoria', label: 'Fecha Auditoría' },
                    ].map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-green-700 transition-colors"
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
                {paginatedPagos.map((pago, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {pago.annoMes}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        ${(pago.montoCancelado || 0).toLocaleString('es-CL')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {pago.idEdif}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {pago.nroDepto}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {pago.operacion}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {pago.fechaAuditoria}
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
                    {Math.min(currentPage * itemsPerPage, sortedPagos.length)}
                  </span>{' '}
                  de <span className="font-semibold">{sortedPagos.length}</span> resultados
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
                            ? 'bg-green-600 text-white'
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
          !loading && <EmptyState message="No hay registros de pagos. Carga la auditoría de pagos." />
        )}
      </div>
    </MainLayout>
  );
}

export default AuditoriaPagosPage;
