import { useState, useMemo } from 'react';
import { useTenants } from '../hooks/useTenants';
import { TENANT_COLUMNS, TENANT_TYPES } from '../constants/config';
import TenantRow from './TenantRow';
import { LoadingSpinner, ErrorAlert, EmptyState } from './ui/StateComponents';

/**
 * Componente principal que renderiza la tabla de arrendatarios con ordenamiento y paginación
 */
function TenantTable() {
  const { tenants, loading, error } = useTenants();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterTipoPersona, setFilterTipoPersona] = useState('todos');

  // Función para ordenar
  const handleSort = (columnKey) => {
    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
    setCurrentPage(1); // Resetear a primera página al ordenar
  };

  // Ordenar datos
  const sortedTenants = useMemo(() => {
    if (!sortConfig.key) return tenants;

    const sorted = [...tenants].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null || bValue == null) return 0;

      // Comparación para strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue, 'es')
          : bValue.localeCompare(aValue, 'es');
      }

      // Comparación para números
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return sorted;
  }, [tenants, sortConfig]);

  // Filtrar por tipo de persona
  const filteredTenants = useMemo(() => {
    if (filterTipoPersona === 'todos') return sortedTenants;
    return sortedTenants.filter((tenant) => tenant.tipoPersona === filterTipoPersona);
  }, [sortedTenants, filterTipoPersona]);

  // Calcular datos paginados
  const paginatedTenants = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTenants.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTenants, currentPage]);

  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div className="w-full space-y-4">
      {/* Filtro por Tipo de Persona */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-3">
          <label htmlFor="filterTipoPersona" className="text-sm font-medium text-gray-700">
            Filtrar por Tipo de Persona:
          </label>
          <select
            id="filterTipoPersona"
            value={filterTipoPersona}
            onChange={(e) => {
              setFilterTipoPersona(e.target.value);
              setCurrentPage(1); // Resetear a primera página
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
          >
            <option value="todos">Todos</option>
            {Object.values(TENANT_TYPES).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {filterTipoPersona !== 'todos' && (
            <span className="text-sm text-gray-600">
              ({filteredTenants.length} resultado{filteredTenants.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-blue-600 text-white">
              {TENANT_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    <span
                      className={`inline-flex transition-opacity ${
                        sortConfig.key === column.key
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-50'
                      }`}
                    >
                      {sortConfig.key === column.key ? (
                        sortConfig.direction === 'asc' ? (
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M3 5a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-2 0V6H5v1a1 1 0 01-2 0V5zm0 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-2 0v-1H5v1a1 1 0 01-2 0v-2z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M3 5a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-2 0V6H5v1a1 1 0 01-2 0V5zm0 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-2 0v-1H5v1a1 1 0 01-2 0v-2z" />
                          </svg>
                        )
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                          />
                        </svg>
                      )}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedTenants.length > 0 ? (
              paginatedTenants.map((tenant) => (
                <TenantRow
                  key={`${tenant.numrun}-${tenant.dvrun}`}
                  tenant={tenant}
                />
              ))
            ) : (
              <EmptyState message="No hay arrendatarios disponibles" />
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {filteredTenants.length > 0 && (
        <div className="flex flex-col gap-4 bg-white p-4 rounded-lg shadow-md">
          {/* Fila superior: Información y opciones por página */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
              <span className="font-semibold">
                {Math.min(currentPage * itemsPerPage, filteredTenants.length)}
              </span>{' '}
              de <span className="font-semibold">{filteredTenants.length}</span> resultados
            </div>

            {/* Opciones de elementos por página */}
            <div className="flex items-center gap-3">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-700 font-medium">
                Mostrar:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1); // Resetear a primera página
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">por página</span>
            </div>
          </div>

          {/* Fila inferior: Botones de navegación */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              title="Ir al inicio"
            >
              ⟨⟨ Inicio
            </button>

            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>

            {/* Números de página */}
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(
                  Math.max(0, currentPage - 2),
                  Math.min(totalPages, currentPage + 1)
                )
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white font-semibold'
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
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              title="Ir al final"
            >
              Final ⟩⟩
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TenantTable;
