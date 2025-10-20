-- Script de diagnóstico para verificar privilegios y errores
-- Ejecutar este script primero para ver qué está pasando

-- Verificar privilegios del usuario actual
SELECT * FROM USER_SYS_PRIVS WHERE PRIVILEGE LIKE '%CREATE%';

-- Verificar errores de compilación de objetos
SELECT object_name, object_type, status
FROM USER_OBJECTS
WHERE object_type IN ('PACKAGE', 'PACKAGE BODY', 'TRIGGER', 'TYPE')
ORDER BY object_type, object_name;

-- Ver errores específicos de compilación
SELECT name, type, line, position, text
FROM USER_ERRORS
WHERE name IN ('PKG_MOROSIDADES', 'PKG_RESIDENTES')
ORDER BY name, type, sequence;

-- Verificar si el tipo existe
SELECT object_name, object_type, status
FROM USER_OBJECTS
WHERE object_name = 'TIPO_VARRAY_FECHAS_MORA';

-- Verificar si las tablas existen
SELECT table_name
FROM USER_TABLES
WHERE table_name IN ('DETALLE_MOROSIDAD', 'AUDITORIA_MOROSIDADES', 'AUDITORIA_PAGOS')
ORDER BY table_name;

