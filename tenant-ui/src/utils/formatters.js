import { TENANT_TYPE_COLORS } from '../constants/config';

/**
 * Formatea el RUN chileno con dígito verificador
 * @param {number} numrun - Número del RUN
 * @param {string|number} dvrun - Dígito verificador
 * @returns {string} RUN formateado (ej: 9074610-1)
 */
export const formatRUN = (numrun, dvrun) => {
  if (!numrun || dvrun === undefined) return '-';
  return `${numrun}-${dvrun}`;
};

/**
 * Obtiene la clase de color para el badge de tipo de persona
 * @param {string} tipoPersona - Tipo de persona
 * @returns {string} Clases de Tailwind CSS
 */
export const getTenantTypeBadgeColor = (tipoPersona) => {
  return TENANT_TYPE_COLORS[tipoPersona] || 'bg-gray-100 text-gray-800';
};

/**
 * Formatea nombres, manejando valores nulos o undefined
 * @param {string|null} nombre - Nombre a formatear
 * @returns {string} Nombre formateado o "-"
 */
export const formatName = (nombre) => {
  return nombre ? nombre.trim() : '-';
};

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
