# Tenant Payment Application - Sistema de Gestión de Morosidades

Sistema completo de gestión de pagos y morosidades para edificios, desarrollado con Spring Boot y Oracle 19c.

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Flujo de Prueba Completo](#flujo-de-prueba-completo)
- [Documentación SQL](#documentación-sql)

## Descripción General

Este sistema gestiona:
- **Edificios y Departamentos**: Administración de propiedades
- **Gastos Comunes**: Cálculo y registro de cobros mensuales
- **Pagos**: Registro de pagos totales y parciales
- **Morosidades**: Sistema automático de detección y reporte
- **Auditoría**: Registro automático de operaciones críticas mediante triggers

### Características Principales

**Cálculo Automático de Morosidades**
- Detección automática de deudas pendientes
- Cálculo de días de mora
- Agregación de deudas por residente

**Sistema de Auditoría**
- Trigger automático para pagos
- Trigger automático para morosidades > $100,000
- Registro con timestamp y tipo de operación

**Paquetes PL/SQL**
- `PKG_RESIDENTES`: Funciones de cálculo y consulta
- `PKG_MOROSIDADES`: Generación de reportes

## Tecnologías

### Backend
- Java 17
- Spring Boot 3.x
- Spring Data JPA
- Oracle JDBC Driver

### Base de Datos
- Oracle Database 19c
- PL/SQL (Packages, Triggers, Types)

### Frontend
- React + Vite
- JavaScript ES6+

## Estructura del Proyecto

```
tenant-app/
├── tenant-payment/                    # Backend Spring Boot
│   ├── src/main/
│   │   ├── java/cl/maotech/tenantpayment/
│   │   │   ├── controller/           # REST Controllers
│   │   │   ├── service/              # Lógica de negocio
│   │   │   ├── repository/           # JPA Repositories
│   │   │   └── model/                # Entidades
│   │   └── resources/
│   │       ├── sql/                  # Scripts SQL (ver SQL_README.md)
│   │       │   ├── clear.sql
│   │       │   ├── seed.sql
│   │       │   ├── setup_morosidades.sql
│   │       │   └── datos_morosidad.sql
│   │       └── application.yaml      # Configuración
│   └── pom.xml
├── tenant-ui/                         # Frontend React
└── Flujo_Prueba_Completo.postman_collection.json
```

## Instalación

### Prerrequisitos

- Java 17 o superior
- Maven 3.8+
- Oracle Database 19c
- Node.js 18+ (para frontend)

### Configuración de Base de Datos

1. Edita `tenant-payment/src/main/resources/application.yaml`:

```yaml
spring:
  datasource:
    url: jdbc:oracle:thin:@<tu-servidor>:1521/<tu-servicio>
    username: <tu-usuario>
    password: <tu-contraseña>
```

### Iniciar Backend

```bash
cd tenant-payment
mvn clean install
mvn spring-boot:run
```

La aplicación estará disponible en: `http://localhost:8090`

### Iniciar Frontend (Opcional)

```bash
cd tenant-ui
npm install
npm run dev
```

## Flujo de Prueba Completo

El archivo `Flujo_Prueba_Completo.postman_collection.json` contiene un flujo completo de 14 pasos para probar todas las funcionalidades del sistema.

### Cómo Ejecutar la Colección

1. **Importar en Postman**
   - Abre Postman
   - Click en "Import" → Selecciona `Flujo_Prueba_Completo.postman_collection.json`

2. **Configurar Variable**
   - Crea una variable de entorno llamada `base_url`
   - Valor: `http://localhost:8090`

3. **Ejecutar el Runner**
   - Click derecho en la colección → "Run collection"
   - Selecciona TODOS los requests (14 pasos)
   - Click en "Run Flujo Completo"

### Descripción de los Pasos

#### PASO 1: Limpiar Base de Datos
```
POST /api/admin/database/clear
```
- **Objetivo**: Eliminar todas las tablas y objetos existentes
- **Efecto**: Base de datos completamente limpia
- **Tiempo estimado**: 5-10 segundos

#### PASO 2: Inicializar Sistema Completo
```
POST /api/admin/database/seed
```
- **Objetivo**: Crear estructura base del sistema
- **Crea**:
  - 6 edificios (Murano, Edificio Lisboa, Alto Peñalolen, etc.)
  - ~50 departamentos
  - ~30 residentes
  - Estados de pago y periodos
  - Multas por atraso
- **Tiempo estimado**: 30-40 segundos
- **Registros insertados**: ~2,759

#### PASO 3: Configurar Sistema de Morosidades
```
POST /api/admin/database/morosidades
```
- **Objetivo**: Crear objetos PL/SQL para morosidades
- **Crea**:
  - `PKG_RESIDENTES` (package con 8 funciones)
  - `PKG_MOROSIDADES` (package con SP_GENERAR_REPORTE_MOROSIDAD)
  - Tabla `DETALLE_MOROSIDAD`
  - Tabla `AUDITORIA_MOROSIDADES`
  - Tabla `AUDITORIA_PAGOS`
  - Trigger `TRG_VALIDAR_AUDITORIA_PAGO`
  - Trigger `TRG_AUDITORIA_MOROSIDAD`
- **Tiempo estimado**: 5-10 segundos
- **Bloques PL/SQL ejecutados**: 17

#### PASO 4: Cargar Datos de Morosidad
```
POST /api/admin/database/datos-morosidad
```
- **Objetivo**: Insertar casos de prueba de morosidades
- **Inserta**: 8 casos de residentes con deuda:

| # | Residente | RUN | Edificio | Depto | Deuda | Observaciones |
|---|-----------|-----|----------|-------|-------|---------------|
| 1 | ALICIA OPAZO | 6868859 | 10 | 21 | $59,000 | 1 mes pendiente |
| 2 | STEPHANIE DIAZ | 16044255 | 10 | 22 | $32,450 | Con pago parcial ($20,000) |
| 3 | SANDRA ARIAS | 8948642 | 10 | 23 | $119,500 | DEUDA ALTA - Activa auditoría |
| 4 | MARCIA BENITEZ | 17046055 | 10 | 31 | $196,650 | DEUDA ALTA - 3 meses |
| 5 | VALESKA GODOY | 13635211 | 10 | 32 | $62,000 | Con pago mínimo ($10,000) |
| 6 | LUIS ALVAREZ | 16439752 | 10 | 33 | $91,900 | 1 mes con recargos |
| 7 | HERNAN CASTRO | 21815820 | 20 | 101 | $41,250 | 1 mes pendiente |
| 8 | PAMELA GATICA | 16947140 | 20 | 102 | $90,000 | 2 meses pendientes |

- **Deuda Total**: $692,750
- **Periodos afectados**: 202508, 202509, 202510 (Ago-Oct 2025)
- **Tiempo estimado**: 5 segundos
- **Bloques ejecutados**: 15

#### PASO 5: Generar Reporte de Morosidades (CRÍTICO)
```
POST /api/morosidades/generar-reporte
Body: { "annoMes": 202510 }
```
- **Objetivo**: Procesar todas las deudas y generar el reporte
- **Este es el paso MÁS IMPORTANTE**
- **Proceso**:
  1. Lee todos los gastos comunes pendientes
  2. Calcula deuda total por residente
  3. Calcula días de mora
  4. **Llena la tabla `DETALLE_MOROSIDAD`**
  5. Activa triggers de auditoría para deudas > $100,000
- **Resultado**: 8 registros en `DETALLE_MOROSIDAD`
- **ADVERTENCIA: SIN ESTE PASO, LOS PASOS 6 Y 7 ESTARÁN VACÍOS**

#### PASO 6: Ver TODOS los Residentes Morosos
```
GET /api/morosidades/detalle
```
- **Objetivo**: Consultar todos los residentes con deuda
- **Resultado esperado**: Array con 8 residentes
- **Datos mostrados**:
  - ID de morosidad
  - RUN del residente
  - Monto total moroso
  - Fecha de última actualización

Ejemplo de respuesta:
```json
[
  {
    "idMorosidad": 1,
    "numrun": 6868859,
    "montoTotalMoroso": 59000.00,
    "fechaUltimaActualizacion": "2025-10-19T00:00:00"
  }
]
```

#### PASO 7: Ver Detalle de SANDRA ARIAS
```
GET /api/morosidades/detalle?numrun=8948642
```
- **Objetivo**: Consultar un residente específico
- **Residente**: SANDRA ARIAS (deuda alta)
- **Resultado esperado**: 1 registro con deuda de $119,500

#### PASO 8: Registrar Pago Parcial de ALICIA OPAZO
```
POST /api/pagos/registrar-parcial
Body: {
  "annoMes": 202508,
  "idEdif": 10,
  "nroDepto": 21,
  "monto": 30000.00
}
```
- **Objetivo**: Simular un pago parcial
- **Residente**: ALICIA OPAZO
- **Deuda original**: $59,000
- **Pago**: $30,000
- **Saldo restante**: $29,000
- **Efecto**: Activa trigger `TRG_VALIDAR_AUDITORIA_PAGO`

#### PASO 9: Regenerar Reporte Actualizado
```
POST /api/morosidades/generar-reporte
Body: { "annoMes": 202510 }
```
- **Objetivo**: Actualizar el reporte con el nuevo pago
- **Efecto**: Recalcula la deuda de ALICIA OPAZO

#### PASO 10: Ver Residentes Morosos Actualizados
```
GET /api/morosidades/detalle
```
- **Objetivo**: Verificar que la deuda de ALICIA se actualizó
- **Resultado esperado**: ALICIA ahora aparece con $29,000 (en lugar de $59,000)

#### PASO 11: Ver Todos los Edificios con Promedios
```
GET /api/edificios/promedios
```
- **Objetivo**: Obtener estadísticas por edificio
- **Datos mostrados**:
  - ID y nombre del edificio
  - Promedio de deuda de morosos
  - Total de residentes morosos

#### PASO 12: Ver Auditoría de Morosidades
```
GET /api/auditoria/morosidades?montoMinimo=100000
```
- **Objetivo**: Consultar registros de auditoría
- **Filtro**: Solo deudas > $100,000
- **Resultado esperado**: 2 registros
  - SANDRA ARIAS: $119,500
  - MARCIA BENITEZ: $196,650

#### PASO 13: Ver Auditoría de Pagos
```
GET /api/auditoria/pagos
```
- **Objetivo**: Consultar el historial de pagos auditados
- **Resultado esperado**: Mínimo 3 pagos

#### PASO 14: Diagnóstico Final del Sistema
```
GET /api/admin/diagnostico
```
- **Objetivo**: Verificar el estado completo del sistema
- **Información mostrada**:
  - Privilegios del usuario
  - Estado de objetos (VALID/INVALID)
  - Errores de compilación
  - Tablas creadas

### Resultados Esperados del Flujo Completo

Al finalizar los 14 pasos, deberías tener:

- **8 residentes morosos** inicialmente
- **Deuda total**: $692,750 → $662,750 (después del pago de ALICIA)
- **2 auditorías de morosidades** (SANDRA y MARCIA con deuda > $100k)
- **Al menos 3 pagos registrados** en auditoría
- **Sistema de triggers funcionando** correctamente
- **Paquetes PL/SQL en estado VALID**

### Troubleshooting

#### Problema: Pasos 6 y 7 retornan arrays vacíos
**Causa**: No se ejecutó el PASO 5  
**Solución**: El PASO 5 es obligatorio, ejecuta `POST /api/morosidades/generar-reporte`

#### Problema: Error de FK al insertar datos (PASO 4)
**Causa**: El parser de bloques PL/SQL no funcionó correctamente  
**Solución**: Verifica que el código en `DatabaseAdminService.java` esté actualizado con el regex correcto

#### Problema: "Base de datos limpiada" pero no se crea nada
**Causa**: Script SQL con errores de sintaxis  
**Solución**: Revisa los logs en consola para ver detalles del error

## Documentación Adicional

Para más detalles sobre los scripts SQL y su funcionamiento, consulta:
- [SQL_README.md](tenant-payment/src/main/resources/sql/SQL_README.md) - Documentación detallada de cada script SQL

## Licencia

Este proyecto es para fines educativos - Duoc UC
