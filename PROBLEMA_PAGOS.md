# PROBLEMA: Pagos no actualizan correctamente la morosidad

## Resumen del Problema

Cuando se registran pagos en diferentes períodos para el mismo departamento, la deuda no se actualiza correctamente:

Ejemplo (caso de Alicia):
- Deuda inicial: 60,000 (período 202410)
- Pago 1: 30,000 → Deuda 30,000 ✓ (funciona)
- Pago 2: 30,000 → Deuda sigue en 30,000 ✗ (no funciona)

## Causa Raíz

La función `obtener_monto_pagado()` en el paquete `PKG_RESIDENTES` solo suma pagos **del mismo período**:

```sql
FUNCTION obtener_monto_pagado(p_anno_mes NUMBER, p_id_edif NUMBER, p_nro_depto NUMBER) RETURN NUMBER IS
    v_monto NUMBER := 0;
BEGIN
    SELECT NVL(SUM(monto_cancelado_pgc), 0)
    INTO v_monto
    FROM PAGO_GASTO_COMUN
    WHERE anno_mes_pcgc = p_anno_mes          -- Solo este período
      AND id_edif = p_id_edif
      AND nro_depto = p_nro_depto;
    RETURN v_monto;
END;
```

Esto causa que:
1. El cálculo de `v_pendiente` en `generar_reporte_morosidades` sea incorrecto
2. La tabla `DETALLE_MOROSIDAD` no se actualice con el saldo correcto
3. El segundo pago (en período diferente) no se refleje en la deuda

## Solución Implementada

Se creó un trigger `TRG_ACTUALIZAR_MOROSIDAD_PAGO` que:

1. Se ejecuta **después de insertar un pago** en `PAGO_GASTO_COMUN`
2. Obtiene el `numrun_rpgc` del gasto común pagado
3. Recalcula la morosidad del residente considerando:
   - **TODOS** los períodos con gasto pendiente
   - **TODOS** los pagos registrados (sin limitarse al período)
4. Actualiza `DETALLE_MOROSIDAD` con el saldo correcto en tiempo real

### Cambios en la BD

Archivo: `/src/main/resources/sql/fix_pago_morosidad.sql`

Contiene:
- Trigger `TRG_ACTUALIZAR_MOROSIDAD_PAGO`
- Función alternativa `obtener_monto_pagado_total()`
- Documentación de cómo actualizar `generar_reporte_morosidades`

## Instalación

1. Conectar a la BD Oracle como usuario ADMIN
2. Ejecutar el archivo: `fix_pago_morosidad.sql`
3. Confirmar que el trigger fue creado sin errores
4. Limpiar BD y repoblar con datos de prueba
5. Probar registrando pagos múltiples

## Verificación

Después de aplicar el fix:

```sql
-- Ver deuda actual de un residente
SELECT * FROM DETALLE_MOROSIDAD WHERE numrun_rpgc = 123456789;

-- Ver todos los pagos registrados
SELECT * FROM PAGO_GASTO_COMUN WHERE id_edif = 1 AND nro_depto = 101;

-- Ver auditoría de pagos
SELECT * FROM AUDITORIA_PAGOS ORDER BY fecha_auditoria DESC;
```

## Impacto

- Pagos parciales ahora funcionan correctamente
- La deuda se actualiza en tiempo real
- La auditoría de pagos funciona correctamente
- Compatible con el flujo actual de la aplicación
