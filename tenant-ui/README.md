# Tenant Payment System - Frontend

Sistema de administración de arrendatarios, morosidades y pagos. Aplicación web desarrollada en React con Vite.

## Descripción

Esta es la interfaz de usuario para la gestión integral de tenants (arrendatarios), registro de morosidades y procesamiento de pagos parciales. La aplicación se conecta a un backend Spring Boot que maneja la lógica de negocio y la persistencia de datos en Oracle.

## Características principales

- Dashboard de estadísticas en tiempo real
- Gestión de tenants (arrendatarios, dueños, representantes legales)
- Visualización de morosidades y deudas
- Registro de pagos parciales
- Auditoría de cambios en morosidades
- Auditoría de pagos registrados
- Listado de edificios con métricas de morosidad
- Flujo de prueba con 14 pasos ejecutables manualmente

## Páginas disponibles

- Inicio (/) - Dashboard principal
- Tenants (/tenants) - Lista de residentes
- Morosidades (/morosidad) - Residentes con deuda registrada
- Edificios (/edificios) - Lista de edificios
- Auditoría Morosidad (/auditoria-morosidad) - Historial de cambios en morosidades
- Auditoría Pagos (/auditoria-pagos) - Historial de pagos parciales registrados
- Registro Pagos (/registro-pagos) - Formulario para registrar pagos
- Flujo de Prueba (/flow) - 14 pasos de prueba del sistema

## Tecnologías

- React 19.1.1
- React Router DOM
- Vite (build tool)
- Tailwind CSS 4.1.14

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en http://localhost:5173

## Build

```bash
npm run build
```

## Requisitos

- Backend ejecutándose en http://localhost:8090
- Node.js 16+
- npm o yarn

## Estructura de proyecto

```
src/
├── pages/            - Páginas principales
├── components/       - Componentes reutilizables
├── services/         - Servicios API
├── hooks/            - Custom hooks
├── layouts/          - Layouts compartidos
├── constants/        - Configuración y constantes
└── css/              - Estilos globales
```

## Uso de la aplicación

1. Iniciar aplicación accediendo a http://localhost:5173
2. En el dashboard inicial, opcionalmente limpiar base de datos
3. Poblar base de datos con datos de prueba
4. Navegar entre secciones usando las tarjetas del dashboard
5. Explorar datos, registrar pagos y ejecutar flujo de prueba

## Endpoints del backend y campos esperados

GET /api/admin/tenants
Retorna lista de residentes con campos: idTenant, numrun, dvrun, nombreCompleto, email, telefono

GET /api/morosidades/detalle
Retorna residentes con deuda con campos: idMorosidad, numrun, dvrun, nombreCompleto, montoTotalMoroso, fechaUltimaActualizacion

GET /api/morosidades/auditoria
Retorna historial de cambios en morosidades con campos: idAuditoria, numrun, montoMorosoAnterior, montoMorosoNuevo, fechaAuditoria
Nota: No incluye nombreCompleto ni edificio/depto. El frontend calcula la diferencia.

GET /api/morosidades/auditoria-pagos
Retorna historial de pagos registrados con campos: idAuditoria, annoMes, idEdif, nroDepto, montoCancelado, fechaAuditoria, operacion
Nota: Campo es montoCancelado, no monto. Incluye fechaAuditoria, no fechaPago.

GET /api/edificios/todos
Retorna lista de edificios con métricas de morosidad

POST /api/pagos/registrar-parcial
Recibe campos: annoMes (YYYYMM), idEdif, nroDepto, monto
Registra un pago parcial en la auditoría de pagos

POST /api/admin/seed-database
Genera datos de prueba en la base de datos

POST /api/admin/clear-database
Limpia la base de datos

## Mapeado de campos por página

AuditoriaMorosidadPage:
- Columnas: RUN, Monto Anterior, Monto Nuevo, Diferencia, Fecha Auditoría
- Campos API: numrun, montoMorosoAnterior, montoMorosoNuevo, (calculado), fechaAuditoria
- Nota: No display nombre completo. Mostrar solo datos disponibles en AuditoriaMorosidadResponse

AuditoriaPagosPage:
- Columnas: Período, Monto, Edificio, Depto, Operación, Fecha Auditoría
- Campos API: annoMes, montoCancelado, idEdif, nroDepto, operacion, fechaAuditoria
- Nota: Usa montoCancelado (no monto) y fechaAuditoria (no fechaPago)

RegistroPagosPage:
- Campos enviados: annoMes, idEdif, nroDepto, monto
- Validaciones: Monto debe ser positivo. Todos los campos obligatorios.
- Respuesta: Mensaje de éxito y registro en auditoría de pagos

MorosidadPage:
- Columnas: RUN, Nombre Completo, Deuda, Fecha Actualización
- Campos API: numrun, nombreCompleto, montoTotalMoroso, fechaUltimaActualizacion
- Nota: No incluye edificio, depto, ni diasMoroso (no existen en API)

## Notas

- Todos los datos se cargan automáticamente al navegar a cada sección
- Los cálculos de totales y promedios se realizan en el frontend
- El sistema maneja errores de forma amigable con mensajes descriptivos
- La auditoría de morosidades solo muestra cambios registrados en el backend
- La auditoría de pagos solo muestra pagos registrados vía POST /api/pagos/registrar-parcial
