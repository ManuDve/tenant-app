/**
 * Componente de Loading con spinner
 */
export const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

/**
 * Componente de Error
 */
export const ErrorAlert = ({ message }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
    <strong>Error:</strong> {message}
  </div>
);

/**
 * Componente de mensaje vacío
 */
export const EmptyState = ({ message = 'No hay datos disponibles' }) => (
  <tr>
    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
      {message}
    </td>
  </tr>
);
