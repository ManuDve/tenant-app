-- Limpiar objetos
BEGIN EXECUTE IMMEDIATE 'DROP TABLE AUDITORIA_MOROSIDADES CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE AUDITORIA_PAGOS CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE DETALLE_MOROSIDAD CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP PACKAGE PKG_MOROSIDADES'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP PACKAGE PKG_RESIDENTES'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TRIGGER TRG_VALIDAR_AUDITORIA_PAGO'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TRIGGER TRG_AUDITORIA_MOROSIDAD'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TYPE TIPO_VARRAY_FECHAS_MORA'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

CREATE TABLE AUDITORIA_PAGOS (
    id_auditoria NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    anno_mes_pcgc NUMBER(6),
    id_edif NUMBER(5),
    nro_depto NUMBER(5),
    monto_cancelado NUMBER(10,2),
    fecha_auditoria DATE DEFAULT SYSDATE,
    operacion VARCHAR2(10)
)
/

CREATE TABLE DETALLE_MOROSIDAD (
    id_morosidad NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numrun_rpgc NUMBER(10) NOT NULL,
    monto_total_moroso NUMBER(12,2) DEFAULT 0,
    fecha_ultima_actualizacion DATE DEFAULT SYSDATE
)
/

CREATE TABLE AUDITORIA_MOROSIDADES (
    id_auditoria NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_morosidad NUMBER,
    numrun_rpgc NUMBER(10),
    monto_moroso_anterior NUMBER(12,2),
    monto_moroso_nuevo NUMBER(12,2),
    fecha_auditoria DATE DEFAULT SYSDATE
)
/

CREATE OR REPLACE PACKAGE PKG_RESIDENTES AS
    FUNCTION calcular_dias_mora(p_fecha_vencimiento DATE, p_fecha_actual DATE) RETURN NUMBER;
    FUNCTION calcular_multa_atraso(p_monto_base NUMBER, p_dias_mora NUMBER) RETURN NUMBER;
    FUNCTION obtener_monto_pagado(p_anno_mes NUMBER, p_id_edif NUMBER, p_nro_depto NUMBER) RETURN NUMBER;
    PROCEDURE REGISTRAR_PAGO_PARCIAL(p_anno_mes NUMBER, p_id_edif NUMBER, p_nro_depto NUMBER, p_monto NUMBER);
END PKG_RESIDENTES;
/

CREATE OR REPLACE PACKAGE BODY PKG_RESIDENTES AS
    FUNCTION calcular_dias_mora(p_fecha_vencimiento DATE, p_fecha_actual DATE) RETURN NUMBER IS
        v_dias NUMBER;
    BEGIN
        IF p_fecha_vencimiento IS NULL OR p_fecha_actual IS NULL THEN
            RETURN 0;
        END IF;
        v_dias := TRUNC(p_fecha_actual) - TRUNC(p_fecha_vencimiento);
        IF v_dias < 0 THEN
            RETURN 0;
        ELSE
            RETURN v_dias;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 0;
    END calcular_dias_mora;

    FUNCTION calcular_multa_atraso(p_monto_base NUMBER, p_dias_mora NUMBER) RETURN NUMBER IS
        v_porcentaje NUMBER := 0;
    BEGIN
        IF p_monto_base IS NULL OR p_monto_base <= 0 OR p_dias_mora IS NULL OR p_dias_mora <= 0 THEN
            RETURN 0;
        END IF;
        BEGIN
            SELECT porc_ma INTO v_porcentaje
            FROM MULTA_ATRASO
            WHERE SYSDATE BETWEEN fini_vig_ma AND fter_vig_ma
              AND p_dias_mora BETWEEN tot_dias_inf_ma AND tot_dias_sup_ma
              AND ROWNUM = 1
            ORDER BY id_tramo_ma;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                v_porcentaje := 0;
            WHEN OTHERS THEN
                v_porcentaje := 0;
        END;
        RETURN ROUND(p_monto_base * v_porcentaje, 2);
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 0;
    END calcular_multa_atraso;

    FUNCTION obtener_monto_pagado(p_anno_mes NUMBER, p_id_edif NUMBER, p_nro_depto NUMBER) RETURN NUMBER IS
        v_monto NUMBER := 0;
    BEGIN
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
    END obtener_monto_pagado;

    PROCEDURE REGISTRAR_PAGO_PARCIAL(p_anno_mes NUMBER, p_id_edif NUMBER, p_nro_depto NUMBER, p_monto NUMBER) IS
        v_count NUMBER;
    BEGIN
        IF p_monto IS NULL OR p_monto <= 0 THEN
            RAISE_APPLICATION_ERROR(-20002, 'El monto debe ser mayor a cero');
        END IF;

        SELECT COUNT(*) INTO v_count
        FROM GASTO_COMUN
        WHERE anno_mes_pcgc = p_anno_mes
          AND id_edif = p_id_edif
          AND nro_depto = p_nro_depto;

        IF v_count = 0 THEN
            RAISE_APPLICATION_ERROR(-20003, 'No existe gasto común para ese período y departamento');
        END IF;

        INSERT INTO PAGO_GASTO_COMUN (
            anno_mes_pcgc,
            id_edif,
            nro_depto,
            fecha_cancelacion_pgc,
            monto_cancelado_pgc,
            id_fpago
        ) VALUES (
            p_anno_mes,
            p_id_edif,
            p_nro_depto,
            SYSDATE,
            p_monto,
            2
        );

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END REGISTRAR_PAGO_PARCIAL;
END PKG_RESIDENTES;
/

