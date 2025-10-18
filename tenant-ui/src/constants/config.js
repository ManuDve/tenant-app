// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090';
export const API_ENDPOINTS = {
  TENANTS: '/api/tenants',
};

// Type Person Badges
export const TENANT_TYPES = {
  ARRENDATARIO: 'ARRENDATARIO',
  PROPIETARIO: 'PROPIETARIO',
  ADMINISTRADOR: 'ADMINISTRADOR',
};

export const TENANT_TYPE_COLORS = {
  ARRENDATARIO: 'bg-blue-100 text-blue-800',
  PROPIETARIO: 'bg-green-100 text-green-800',
  ADMINISTRADOR: 'bg-purple-100 text-purple-800',
};

// Table Configuration
export const TENANT_COLUMNS = [
  { key: 'numrun', label: 'RUN' },
  { key: 'primerNombre', label: 'Primer Nombre' },
  { key: 'segundoNombre', label: 'Segundo Nombre' },
  { key: 'apellidoPaterno', label: 'Apellido Paterno' },
  { key: 'apellidoMaterno', label: 'Apellido Materno' },
  { key: 'tipoPersona', label: 'Tipo Persona' },
];
