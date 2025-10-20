-- Fix para actualizar DETALLE_MOROSIDAD cuando se registra un pago
-- El problema: obtener_monto_pagado solo suma pagos del mismo período
-- La solución: crear un trigger que recalcule la morosidad al insertar un pago

CREATE OR REPLACE TRIGGER TRG_ACTUALIZAR_MOROSIDAD_PAGO
AFTER INSERT ON PAGO_GASTO_COMUN
FOR EACH ROW
DECLARE
    v_numrun_rpgc NUMBER;
    v_monto_total_moroso NUMBER := 0;
    v_pagado NUMBER;
    v_pendiente NUMBER;
    v_dias NUMBER;
    v_monto_residente NUMBER := 0;
BEGIN
    -- Obtener el numrun del gasto común
    SELECT numrun_rpgc INTO v_numrun_rpgc
    FROM GASTO_COMUN
    WHERE anno_mes_pcgc = :NEW.anno_mes_pcgc
      AND id_edif = :NEW.id_edif
      AND nro_depto = :NEW.nro_depto;

    -- Recalcular toda la morosidad del residente considerando TODOS los períodos
    FOR rec_gasto IN (
        SELECT
            gc.anno_mes_pcgc,
            gc.id_edif,
            gc.nro_depto,
            gc.fecha_hasta_gc,
            gc.monto_total_gc
        FROM GASTO_COMUN gc
        WHERE gc.numrun_rpgc = v_numrun_rpgc
          AND gc.id_epago IN (2, 3)
    ) LOOP
        -- Sumar TODOS los pagos para ese gasto (sin limitarse al mismo período)
        SELECT NVL(SUM(monto_cancelado_pgc), 0)
        INTO v_pagado
        FROM PAGO_GASTO_COMUN
        WHERE anno_mes_pcgc = rec_gasto.anno_mes_pcgc
          AND id_edif = rec_gasto.id_edif
          AND nro_depto = rec_gasto.nro_depto;

        v_pendiente := NVL(rec_gasto.monto_total_gc, 0) - NVL(v_pagado, 0);

        IF v_pendiente > 0 THEN
            v_dias := PKG_RESIDENTES.calcular_dias_mora(
                rec_gasto.fecha_hasta_gc,
                SYSDATE
            );

            IF v_dias > 0 THEN
                v_monto_residente := v_monto_residente + v_pendiente;
            END IF;
        END IF;
    END LOOP;

    -- Actualizar DETALLE_MOROSIDAD
    IF v_monto_residente > 0 THEN
        MERGE INTO DETALLE_MOROSIDAD dm
        USING DUAL
        ON (dm.numrun_rpgc = v_numrun_rpgc)
        WHEN MATCHED THEN
            UPDATE SET
                monto_total_moroso = v_monto_residente,
                fecha_ultima_actualizacion = SYSDATE
        WHEN NOT MATCHED THEN
            INSERT (numrun_rpgc, monto_total_moroso, fecha_ultima_actualizacion)
            VALUES (v_numrun_rpgc, v_monto_residente, SYSDATE);
    ELSE
        -- Si la morosidad es 0, eliminar el registro
        DELETE FROM DETALLE_MOROSIDAD
        WHERE numrun_rpgc = v_numrun_rpgc;
    END IF;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        NULL; -- El gasto común no existe, ignorar
    WHEN OTHERS THEN
        RAISE;
END;
/

-- Modificar obtener_monto_pagado para sumar pagos de CUALQUIER período (no solo del mismo)
-- Esta es una alternativa si no se usa el trigger anterior
CREATE OR REPLACE FUNCTION obtener_monto_pagado_total(p_anno_mes NUMBER, p_id_edif NUMBER, p_nro_depto NUMBER) RETURN NUMBER IS
    v_monto NUMBER := 0;
BEGIN
    -- Sumar TODOS los pagos para este gasto, sin importar el período del pago
    SELECT NVL(SUM(monto_cancelado_pgc), 0)
    INTO v_monto
    FROM PAGO_GASTO_COMUN
    WHERE anno_mes_pcgc = p_anno_mes
      AND id_edif = p_id_edif
      AND nro_depto = p_nro_depto;
    RETURN v_monto;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 0;
    WHEN OTHERS THEN
        RETURN 0;
END;
/

-- Actualizar generar_reporte_morosidades para usar la nueva función
-- (Opcional: si quieres que también sume pagos de otros períodos)
-- En la línea donde se calcula v_pagado, cambiar:
-- v_pagado := PKG_RESIDENTES.obtener_monto_pagado(...)
-- por:
-- v_pagado := obtener_monto_pagado_total(...)
