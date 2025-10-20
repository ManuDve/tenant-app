import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Componente de breadcrumb para navegación
 */
function Breadcrumb() {
  const navigate = useNavigate();
  const location = useLocation();

  // Mapeo de rutas a etiquetas
  const routeLabels = {
    '/': 'Inicio',
    '/tenants': 'Tenants',
    '/morosidad': 'Morosidades',
    '/edificios': 'Edificios',
    '/auditoria-morosidad': 'Auditoría de Morosidades',
    '/auditoria-pagos': 'Auditoría de Pagos',
    '/registro-pagos': 'Registro de Pagos',
    '/flow': 'Flujo de Prueba',
  };

  // Generar breadcrumbs
  const generateBreadcrumbs = () => {
    const path = location.pathname;
    const label = routeLabels[path] || 'Página';
    
    return [
      { label: 'Inicio', path: '/', isCurrent: path === '/' },
      ...(path !== '/' ? [{ label, path, isCurrent: true }] : []),
    ];
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-2">
          {index > 0 && <span className="text-gray-400">/</span>}
          {crumb.isCurrent ? (
            <span className="text-gray-900 font-medium">{crumb.label}</span>
          ) : (
            <button
              onClick={() => navigate(crumb.path)}
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              {crumb.label}
            </button>
          )}
        </div>
      ))}
    </nav>
  );
}

export default Breadcrumb;
