import { useTenants } from '../hooks/useTenants';
import { TENANT_COLUMNS } from '../constants/config';
import TenantRow from './TenantRow';
import { LoadingSpinner, ErrorAlert, EmptyState } from './ui/StateComponents';

/**
 * Componente principal que renderiza la tabla de arrendatarios
 */
function TenantTable() {
  const { tenants, loading, error } = useTenants();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="w-full bg-white">
        <thead>
          <tr className="bg-blue-600 text-white">
            {TENANT_COLUMNS.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-sm font-semibold"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tenants.length > 0 ? (
            tenants.map((tenant) => (
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
  );
}

export default TenantTable;
