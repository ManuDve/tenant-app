# Guía de Inicio Rápido - Tenant Payment System

## Requisitos Previos

- Node.js 16+ con npm
- Spring Boot backend ejecutándose en `http://localhost:8090`
- Base de datos Oracle configurada

---

## Instalación

### 1. Instalar dependencias
```bash
cd tenant-ui
npm install
```

### 2. Iniciar el servidor de desarrollo
```bash
npm run dev
```

El navegador abrirá automáticamente en `http://localhost:5173`

---

## Primer Uso

### Paso 1: Acceder a la aplicación
- URL: `http://localhost:5173`
- Se abrirá el **HomePage** (Dashboard)

### Paso 2: Inicializar la base de datos
1. En la sección "Administración de Base de Datos" (arriba de la página)
2. Click en botón **"Poblando (esto puede tardar)..."**
3. Esperar a que complete (puede tomar 30-60 segundos)
4. Se mostrarán las estadísticas automáticamente

### Paso 3: Explorar datos
Una vez poblada la BD, podrás navegar a:

#### Opción A: Usando las tarjetas del Dashboard
- Click en "Tenants" para ver arrendatarios
- Click en "Morosidades" para ver deudores
- Click en "Edificios" para ver edificios
- Click en "Auditoría Morosidad" para historial
- Click en "Auditoría Pagos" para pagos registrados
- Click en "Registro de Pagos" para registrar un nuevo pago
- Click en "Flujo de Prueba" para ejecutar 14 pasos

#### Opción B: Usando la barra de breadcrumb
Haz click en "Inicio" arriba y luego selecciona la sección

---

## Características por Página

### HomePage (`/`)
**¿Qué hacer aquí?**
- Ver estadísticas generales
- Poblar/Limpiar base de datos
- Navegar a otras secciones

**Información mostrada:**
- Total de Tenants
- Total de Morosos
- Total de Edificios
- Deuda Total

---

### TenantsPage (`/tenants`)
**¿Qué hacer aquí?**
- Ver lista de arrendatarios, dueños y representantes
- Filtrar por tipo de persona
- Ordenar por cualquier columna
- Paginar resultados

**Cómo usar:**
1. Click en encabezados para ordenar
2. Usa el dropdown "Filtrar por tipo" para filtrar
3. Selecciona items por página (10, 25, 50, 100)
4. Usa botones de navegación: Inicio, Anterior, Números, Siguiente, Final

---

### MorosidadPage (`/morosidad`)
**¿Qué hacer aquí?**
- Ver deudores con morosidades > $100,000
- Ver estadísticas de deuda
- Ordenar y paginar

**Cómo usar:**
1. Click en "Cargar Morosidades" para traer datos
2. Revisa las 3 estadísticas (Total, Promedio)
3. Ordena por RUN, Nombre, Deuda, etc.
4. Selecciona items por página (5, 10, 25)

**Datos mostrados:**
- RUN del deudor
- Nombre Completo
- Edificio y Departamento
- Monto de Deuda
- Días de Mora
- Fecha de Actualización

---

### EdificiosPage (`/edificios`)
**¿Qué hacer aquí?**
- Ver lista de edificios
- Ver promedio de morosidad por edificio
- Ordenar y paginar

**Cómo usar:**
1. Click en "Cargar Edificios" para traer datos
2. Ordena por cualquier columna
3. Selecciona items por página
4. Revisa el "Promedio Morosidad" de cada edificio

---

### AuditoriaMorosidadPage (`/auditoria-morosidad`)
**¿Qué hacer aquí?**
- Ver historial de cambios en morosidades
- Revisar diferencias de monto

**Cómo usar:**
1. Click en "Cargar Auditoría de Morosidades"
2. Revisa quién, cuándo y cuánto cambió
3. La columna "Diferencia" muestra el cambio

---

### AuditoriaPagosPage (`/auditoria-pagos`)
**¿Qué hacer aquí?**
- Ver todos los pagos registrados
- Ver estadísticas de pagos

**Información:**
- Total de pagos registrados
- Cantidad de pagos
- Promedio por pago

---

### RegistroPagosPage (`/registro-pagos`)
**¿Qué hacer aquí?**
- Registrar un pago parcial de una deuda

**Cómo completar:**
1. Ingresa **Período**: Selecciona año-mes
2. Ingresa **ID Edificio**: Número del edificio
3. Ingresa **Número de Departamento**: Número del depto
4. Ingresa **Monto**: Cantidad a pagar en pesos
5. Click en "Registrar Pago"
6. Verás confirmación de éxito

