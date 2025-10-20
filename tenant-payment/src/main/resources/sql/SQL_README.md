# Documentación de Scripts SQL

Este documento explica en detalle cada uno de los scripts SQL utilizados en el sistema de gestión de morosidades.

## 📋 Tabla de Contenidos

- [Resumen de Archivos](#resumen-de-archivos)
- [Detalles por Archivo](#detalles-por-archivo)
- [Orden de Ejecución](#orden-de-ejecución)
- [Consideraciones Técnicas](#consideraciones-técnicas)

## 📁 Resumen de Archivos

| Archivo | Propósito | Tipo | Tamaño Aprox. | Tiempo Ejecución |
|---------|-----------|------|---------------|------------------|
| `clear.sql` | Limpieza completa de BD | DDL | ~1 KB | 5-10 seg |
| `seed.sql` | Datos base del sistema | DML/DDL | ~200 KB | 30-40 seg |
| `setup_morosidades.sql` | Objetos PL/SQL de morosidades | DDL/PL-SQL | ~15 KB | 5-10 seg |
| `datos_morosidad.sql` | Casos de prueba | DML | ~4 KB | 3-5 seg |
| `diagnostico.sql` | Consultas de verificación | DQL | ~2 KB | 1-2 seg |
| `diagnostico_morosidades.sql` | Verificación específica | DQL | ~1 KB | 1 seg |

---

## 📄 Detalles por Archivo

### 1. `clear.sql` - Limpieza de Base de Datos

**Propósito**: Eliminar todos los objetos del esquema para empezar desde cero.

#### Objetos que Elimina (en orden):

1. **Tablas de Morosidad** (primero, por dependencias):
   ```sql
   DROP TABLE AUDITORIA_PAGOS CASCADE CONSTRAINTS;
   DROP TABLE AUDITORIA_MOROSIDADES CASCADE CONSTRAINTS;
   DROP TABLE DETALLE_MOROSIDAD CASCADE CONSTRAINTS;
   ```

2. **Paquetes PL/SQL**:
   ```sql
   DROP PACKAGE PKG_MOROSIDADES;
   DROP PACKAGE PKG_RESIDENTES;
   ```

3. **Triggers**:
   ```sql
   DROP TRIGGER TRG_VALIDAR_AUDITORIA_PAGO;
   DROP TRIGGER TRG_AUDITORIA_MOROSIDAD;
   ```

4. **Tablas Principales** (en orden por dependencias FK):
   - `PAGO_GASTO_COMUN`
   - `GASTO_COMUN_PAGO_CERO`
   - `GASTO_COMUN`
   - `RESPONSABLE_PAGO_GASTO_COMUN`
   - `TIPO_PERSONA`
   - `MULTA_ATRASO`
   - `FORMA_PAGO`
   - `ESTADO_PERIODO`
   - `ESTADO_PAGO`
   - `PERIODO_COBRO_GASTO_COMUN`
   - `DEPARTAMENTO`
   - `EDIFICIO`
   - `ADMINISTRADOR`
   - `COMUNA`

5. **Secuencias**:
   ```sql
   DROP SEQUENCE seq_com;
   ```

#### Características:
- ✅ Usa `CASCADE CONSTRAINTS` para evitar errores de dependencias
- ✅ No falla si algún objeto no existe
- ⚠️ **DESTRUCTIVO**: Elimina TODOS los datos

#### Cuándo Usar:
- Al inicio de pruebas
- Para resetear completamente el sistema
- Antes de ejecutar `seed.sql`

---

### 2. `seed.sql` - Inicialización del Sistema

**Propósito**: Crear toda la estructura base del sistema y cargar datos iniciales.

#### Estructura del Archivo:

**A. Creación de Tablas (DDL)**

1. **Tablas de Referencia**:
   ```sql
   CREATE TABLE COMUNA (id_comuna, nombre_comuna)
   CREATE TABLE ESTADO_PAGO (id_epago, descripcion_epago)
   CREATE TABLE ESTADO_PERIODO (id_eperiodo, descripcion_eperiodo)
   CREATE TABLE FORMA_PAGO (id_fpago, descripcion_fpago)
   CREATE TABLE TIPO_PERSONA (id_tper, descripcion_tper)
   CREATE TABLE MULTA_ATRASO (id_tramo_ma, porc_ma, ...)
   ```

2. **Tablas de Entidades Principales**:
   ```sql
   CREATE TABLE ADMINISTRADOR (numrun_adm, pnombre_adm, ...)
   CREATE TABLE EDIFICIO (id_edif, nombre_edif, direccion_edif, ...)
   CREATE TABLE DEPARTAMENTO (id_edif, nro_depto, ...)
   CREATE TABLE RESPONSABLE_PAGO_GASTO_COMUN (numrun_rpgc, ...)
   ```

3. **Tablas de Transacciones**:
   ```sql
   CREATE TABLE PERIODO_COBRO_GASTO_COMUN (anno_mes_pcgc, id_eperiodo)
   CREATE TABLE GASTO_COMUN (anno_mes_pcgc, id_edif, nro_depto, ...)
   CREATE TABLE GASTO_COMUN_PAGO_CERO (anno_mes_pcgc, id_edif, nro_depto)
   CREATE TABLE PAGO_GASTO_COMUN (anno_mes_pcgc, id_edif, nro_depto, ...)
   ```

**B. Restricciones (ALTER TABLE)**

```sql
-- Foreign Keys (14 constraints)
ALTER TABLE EDIFICIO ADD CONSTRAINT FK_EDIFICIO_ADMINISTRADOR ...
ALTER TABLE DEPARTAMENTO ADD CONSTRAINT FK_DEPARTAMENTO_EDIFICIO ...
ALTER TABLE GASTO_COMUN ADD CONSTRAINT FK_GCOMUN_DEPARTAMENTO ...
...
```

**C. Datos de Referencia (INSERT)**

1. **Estados**:
   - 3 Estados de pago (PAGADO TOTAL, PAGADO PARCIAL, PENDIENTE)
   - 2 Estados de periodo (FACTURADO, PENDIENTE)

2. **Formas de Pago**:
   - 4 tipos (EFECTIVO, TRANSFERENCIA, CHEQUE, TARJETA)

3. **Tipos de Persona**:
   - 4 tipos (PROPIETARIO, ARRENDATARIO, USUFRUCTUARIO, OTRO)

4. **Multas por Atraso** (9 tramos):
   ```
   Tramo 1: 1-15 días   → 3%
   Tramo 2: 16-30 días  → 5%
   Tramo 3: 31-60 días  → 10%
   ...
   Tramo 9: 241+ días   → 60%
   ```

**D. Datos del Sistema**

1. **Comunas** (31 comunas de Santiago)
2. **Administrador**: Mauricio Moya Cerda
3. **Edificios** (6 edificios):
   - ID 10: Murano (Macul)
   - ID 20: Edificio Lisboa (Macul)
   - ID 30: Alto Peñalolen (Peñalolen)
   - ID 40: Edificio Ñuñoa Centro (Ñuñoa)
   - ID 50: Edificio Providencia (Providencia)
   - ID 60: Torres Almagro (Providencia)

4. **Departamentos** (~50 departamentos)
5. **Residentes** (~30 responsables de pago)

**E. Datos Transaccionales**

1. **Periodos de Cobro**:
   - Años 2023, 2024, 2025
   - Meses 10, 11, 12 (últimos 3 meses de cada año)

2. **Gastos Comunes** (~2,500 registros):
   - Histórico de gastos de los últimos 3 años
   - Incluye detalles: prorrateado, agua, combustible, etc.

3. **Pagos** (~1,500 registros):
   - Pagos históricos asociados a gastos comunes

#### Características:
- ✅ Script idempotente (usa `TO_CHAR(SYSDATE,'YYYY')` para fechas dinámicas)
- ✅ Datos realistas con nombres y RUTs chilenos
- ✅ Cumple todas las reglas de integridad referencial
- ✅ ~2,759 statements ejecutados exitosamente

#### Estadísticas de Datos:
```
Comunas:                    31
Administradores:             1
Edificios:                   6
Departamentos:             ~50
Residentes:                ~30
Periodos de cobro:         ~36 (3 años × 12 meses)
Gastos comunes:         ~2,500
Pagos registrados:      ~1,500
```

---

### 3. `setup_morosidades.sql` - Sistema de Morosidades

**Propósito**: Crear todos los objetos PL/SQL necesarios para el sistema de gestión de morosidades.

#### Estructura del Script:

**A. Limpieza Preliminar**

```sql
-- Elimina objetos si existen (con EXCEPTION para evitar errores)
BEGIN EXECUTE IMMEDIATE 'DROP TABLE AUDITORIA_MOROSIDADES ...'; 
EXCEPTION WHEN OTHERS THEN NULL; END;
/
```

**B. Tablas de Morosidad**

1. **AUDITORIA_PAGOS**:
   ```sql
   CREATE TABLE AUDITORIA_PAGOS (
       id_auditoria NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
       anno_mes_pcgc NUMBER(6),
       id_edif NUMBER(5),
       nro_depto NUMBER(5),
       monto_cancelado NUMBER(10,2),
       fecha_auditoria DATE DEFAULT SYSDATE,
       operacion VARCHAR2(10)
   )
   ```
   - **Propósito**: Registrar todos los pagos realizados
   - **Trigger asociado**: `TRG_VALIDAR_AUDITORIA_PAGO`

2. **DETALLE_MOROSIDAD**:
   ```sql
   CREATE TABLE DETALLE_MOROSIDAD (
       id_morosidad NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
       numrun_rpgc NUMBER(10) NOT NULL,
       monto_total_moroso NUMBER(12,2) NOT NULL,
       fecha_ultima_actualizacion DATE DEFAULT SYSDATE
   )
   ```
   - **Propósito**: Almacenar el resumen de deuda por residente
   - **Llenado por**: Procedimiento `SP_GENERAR_REPORTE_MOROSIDAD`

3. **AUDITORIA_MOROSIDADES**:
   ```sql
   CREATE TABLE AUDITORIA_MOROSIDADES (
       id_auditoria NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
       numrun_rpgc NUMBER(10),
       monto_moroso NUMBER(12,2),
       fecha_auditoria DATE DEFAULT SYSDATE,
       operacion VARCHAR2(20)
   )
   ```
   - **Propósito**: Auditar morosidades > $100,000
   - **Trigger asociado**: `TRG_AUDITORIA_MOROSIDAD`

**C. Tipo Objeto (Type)**

```sql
CREATE OR REPLACE TYPE TIPO_VARRAY_FECHAS_MORA AS VARRAY(1000) OF DATE;
```
- **Propósito**: Almacenar múltiples fechas de vencimiento para cálculos
- **Usado en**: `PKG_RESIDENTES.FN_CALCULAR_DIAS_MORA`

**D. Package PKG_RESIDENTES**

Contiene **8 funciones** para cálculos relacionados con residentes:

1. **FN_OBTENER_NOMBRE_COMPLETO** (numrun_rpgc → VARCHAR2):
   - Retorna: "APELLIDO_PATERNO APELLIDO_MATERNO, PRIMER_NOMBRE"
   - Ejemplo: "OPAZO, ALICIA"

2. **FN_OBTENER_RUN_FORMATEADO** (numrun_rpgc �� VARCHAR2):
   - Retorna: "12.345.678-9"
   - Formatea el RUN con puntos y guión

3. **FN_CALCULAR_TOTAL_DEUDA** (numrun_rpgc, anno_mes → NUMBER):
   - Calcula la deuda total de un residente hasta un periodo
   - Considera: gastos pendientes - pagos realizados

4. **FN_OBTENER_ULTIMO_PAGO** (numrun_rpgc → DATE):
   - Retorna la fecha del último pago realizado
   - NULL si nunca ha pagado

5. **FN_CONTAR_MESES_MORA** (numrun_rpgc, anno_mes → NUMBER):
   - Cuenta cuántos meses tiene deuda pendiente

6. **FN_OBTENER_EDIFICIO_DEPTO** (numrun_rpgc → VARCHAR2):
   - Retorna: "Edificio X - Depto Y"
   - Ejemplo: "Murano - Depto 21"

7. **FN_CALCULAR_DIAS_MORA** (numrun_rpgc, anno_mes → NUMBER):
   - Calcula días transcurridos desde el vencimiento más antiguo
   - Usa `TIPO_VARRAY_FECHAS_MORA`

8. **FN_OBTENER_PERIODOS_MOROSOS** (numrun_rpgc → VARCHAR2):
   - Retorna: "202508, 202509, 202510"
   - Lista de periodos con deuda

**E. Package PKG_MOROSIDADES**

Contiene el **procedimiento principal**:

**SP_GENERAR_REPORTE_MOROSIDAD** (p_anno_mes IN NUMBER):

```sql
PROCEDURE SP_GENERAR_REPORTE_MOROSIDAD(p_anno_mes IN NUMBER);
```

**Proceso**:
1. Limpia `DETALLE_MOROSIDAD` existente
2. Consulta todos los residentes con gastos pendientes
3. Para cada residente:
   - Calcula deuda total con `FN_CALCULAR_TOTAL_DEUDA`
   - Si deuda > 0:
     - Inserta en `DETALLE_MOROSIDAD`
     - Si deuda > $100,000: activa trigger de auditoría

**F. Triggers**

1. **TRG_VALIDAR_AUDITORIA_PAGO**:
   ```sql
   CREATE OR REPLACE TRIGGER TRG_VALIDAR_AUDITORIA_PAGO
   AFTER INSERT ON PAGO_GASTO_COMUN
   FOR EACH ROW
   ```
   - **Evento**: Después de insertar un pago
   - **Acción**: Inserta registro en `AUDITORIA_PAGOS`
   - **Información auditada**: periodo, edificio, depto, monto, fecha

2. **TRG_AUDITORIA_MOROSIDAD**:
   ```sql
   CREATE OR REPLACE TRIGGER TRG_AUDITORIA_MOROSIDAD
   AFTER INSERT ON DETALLE_MOROSIDAD
   FOR EACH ROW
   WHEN (NEW.monto_total_moroso > 100000)
   ```
   - **Evento**: Después de insertar en `DETALLE_MOROSIDAD`
   - **Condición**: Solo si monto > $100,000
   - **Acción**: Inserta en `AUDITORIA_MOROSIDADES`

#### Características:
- ✅ Usa bloques `BEGIN/END/` para manejo de errores
- ✅ Compatible con Oracle 19c
- ✅ Todos los objetos en estado VALID después de ejecutar
- ✅ 17 bloques PL/SQL ejecutados

---

### 4. `datos_morosidad.sql` - Casos de Prueba

**Propósito**: Insertar casos de prueba específicos para demostrar el sistema de morosidades.

#### Estructura:

**A. Limpieza de Datos Previos**

```sql
BEGIN
    DELETE FROM PAGO_GASTO_COMUN WHERE anno_mes_pcgc IN (202508, 202509, 202510);
    DELETE FROM GASTO_COMUN WHERE anno_mes_pcgc IN (202508, 202509, 202510);
    COMMIT;
END;
/
```

**B. Inserción de Periodos**

```sql
BEGIN INSERT INTO PERIODO_COBRO_GASTO_COMUN VALUES(202508, 1); 
EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- Repite para 202509, 202510
```

**C. Casos de Morosidad** (8 casos)

1. **CASO 1: ALICIA OPAZO** (RUN: 6868859)
   - Edificio: 10 (Murano), Depto: 21
   - Periodo: 202508 (Agosto 2025)
   - Deuda: $59,000
   - Estado: PENDIENTE (id_epago = 3)
   - **Sin pagos**

2. **CASO 2: STEPHANIE DIAZ** (RUN: 16044255)
   - Edificio: 10, Depto: 22
   - Periodo: 202509 (Septiembre 2025)
   - Deuda original: $52,450
   - Pago parcial: $20,000 (05-Oct-2025)
   - Saldo: $32,450
   - Estado: PAGADO PARCIAL (id_epago = 2)

3. **CASO 3: SANDRA ARIAS** (RUN: 8948642)
   - Edificio: 10, Depto: 23
   - Periodo: 202508
   - Deuda: $119,500 ⚠️ **DEUDA ALTA**
   - Incluye: multas ($15,000) y servicios ($10,000)
   - **Activa trigger de auditoría**

4. **CASO 4: MARCIA BENITEZ** (RUN: 17046055)
   - Edificio: 10, Depto: 31
   - **3 periodos consecutivos**: 202508, 202509, 202510
   - Deuda por periodo: $65,550
   - Deuda total: $196,650 ⚠️ **DEUDA MUY ALTA**
   - **Activa trigger de auditoría**

5. **CASO 5: VALESKA GODOY** (RUN: 13635211)
   - Edificio: 10, Depto: 32
   - Periodo: 202509
   - Deuda original: $72,000
   - Pago mínimo: $10,000 (10-Oct-2025)
   - Saldo: $62,000

6. **CASO 6: LUIS ALVAREZ** (RUN: 16439752)
   - Edificio: 10, Depto: 33
   - Periodo: 202510 (Octubre 2025)
   - Deuda: $91,900
   - Incluye recargos significativos

7. **CASO 7: HERNAN CASTRO** (RUN: 21815820)
   - Edificio: 20 (Edificio Lisboa), Depto: 101
   - Periodo: 202508
   - Deuda: $41,250

8. **CASO 8: PAMELA GATICA** (RUN: 16947140)
   - Edificio: 20, Depto: 102
   - **2 periodos**: 202509, 202510
   - Deuda por periodo: $45,000
   - Deuda total: $90,000

#### Características Técnicas:

✅ **Transacciones Consolidadas**:
```sql
-- Bloque único para GASTO_COMUN + PAGO
BEGIN
    INSERT INTO GASTO_COMUN VALUES(...);
    INSERT INTO PAGO_GASTO_COMUN VALUES(...);
    COMMIT;
END;
/
```
- Evita errores de FK (Foreign Key)
- Garantiza consistencia transaccional

✅ **Activación de Triggers**:
- 2 pagos parciales → `TRG_VALIDAR_AUDITORIA_PAGO` (2 registros en `AUDITORIA_PAGOS`)
- 2 deudas altas → `TRG_AUDITORIA_MOROSIDAD` (después de generar reporte)

#### Resumen de Deudas:

| Residente | Edificio | Periodos | Deuda Total | Observación |
|-----------|----------|----------|-------------|-------------|
| ALICIA OPAZO | 10 | 1 | $59,000 | Sin pago |
| STEPHANIE DIAZ | 10 | 1 | $32,450 | Con pago parcial |
| SANDRA ARIAS | 10 | 1 | $119,500 | ⚠️ Auditoría |
| MARCIA BENITEZ | 10 | 3 | $196,650 | ⚠️⚠️ Auditoría |
| VALESKA GODOY | 10 | 1 | $62,000 | Pago mínimo |
| LUIS ALVAREZ | 10 | 1 | $91,900 | Con recargos |
| HERNAN CASTRO | 20 | 1 | $41,250 | - |
| PAMELA GATICA | 20 | 2 | $90,000 | 2 meses |
| **TOTAL** | - | **11** | **$692,750** | - |

---

### 5. `diagnostico.sql` - Verificación del Sistema

**Propósito**: Consultas para verificar el estado general del sistema.

#### Consultas Incluidas:

1. **Privilegios del Usuario**:
   ```sql
   SELECT PRIVILEGE FROM USER_SYS_PRIVS 
   WHERE PRIVILEGE LIKE '%CREATE%';
   ```

2. **Estado de Objetos**:
   ```sql
   SELECT object_name, object_type, status 
   FROM USER_OBJECTS 
   WHERE object_type IN ('PACKAGE', 'PACKAGE BODY', 'TRIGGER', 'TYPE')
   ORDER BY object_type, object_name;
   ```

3. **Errores de Compilación**:
   ```sql
   SELECT name, type, line, position, text 
   FROM USER_ERRORS 
   WHERE name IN ('PKG_MOROSIDADES', 'PKG_RESIDENTES')
   ORDER BY name, type, sequence;
   ```

4. **Tablas Creadas**:
   ```sql
   SELECT table_name FROM USER_TABLES 
   WHERE table_name IN ('DETALLE_MOROSIDAD', 'AUDITORIA_MOROSIDADES', 'AUDITORIA_PAGOS')
   ORDER BY table_name;
   ```

#### Uso:
- Ejecutar después de `setup_morosidades.sql`
- Verificar que todos los objetos estén en estado `VALID`
- Comprobar que no haya errores de compilación

---

### 6. `diagnostico_morosidades.sql` - Verificación Específica

**Propósito**: Consultas específicas para el sistema de morosidades.

#### Consultas:

1. **Contenido de DETALLE_MOROSIDAD**:
   ```sql
   SELECT * FROM DETALLE_MOROSIDAD ORDER BY monto_total_moroso DESC;
   ```

2. **Auditoría de Morosidades Altas**:
   ```sql
   SELECT * FROM AUDITORIA_MOROSIDADES ORDER BY fecha_auditoria DESC;
   ```

3. **Auditoría de Pagos**:
   ```sql
   SELECT * FROM AUDITORIA_PAGOS ORDER BY fecha_auditoria DESC;
   ```

4. **Estadísticas por Edificio**:
   ```sql
   SELECT e.nombre_edif, COUNT(*) as total_morosos, 
          SUM(dm.monto_total_moroso) as deuda_total
   FROM DETALLE_MOROSIDAD dm
   JOIN RESPONSABLE_PAGO_GASTO_COMUN r ON dm.numrun_rpgc = r.numrun_rpgc
   JOIN DEPARTAMENTO d ON ...
   GROUP BY e.nombre_edif;
   ```

---

## 🔄 Orden de Ejecución

### Flujo Recomendado:

```
1. clear.sql              → Limpiar todo
2. seed.sql               → Crear estructura base
3. setup_morosidades.sql  → Crear sistema de morosidades
4. datos_morosidad.sql    → Insertar casos de prueba
5. [EJECUTAR API]         → POST /api/morosidades/generar-reporte
6. diagnostico.sql        → Verificar sistema
7. diagnostico_morosidades.sql → Ver resultados
```

### Dependencias:

```
clear.sql
    ↓
seed.sql (crea: EDIFICIO, DEPARTAMENTO, RESPONSABLE_PAGO_GASTO_COMUN)
    ↓
setup_morosidades.sql (depende de: RESPONSABLE_PAGO_GASTO_COMUN)
    ↓
datos_morosidad.sql (depende de: EDIFICIO, DEPARTAMENTO, RESPONSABLE_PAGO_GASTO_COMUN, PERIODO_COBRO_GASTO_COMUN)
    ↓
[API Call] SP_GENERAR_REPORTE_MOROSIDAD
    ↓
diagnostico_morosidades.sql
```

---

## ⚙️ Consideraciones Técnicas

### 1. Parser de Bloques PL/SQL

El sistema usa un parser personalizado en `DatabaseAdminService.java`:

```java
String[] blocks = content.split("(?m)^\\s*/\\s*$");
```

**Requisitos del formato**:
- Cada bloque PL/SQL debe terminar con `/` en su propia línea
- El delimitador `/` puede tener espacios antes/después
- Compatible con formato de Oracle SQL Developer

**Ejemplo correcto**:
```sql
BEGIN
    INSERT INTO TABLA VALUES(...);
    COMMIT;
END;
/

BEGIN
    INSERT INTO OTRA_TABLA VALUES(...);
END;
/
```

**Ejemplo INCORRECTO**:
```sql
BEGIN
    INSERT INTO TABLA VALUES(...);
    COMMIT;
END; /  -- ❌ El / debe estar en su propia línea
```

### 2. Manejo de Errores

Los scripts usan diferentes estrategias:

**A. Ignorar errores (setup_morosidades.sql)**:
```sql
BEGIN EXECUTE IMMEDIATE 'DROP TABLE ...'; 
EXCEPTION WHEN OTHERS THEN NULL; 
END;
/
```

**B. Permitir fallo (datos_morosidad.sql)**:
```sql
BEGIN
    INSERT INTO PERIODO_COBRO_GASTO_COMUN VALUES(202508, 1); 
    EXCEPTION WHEN OTHERS THEN NULL;  -- No falla si ya existe
END;
/
```

### 3. Transacciones

**Regla importante**: Las inserciones con FK deben estar en el mismo bloque:

```sql
-- ✅ CORRECTO
BEGIN
    INSERT INTO GASTO_COMUN VALUES(...);
    INSERT INTO PAGO_GASTO_COMUN VALUES(...);  -- Referencia a GASTO_COMUN
    COMMIT;
END;
/

-- ❌ INCORRECTO
BEGIN
    INSERT INTO GASTO_COMUN VALUES(...);
    COMMIT;
END;
/
BEGIN
    INSERT INTO PAGO_GASTO_COMUN VALUES(...);  -- ❌ FK no encuentra registro
    COMMIT;
END;
/
```

### 4. Fechas Dinámicas

El script `seed.sql` usa fechas relativas al año actual:

```sql
TO_CHAR(SYSDATE,'YYYY')||'10'  -- Octubre del año actual
TO_CHAR(SYSDATE,'YYYY')-1||'11'  -- Noviembre del año pasado
```

Esto permite que el script sea ejecutable en cualquier año.

### 5. Secuencias e Identity

**Oracle 12c+** soporta `GENERATED ALWAYS AS IDENTITY`:

```sql
CREATE TABLE DETALLE_MOROSIDAD (
    id_morosidad NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ...
)
```

Es equivalente a:
```sql
CREATE SEQUENCE seq_morosidad START WITH 1 INCREMENT BY 1;
CREATE TABLE DETALLE_MOROSIDAD (
    id_morosidad NUMBER DEFAULT seq_morosidad.NEXTVAL PRIMARY KEY,
    ...
)
```

---

## 🐛 Troubleshooting

### Error: "ORA-02291: restricción de integridad violada"

**Causa**: Intentar insertar un registro hijo sin el padre correspondiente.

**Solución**: 
- Verificar que `seed.sql` se ejecutó completamente
- Consolidar inserciones en el mismo bloque PL/SQL

### Error: "ORA-00942: table or view does not exist"

**Causa**: Ejecutar scripts fuera de orden.

**Solución**: Seguir el orden: `clear.sql` → `seed.sql` → `setup_morosidades.sql` → `datos_morosidad.sql`

### Error: "PLS-00201: identifier must be declared"

**Causa**: Package no compilado o en estado INVALID.

**Solución**: 
1. Ejecutar `diagnostico.sql` para ver estado
2. Re-ejecutar `setup_morosidades.sql`
3. Revisar errores con: `SELECT * FROM USER_ERRORS;`

### Advertencia: "Only 2 blocks executed" en datos_morosidad.sql

**Causa**: Parser antiguo no detectaba correctamente el delimitador `/`.

**Solución**: Verificar que `DatabaseAdminService.java` use el regex: `(?m)^\\s*/\\s*$`

---

## 📊 Métricas de Ejecución

### Tiempos Estimados (Oracle 19c):

| Script | Bloques | Tiempo | Registros |
|--------|---------|--------|-----------|
| clear.sql | 30 | 5-10s | 0 (DELETE) |
| seed.sql | 2,759 | 30-40s | ~2,759 |
| setup_morosidades.sql | 17 | 5-10s | 3 tablas, 2 pkg, 2 trg |
| datos_morosidad.sql | 15 | 3-5s | 11 gastos, 2 pagos |

### Tamaño de Base de Datos:

```
Tablas de sistema:       ~2 MB
GASTO_COMUN:            ~5 MB
PAGO_GASTO_COMUN:       ~3 MB
DETALLE_MOROSIDAD:      ~100 KB
Total aproximado:       ~12 MB
```

---

## 📞 Contacto y Soporte

Para dudas o problemas con los scripts SQL:
- Revisar logs en consola del servidor
- Ejecutar `diagnostico.sql` para verificar estado
- Consultar `USER_ERRORS` para errores de compilación

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0  
**Compatible con**: Oracle Database 19c

