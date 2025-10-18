import { formatRUN, formatName, getTenantTypeBadgeColor } from '../utils/formatters';

/**
 * Componente que renderiza una fila de la tabla de arrendatarios
 */
function TenantRow({ tenant }) {
  if (!tenant) return null;

  return (
    <tr className="border-b hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        {formatRUN(tenant.numrun, tenant.dvrun)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-700">
        {formatName(tenant.primerNombre)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-700">
        {formatName(tenant.segundoNombre)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-700">
        {formatName(tenant.apellidoPaterno)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-700">
        {formatName(tenant.apellidoMaterno)}
      </td>
      <td className="px-6 py-4 text-sm">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTenantTypeBadgeColor(tenant.tipoPersona)}`}>
          {tenant.tipoPersona}
        </span>
      </td>
    </tr>
  );
}

export default TenantRow;
