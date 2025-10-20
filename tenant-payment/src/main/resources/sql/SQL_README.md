# Documentación de Scripts SQL

Este documento explica en detalle cada uno de los scripts SQL utilizados en el sistema de gestión de morosidades.

## Tabla de Contenidos

- [Resumen de Archivos](#resumen-de-archivos)
- [Detalles por Archivo](#detalles-por-archivo)
- [Orden de Ejecución](#orden-de-ejecución)
- [Consideraciones Técnicas](#consideraciones-técnicas)

## Resumen de Archivos

| Archivo | Propósito | Tipo | Tamaño Aprox. | Tiempo Ejecución |
|---------|-----------|------|---------------|------------------|
| `clear.sql` | Limpieza completa de BD | DDL | ~1 KB | 5-10 seg |
| `seed.sql` | Datos base del sistema | DML/DDL | ~200 KB | 30-40 seg |
| `setup_morosidades.sql` | Objetos PL/SQL de morosidades | DDL/PL-SQL | ~15 KB | 5-10 seg |
| `datos_morosidad.sql` | Casos de prueba | DML | ~4 KB | 3-5 seg |
| `diagnostico.sql` | Consultas de verificación | DQL | ~2 KB | 1-2 seg |
| `diagnostico_morosidades.sql` | Verificación específica | DQL | ~1 KB | 1 seg |

---

## Detalles por Archivo

### 1. clear.sql - Limpieza de Base de Datos

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
   - PAGO_GASTO_COMUN
   - GASTO_COMUN_PAGO_CERO
   - GASTO_COMUN
   - RESPONSABLE_PAGO_GASTO_COMUN
   - TIPO_PERSONA
   - MULTA_ATRASO
   - FORMA_PAGO
   - ESTADO_PERIODO
   - ESTADO_PAGO
   - PERIODO_COBRO_GASTO_COMUN
   - DEPARTAMENTO
   - EDIFICIO
   - ADMINISTRADOR
   - COMUNA

5. **Secuencias**:
   ```sql
   DROP SEQUENCE seq_com;
   ```

#### Características:
- Usa CASCADE CONSTRAINTS para evitar errores de dependencias
- No falla si algún objeto no existe
- **ADVERTENCIA**: DESTRUCTIVO - Elimina TODOS los datos

#### Cuándo Usar:
- Al inicio de pruebas
- Para resetear completamente el sistema
- Antes de ejecutar seed.sql

---

### 2. seed.sql - Inicialización del Sistema

**Propósito**: Crear toda la estructura base del sistema y cargar datos iniciales.

#### Estructura del Archivo:

**A. Creación de Tablas (DDL)**

1. **Tablas de Referencia**:
   - COMUNA
   - ESTADO_PAGO
   - ESTADO_PERIODO
   - FORMA_PAGO
   - TIPO_PERSONA
   - MULTA_ATRASO

2. **Tablas de Entidades Principales**:
   - ADMINISTRADOR
   - EDIFICIO
   - DEPARTAMENTO
   - RESPONSABLE_PAGO_GASTO_COMUN

3. **Tablas de Transacciones**:
   - PERIODO_COBRO_GASTO_COMUN
   - GASTO_COMUN
   - GASTO_COMUN_PAGO_CERO
   - PAGO_GASTO_COMUN

**B. Restricciones (ALTER TABLE)**
- 14 Foreign Keys que conectan todas las tablas

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

1. **Comunas**: 31 comunas de Santiago
2. **Administrador**: Mauricio Moya Cerda
3. **Edificios** (6 edificios):
   - ID 10: Murano (Macul)
   - ID 20: Edificio Lisboa (Macul)
   - ID 30: Alto Peñalolen (Peñalolen)
   - ID 40: Edificio Ñuñoa Centro (Ñuñoa)
   - ID 50: Edificio Providencia (Providencia)
   - ID 60: Torres Almagro (Providencia)

4. **Departamentos**: ~50 departamentos
5. **Residentes**: ~30 responsables de pago

**E. Datos Transaccionales**

1. **Periodos de Cobro**: Años 2023-2025, últimos 3 meses de cada año
2. **Gastos Comunes**: ~2,500 registros históricos
3. **Pagos**: ~1,500 registros de pagos históricos

#### Características:
- Script idempotente (usa TO_CHAR(SYSDATE,'YYYY') para fechas dinámicas)
- Datos realistas con nombres y RUTs chilenos
- Cumple todas las reglas de integridad referencial
- ~2,759 statements ejecutados exitosamente

#### Estadísticas de Datos:
```
Comunas:                    31
Administradores:             1
Edificios:                   6
Departamentos:             ~50
Residentes:                ~30
Periodos de cobro:         ~36
Gastos comunes:         ~2,500
Pagos registrados:      ~1,500
```

---

### 3. setup_morosidades.sql - Sistema de Morosidades

**Propósito**: Crear todos los objetos PL/SQL necesarios para el sistema de gestión de morosidades.

#### Estructura del Script:

**A. Limpieza Preliminar**
- Elimina objetos si existen (con EXCEPTION para evitar errores)

**B. Tablas de Morosidad**

1. **AUDITORIA_PAGOS**:
   - Propósito: Registrar todos los pagos realizados
   - Trigger asociado: TRG_VALIDAR_AUDITORIA_PAGO
   - Columnas: id_auditoria, anno_mes_pcgc, id_edif, nro_depto, monto_cancelado, fecha_auditoria, operacion

2. **DETALLE_MOROSIDAD**:
   - Propósito: Almacenar el resumen de deuda por residente
   - Llenado por: Procedimiento SP_GENERAR_REPORTE_MOROSIDAD
   - Columnas: id_morosidad, numrun_rpgc, monto_total_moroso, fecha_ultima_actualizacion

3. **AUDITORIA_MOROSIDADES**:
   - Propósito: Auditar morosidades > $100,000
   - Trigger asociado: TRG_AUDITORIA_MOROSIDAD
   - Columnas: id_auditoria, numrun_rpgc, monto_moroso, fecha_auditoria, operacion

**C. Tipo Objeto (Type)**
- TIPO_VARRAY_FECHAS_MORA: Array de fechas para cálculos de mora

**D. Package PKG_RESIDENTES**

Contiene **8 funciones** para cálculos relacionados con residentes:

1. **FN_OBTENER_NOMBRE_COMPLETO**: Retorna nombre formateado
2. **FN_OBTENER_RUN_FORMATEADO**: Formatea RUN con puntos y guión
3. **FN_CALCULAR_TOTAL_DEUDA**: Calcula deuda total hasta un periodo
4. **FN_OBTENER_ULTIMO_PAGO**: Fecha del último pago realizado
5. **FN_CONTAR_MESES_MORA**: Cuenta meses con deuda pendiente
6. **FN_OBTENER_EDIFICIO_DEPTO**: Retorna ubicación del residente
7. **FN_CALCULAR_DIAS_MORA**: Días desde vencimiento más antiguo
8. **FN_OBTENER_PERIODOS_MOROSOS**: Lista de periodos con deuda

**E. Package PKG_MOROSIDADES**

Contiene el **procedimiento principal**:

**SP_GENERAR_REPORTE_MOROSIDAD** (p_anno_mes IN NUMBER):
1. Limpia DETALLE_MOROSIDAD existente
2. Consulta todos los residentes con gastos pendientes
3. Calcula deuda total por residente
4. Inserta en DETALLE_MOROSIDAD si deuda > 0
5. Activa trigger de auditoría si deuda > $100,000

**F. Triggers**

1. **TRG_VALIDAR_AUDITORIA_PAGO**:
   - Evento: Después de insertar un pago
   - Acción: Registra en AUDITORIA_PAGOS

2. **TRG_AUDITORIA_MOROSIDAD**:
   - Evento: Después de insertar en DETALLE_MOROSIDAD
   - Condición: Solo si monto > $100,000
   - Acción: Registra en AUDITORIA_MOROSIDADES

#### Características:
- Usa bloques BEGIN/END/ para manejo de errores
- Compatible con Oracle 19c
- Todos los objetos en estado VALID después de ejecutar
- 17 bloques PL/SQL ejecutados

---

### 4. datos_morosidad.sql - Casos de Prueba

**Propósito**: Insertar casos de prueba específicos para demostrar el sistema de morosidades.

#### Casos de Morosidad (8 casos):

1. **ALICIA OPAZO** (RUN: 6868859)
   - Edificio 10, Depto 21
   - Deuda: $59,000
   - 1 mes pendiente

2. **STEPHANIE DIAZ** (RUN: 16044255)
   - Edificio 10, Depto 22
   - Deuda: $32,450 (con pago parcial de $20,000)

3. **SANDRA ARIAS** (RUN: 8948642)
   - Edificio 10, Depto 23
   - Deuda: $119,500
   - **DEUDA ALTA - Activa auditoría**

4. **MARCIA BENITEZ** (RUN: 17046055)
   - Edificio 10, Depto 31
   - Deuda: $196,650 (3 periodos)
   - **DEUDA MUY ALTA - Activa auditoría**

5. **VALESKA GODOY** (RUN: 13635211)
   - Edificio 10, Depto 32
   - Deuda: $62,000 (con pago mínimo de $10,000)

6. **LUIS ALVAREZ** (RUN: 16439752)
   - Edificio 10, Depto 33
   - Deuda: $91,900

7. **HERNAN CASTRO** (RUN: 21815820)
   - Edificio 20, Depto 101
   - Deuda: $41,250

8. **PAMELA GATICA** (RUN: 16947140)
   - Edificio 20, Depto 102
   - Deuda: $90,000 (2 periodos)

#### Características Técnicas:

**Transacciones Consolidadas**:
- Inserciones de GASTO_COMUN y PAGO_GASTO_COMUN en el mismo bloque
- Evita errores de Foreign Key
- Garantiza consistencia transaccional

**Activación de Triggers**:
- 2 pagos parciales activan TRG_VALIDAR_AUDITORIA_PAGO
- 2 deudas altas activan TRG_AUDITORIA_MOROSIDAD

**Resumen**: 11 periodos de gastos, 2 pagos parciales, Deuda total: $692,750

---

### 5. diagnostico.sql - Verificación del Sistema

**Propósito**: Consultas para verificar el estado general del sistema.

#### Consultas Incluidas:

1. **Privilegios del Usuario**: Verifica permisos CREATE
2. **Estado de Objetos**: Lista packages, triggers y types con su estado
3. **Errores de Compilación**: Muestra errores en PKG_MOROSIDADES y PKG_RESIDENTES
4. **Tablas Creadas**: Verifica existencia de tablas de morosidad

#### Uso:
- Ejecutar después de setup_morosidades.sql
- Verificar que todos los objetos estén en estado VALID
- Comprobar que no haya errores de compilación

---

### 6. diagnostico_morosidades.sql - Verificación Específica

**Propósito**: Consultas específicas para el sistema de morosidades.

#### Consultas:

1. **Contenido de DETALLE_MOROSIDAD**: Lista todos los residentes morosos
2. **Auditoría de Morosidades Altas**: Deudas auditadas > $100,000
3. **Auditoría de Pagos**: Historial de pagos registrados
4. **Estadísticas por Edificio**: Total de morosos y deuda por edificio

---

## Orden de Ejecución

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
datos_morosidad.sql (depende de todas las tablas base)
    ↓
[API Call] SP_GENERAR_REPORTE_MOROSIDAD
    ↓
diagnostico_morosidades.sql
```

---

## Consideraciones Técnicas

### 1. Parser de Bloques PL/SQL

El sistema usa un parser personalizado en DatabaseAdminService.java:

```java
String[] blocks = content.split("(?m)^\\s*/\\s*$");
```

**Requisitos del formato**:
- Cada bloque PL/SQL debe terminar con / en su propia línea
- El delimitador / puede tener espacios antes/después
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

### 2. Manejo de Errores

Los scripts usan diferentes estrategias:

**Ignorar errores**:
```sql
BEGIN EXECUTE IMMEDIATE 'DROP TABLE ...'; 
EXCEPTION WHEN OTHERS THEN NULL; 
END;
/
```

**Permitir fallo controlado**:
```sql
BEGIN
    INSERT INTO PERIODO_COBRO_GASTO_COMUN VALUES(202508, 1); 
    EXCEPTION WHEN OTHERS THEN NULL;
END;
/
```

### 3. Transacciones

**Regla importante**: Las inserciones con FK deben estar en el mismo bloque:

```sql
-- CORRECTO
BEGIN
    INSERT INTO GASTO_COMUN VALUES(...);
    INSERT INTO PAGO_GASTO_COMUN VALUES(...);
    COMMIT;
END;
/

-- INCORRECTO
BEGIN
    INSERT INTO GASTO_COMUN VALUES(...);
    COMMIT;
END;
/
BEGIN
    INSERT INTO PAGO_GASTO_COMUN VALUES(...);  -- Error: FK no encuentra registro
    COMMIT;
END;
/
```

### 4. Fechas Dinámicas

El script seed.sql usa fechas relativas al año actual:

```sql
TO_CHAR(SYSDATE,'YYYY')||'10'  -- Octubre del año actual
TO_CHAR(SYSDATE,'YYYY')-1||'11'  -- Noviembre del año pasado
```

### 5. Secuencias e Identity

Oracle 12c+ soporta GENERATED ALWAYS AS IDENTITY:

```sql
CREATE TABLE DETALLE_MOROSIDAD (
    id_morosidad NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ...
)
```

---

## Troubleshooting

### Error: "ORA-02291: restricción de integridad violada"

**Causa**: Intentar insertar un registro hijo sin el padre correspondiente.

**Solución**: 
- Verificar que seed.sql se ejecutó completamente
- Consolidar inserciones en el mismo bloque PL/SQL

### Error: "ORA-00942: table or view does not exist"

**Causa**: Ejecutar scripts fuera de orden.

**Solución**: Seguir el orden correcto de ejecución

### Error: "PLS-00201: identifier must be declared"

**Causa**: Package no compilado o en estado INVALID.

**Solución**: 
1. Ejecutar diagnostico.sql para ver estado
2. Re-ejecutar setup_morosidades.sql
3. Revisar errores con: SELECT * FROM USER_ERRORS;

### Advertencia: "Only 2 blocks executed"

**Causa**: Parser antiguo no detectaba correctamente el delimitador /.

**Solución**: Verificar que DatabaseAdminService.java use el regex correcto

---

## Métricas de Ejecución

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

**Última actualización**: Octubre 2025  
**Versión**: 1.0  
**Compatible con**: Oracle Database 19c

