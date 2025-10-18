import MainLayout from '../layouts/MainLayout';
import TenantTable from '../components/TenantTable';

/**
 * Página de gestión de arrendatarios
 */
function TenantsPage() {
  return (
    <MainLayout
      title="Gestión de Arrendatarios"
      subtitle="Listado de arrendatarios registrados en el sistema"
    >
      <TenantTable />
    </MainLayout>
  );
}

export default TenantsPage;