CREATE OR REPLACE PACKAGE PKG_MOROSIDADES AS
    PROCEDURE generar_reporte_morosidades(p_anno_mes_hasta NUMBER);
    FUNCTION CALCULAR_PROMEDIO_MOROSIDAD_EDIFICIO(p_id_edif NUMBER) RETURN NUMBER;
END PKG_MOROSIDADES;
/

CREATE OR REPLACE PACKAGE BODY PKG_MOROSIDADES AS
    PROCEDURE generar_reporte_morosidades(p_anno_mes_hasta NUMBER) IS
        v_pagado NUMBER;
        v_pendiente NUMBER;
        v_dias NUMBER;
        v_monto_residente NUMBER;
    BEGIN
        IF p_anno_mes_hasta IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El parámetro anno_mes_hasta no puede ser nulo');
        END IF;

        FOR rec_residente IN (
            SELECT DISTINCT gc.numrun_rpgc
            FROM GASTO_COMUN gc
            WHERE gc.anno_mes_pcgc <= p_anno_mes_hasta
              AND gc.id_epago IN (2, 3)
        ) LOOP
            v_monto_residente := 0;

            FOR rec_gasto IN (
                SELECT
                    gc.anno_mes_pcgc,
                    gc.id_edif,
                    gc.nro_depto,
                    gc.fecha_hasta_gc,
                    gc.monto_total_gc
                FROM GASTO_COMUN gc
                WHERE gc.numrun_rpgc = rec_residente.numrun_rpgc
                  AND gc.anno_mes_pcgc <= p_anno_mes_hasta
                  AND gc.id_epago IN (2, 3)
            ) LOOP
                v_pagado := PKG_RESIDENTES.obtener_monto_pagado(
                    rec_gasto.anno_mes_pcgc,
                    rec_gasto.id_edif,
                    rec_gasto.nro_depto
                );

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

            IF v_monto_residente > 0 THEN
                MERGE INTO DETALLE_MOROSIDAD dm
                USING DUAL
                ON (dm.numrun_rpgc = rec_residente.numrun_rpgc)
                WHEN MATCHED THEN
                    UPDATE SET
                        monto_total_moroso = v_monto_residente,
                        fecha_ultima_actualizacion = SYSDATE
                WHEN NOT MATCHED THEN
                    INSERT (numrun_rpgc, monto_total_moroso, fecha_ultima_actualizacion)
                    VALUES (rec_residente.numrun_rpgc, v_monto_residente, SYSDATE);
            END IF;
        END LOOP;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END generar_reporte_morosidades;

    FUNCTION CALCULAR_PROMEDIO_MOROSIDAD_EDIFICIO(p_id_edif NUMBER) RETURN NUMBER IS
        v_total NUMBER := 0;
        v_count NUMBER := 0;
        v_promedio NUMBER := 0;
        v_pendiente NUMBER;
    BEGIN
        IF p_id_edif IS NULL THEN
            RETURN 0;
        END IF;

        FOR rec IN (
            SELECT
                gc.anno_mes_pcgc,
                gc.id_edif,
                gc.nro_depto,
                gc.monto_total_gc,
                NVL(SUM(pgc.monto_cancelado_pgc), 0) AS total_pagado
            FROM GASTO_COMUN gc
            LEFT JOIN PAGO_GASTO_COMUN pgc
                ON gc.anno_mes_pcgc = pgc.anno_mes_pcgc
                AND gc.id_edif = pgc.id_edif
                AND gc.nro_depto = pgc.nro_depto
            WHERE gc.id_edif = p_id_edif
              AND gc.id_epago IN (2, 3)
            GROUP BY
                gc.anno_mes_pcgc,
                gc.id_edif,
                gc.nro_depto,
                gc.monto_total_gc
        ) LOOP
            v_pendiente := NVL(rec.monto_total_gc, 0) - NVL(rec.total_pagado, 0);
            IF v_pendiente > 0 THEN
                v_total := v_total + v_pendiente;
                v_count := v_count + 1;
            END IF;
        END LOOP;

        IF v_count = 0 THEN
            RETURN 0;
        END IF;

        v_promedio := ROUND(v_total / v_count, 2);
        RETURN v_promedio;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 0;
    END CALCULAR_PROMEDIO_MOROSIDAD_EDIFICIO;
