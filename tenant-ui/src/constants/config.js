// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090';
export const API_ENDPOINTS = {
  // Admin/Database
  ADMIN_CLEAR: '/api/admin/database/clear',
  ADMIN_SEED: '/api/admin/database/seed',
  ADMIN_MOROSIDADES: '/api/admin/database/morosidades',
  ADMIN_DATOS_MOROSIDAD: '/api/admin/database/datos-morosidad',
  ADMIN_DIAGNOSTICO: '/api/admin/database/diagnostico',
  
  // Tenants
  TENANTS: '/api/tenants',
  
  // Morosidades
  MOROSIDADES_REPORTE: '/api/morosidades/generar-reporte',
  MOROSIDADES_DETALLE: '/api/morosidades/detalle',
  MOROSIDADES_AUDITORIA: '/api/morosidades/auditoria',
  MOROSIDADES_AUDITORIA_PAGOS: '/api/morosidades/auditoria-pagos',
  
  // Pagos
  PAGOS_REGISTRAR: '/api/pagos/registrar-parcial',
  
  // Edificios
  EDIFICIOS: '/api/edificios',
};

// Type Person Badges
export const TENANT_TYPES = {
  ARRENDATARIO: 'ARRENDATARIO',
  DUEÑO: 'DUEÑO',
  REPRESENTANTE_LEGAL: 'REPRESENTANTE LEGAL',
};

export const TENANT_TYPE_COLORS = {
  ARRENDATARIO: 'bg-blue-100 text-blue-800',
  DUEÑO: 'bg-green-100 text-green-800',
  REPRESENTANTE_LEGAL: 'bg-yellow-100 text-yellow-800',
};

// Table Configuration
export const TENANT_COLUMNS = [
  { key: 'numrun', label: 'RUT' },
  { key: 'primerNombre', label: 'Primer Nombre' },
  { key: 'segundoNombre', label: 'Segundo Nombre' },
  { key: 'apellidoPaterno', label: 'Apellido Paterno' },
  { key: 'apellidoMaterno', label: 'Apellido Materno' },
  { key: 'tipoPersona', label: 'Tipo Persona' },
];
