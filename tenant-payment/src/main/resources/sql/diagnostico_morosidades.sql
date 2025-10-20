-- ========================================
-- SCRIPT DE DIAGNÓSTICO Y VERIFICACIÓN
-- ========================================

-- Verificar errores de compilación en paquetes
SELECT
    object_name,
    object_type,
    status,
    TO_CHAR(last_ddl_time, 'DD/MM/YYYY HH24:MI:SS') AS ultima_modificacion
FROM user_objects
WHERE object_name IN ('PKG_RESIDENTES', 'PKG_MOROSIDADES')
ORDER BY object_type, object_name;

-- Ver errores de compilación si existen
SELECT
    name,
    type,
    line,
    position,
    text AS error_message
FROM user_errors
WHERE name IN ('PKG_RESIDENTES', 'PKG_MOROSIDADES')
ORDER BY name, type, sequence;

-- Verificar tablas creadas
SELECT
    table_name,
    num_rows,
    TO_CHAR(last_analyzed, 'DD/MM/YYYY HH24:MI:SS') AS ultimo_analisis
FROM user_tables
WHERE table_name IN ('AUDITORIA_PAGOS', 'DETALLE_MOROSIDAD', 'AUDITORIA_MOROSIDADES')
ORDER BY table_name;

-- Verificar triggers
SELECT
    trigger_name,
    trigger_type,
    triggering_event,
    status
FROM user_triggers
WHERE trigger_name IN ('TRG_VALIDAR_AUDITORIA_PAGO', 'TRG_AUDITORIA_MOROSIDAD')
ORDER BY trigger_name;

-- Verificar estructura de tablas
SELECT
    column_name,
    data_type,
    data_length,
    nullable,
    data_default
FROM user_tab_columns
WHERE table_name = 'DETALLE_MOROSIDAD'
ORDER BY column_id;

-- Contar registros en GASTO_COMUN con estado pendiente o parcial
SELECT
    id_epago,
    ep.descripcion_epago,
    COUNT(*) AS total_registros,
    SUM(monto_total_gc) AS monto_total
FROM GASTO_COMUN gc
JOIN ESTADO_PAGO ep ON gc.id_epago = ep.id_epago
WHERE gc.id_epago IN (2, 3)
GROUP BY id_epago, ep.descripcion_epago
ORDER BY id_epago;

-- Ver ejemplo de datos para el período 202510
SELECT
    gc.anno_mes_pcgc,
    gc.id_edif,
    gc.nro_depto,
    gc.numrun_rpgc,
    gc.monto_total_gc,
    gc.fecha_hasta_gc,
    ep.descripcion_epago,
    TRUNC(SYSDATE - gc.fecha_hasta_gc) AS dias_desde_vencimiento
FROM GASTO_COMUN gc
JOIN ESTADO_PAGO ep ON gc.id_epago = ep.id_epago
WHERE gc.anno_mes_pcgc = 202510
  AND gc.id_epago IN (2, 3)
FETCH FIRST 10 ROWS ONLY;

-- Probar función de cálculo de días de mora
SELECT
    PKG_RESIDENTES.calcular_dias_mora(
        TO_DATE('31/10/2024', 'DD/MM/YYYY'),
        SYSDATE
    ) AS dias_mora_calculados
FROM dual;

-- Probar función de promedio de morosidad (edificio 10)
SELECT
    PKG_MOROSIDADES.CALCULAR_PROMEDIO_MOROSIDAD_EDIFICIO(10) AS promedio_morosidad_edificio_10
FROM dual;