END PKG_MOROSIDADES;
/

CREATE OR REPLACE TRIGGER TRG_VALIDAR_AUDITORIA_PAGO
BEFORE INSERT ON PAGO_GASTO_COMUN
FOR EACH ROW
DECLARE
    v_monto NUMBER;
BEGIN
    v_monto := :NEW.monto_cancelado_pgc;

    IF v_monto < 0 THEN
        RAISE_APPLICATION_ERROR(-20005, 'Monto no puede ser negativo');
    END IF;

    IF v_monto > 1000000 THEN
        RAISE_APPLICATION_ERROR(-20006, 'Monto excede el límite permitido');
    END IF;

    INSERT INTO AUDITORIA_PAGOS (
        anno_mes_pcgc,
        id_edif,
        nro_depto,
        monto_cancelado,
        fecha_auditoria,
        operacion
    ) VALUES (
        :NEW.anno_mes_pcgc,
        :NEW.id_edif,
        :NEW.nro_depto,
        :NEW.monto_cancelado_pgc,
        SYSDATE,
        'INSERT'
    );
END;
/

CREATE OR REPLACE TRIGGER TRG_AUDITORIA_MOROSIDAD
AFTER INSERT OR UPDATE ON DETALLE_MOROSIDAD
FOR EACH ROW
WHEN (NEW.monto_total_moroso > 100000)
BEGIN
    INSERT INTO AUDITORIA_MOROSIDADES (
        id_morosidad,
        numrun_rpgc,
        monto_moroso_anterior,
        monto_moroso_nuevo,
        fecha_auditoria
    ) VALUES (
        :NEW.id_morosidad,
        :NEW.numrun_rpgc,
        :OLD.monto_total_moroso,
        :NEW.monto_total_moroso,
        SYSDATE
    );
END;
/

BEGIN
    UPDATE GASTO_COMUN
    SET fecha_hasta_gc = TO_DATE('15/10/2025', 'DD/MM/YYYY'),
        id_epago = 2
    WHERE anno_mes_pcgc = 202510
      AND ROWNUM <= 5;

    UPDATE GASTO_COMUN
    SET fecha_hasta_gc = TO_DATE('20/09/2025', 'DD/MM/YYYY'),
        id_epago = 3
    WHERE anno_mes_pcgc = 202509
      AND ROWNUM <= 3;

    COMMIT;
END;
/