**Ejemplo:**
- Período: 2024-12
- Edificio: 1
- Depto: 101
- Monto: 500000

---

### FlowPage (`/flow`)
**¿Qué hacer aquí?**
- Ejecutar 14 pasos de prueba de forma manual
- Ver resultados detallados

**Los 14 Pasos:**
1. Limpiar Base de Datos
2. Poblar Base de Datos
3. Configurar Morosidades
4. Cargar Datos de Morosidad
5. Generar Reporte Morosidad (202401)
6. Obtener Detalle Morosidad
7. Obtener Auditoría Morosidad
8. Registrar Pago Parcial
9. Obtener Auditoría Pagos
10. Obtener Todos Edificios
11. Obtener Detalle Edificio
12. Obtener Todos Tenants
13. Obtener Tenant por RUN
14. Obtener Diagnóstico

**Cómo usar:**
1. Ve a FlowPage
2. Haz click en "Ejecutar" para cada paso
3. Observa el resultado (JSON)
4. Los pasos de consulta pueden saltarse con "Saltar"
5. Revisa la barra de progreso arriba

---

## Tabla de Funciones por Página

| Página | Cargar | Ordenar | Filtrar | Paginar | Editar |
|--------|--------|---------|---------|---------|--------|
| Tenants | Auto | Sí | Sí | Sí | No |
| Morosidad | Botón | Sí | No | Sí | No |
| Edificios | Botón | Sí | No | Sí | No |
| Auditoría Morosidad | Botón | Sí | No | Sí | No |
| Auditoría Pagos | Botón | Sí | No | Sí | No |
| Registro de Pagos | Form | No | No | No | Sí |
| Flow | Manual | No | No | No | No |

---

## Atajos de Teclado (Próximamente)

Actualmente no hay atajos, pero puedes usar:
- **Tab**: Navegar entre campos del formulario
- **Enter**: Enviar formulario
- **Escape**: Cerrar modales (cuando se implemente)

---

## Preguntas Frecuentes

### P: ¿Qué pasa si hago click en "Limpiar Base de Datos"?
**R:** Se eliminarán TODOS los registros. Deberás volver a poblar.

### P: ¿Cuánto tarda poblar la BD?
**R:** Entre 30-60 segundos dependiendo de tu sistema.

### P: ¿Puedo registrar múltiples pagos?
**R:** Sí, puedes registrar tantos como quieras. Usa "Limpiar" para volver a llenar el formulario.

### P: ¿Qué pasa si no completo todos los campos del formulario?
**R:** Verás un error pidiendo que completes los campos requeridos.

### P: ¿Cómo vuelvo a la página anterior?
**R:** Usa el botón "Inicio" en el breadcrumb o haz click en el logo.

### P: ¿Dónde veo los errores?
**R:** Los errores aparecen en una caja roja debajo del botón de acción.

---

## Estructura de Datos

### Tenant
```json
{
  "numrun": 12345678,
  "dvrun": "9",
  "nombreCompleto": "Juan Pérez",
  "tipoPersona": "ARRENDATARIO",
  "telefono": "+56912345678",
  "email": "juan@email.com"
}
```

### Morosidad
```json
{
  "numrun": 12345678,
  "nombreCompleto": "Juan Pérez",
  "edificio": "1",
  "depto": "101",
  "deuda": 500000,
  "dias": 60,
  "fechaActualizacion": "2024-12-01"
}
```

### Pago
```json
{
  "annoMes": "202412",
  "idEdif": 1,
  "nroDepto": 101,
  "monto": 250000
}
```

---

## Troubleshooting

### Error: "Base de datos no inicializada"
**Solución:** Ve a HomePage y haz click en "Poblar Base de Datos"

### Error: "No se puede conectar al servidor"
**Solución:** Verifica que el backend esté ejecutándose en http://localhost:8090

### Error: "Campos requeridos"
**Solución:** Completa todos los campos del formulario antes de enviar

### Tablas vacías
**Solución:** Carga los datos usando el botón "Cargar" de cada página

### Página en blanco
**Solución:** Recarga la página (F5 o Cmd+R)

---

## Soporte

Para más información:
- Ver archivo `ESTRUCTURA_FINAL.md` para detalles técnicos
- Ver archivo `RESUMEN_FINAL.md` para visión general del proyecto
- Revisar `src/constants/config.js` para endpoints API

---

**Última actualización: 2024-12**
