# Estructura del Proyecto - Tenant UI

## 📁 Estructura de Carpetas

```
src/
├── pages/                    # Páginas principales de la aplicación
│   └── TenantsPage.jsx      # Página de gestión de arrendatarios
│
├── layouts/                 # Layouts reutilizables
│   └── MainLayout.jsx       # Layout principal con header y footer
│
├── components/              # Componentes React reutilizables
│   ├── TenantTable.jsx      # Tabla de arrendatarios
│   ├── TenantRow.jsx        # Fila individual de la tabla
│   └── ui/                  # Componentes UI genéricos
│       └── StateComponents.jsx  # Componentes de estado (loading, error, empty)
│
├── hooks/                   # Hooks personalizados
│   ├── useTenants.js        # Hook para obtener arrendatarios
│   └── index.js             # Exportaciones centralizadas
│
├── services/                # Servicios de API
│   ├── tenantService.js     # Servicio de llamadas a API de arrendatarios
│   └── index.js             # Exportaciones centralizadas
│
├── utils/                   # Funciones utilitarias
│   ├── formatters.js        # Funciones de formateo (RUN, nombres, etc.)
│   └── index.js             # Exportaciones centralizadas
│
├── constants/               # Constantes de la aplicación
│   └── config.js            # Configuración global, endpoints, colores, etc.
│
├── assets/                  # Imágenes, iconos, etc.
├── css/                     # Estilos globales
├── App.jsx                  # Componente raíz
└── main.jsx                 # Entrada de la aplicación
```

## 🎯 Principios de Organización

### **Pages** (Páginas)
- Componentes de nivel superior que representan rutas
- Combinan múltiples componentes para formar una página completa
- Ejemplo: `TenantsPage` que usa `MainLayout` y `TenantTable`

### **Layouts** (Diseños)
- Componentes que proporcionan estructura visual
- Header, footer, sidebar, etc.
- Reutilizables en múltiples páginas
- Ejemplo: `MainLayout` con header y footer

### **Components** (Componentes)
- Componentes UI reutilizables
- `TenantTable`: componente controlado que muestra datos
- `TenantRow`: componente de presentación pura (dumb component)
- `ui/`: componentes genéricos sin lógica de negocio

### **Hooks** (Ganchos Personalizados)
- Lógica reutilizable de React
- `useTenants`: gestiona el estado y la obtención de datos
- Separación de lógica de presentación

### **Services** (Servicios)
- Lógica de negocio y llamadas a API
- Singleton pattern para reutilización
- `TenantService`: todas las operaciones de arrendatarios
- Facilita testing y mocking

### **Utils** (Utilidades)
- Funciones puras sin estado
- `formatters.js`: funciones de transformación de datos
- `formatRUN()`: formatea RUN chileno
- `getTenantTypeBadgeColor()`: lógica de colores

### **Constants** (Constantes)
- Valores centralizados que no cambian
- URLs de API, colores, enumeraciones
- Fácil mantenimiento y actualización

## 🔄 Flujo de Datos

```
TenantsPage
  └── MainLayout
        └── TenantTable
              ├── useTenants (hook)
              │   └── tenantService (servicio)
              │       └── API Backend
              ├── TENANT_COLUMNS (constantes)
              └── TenantRow (x múltiples)
                  └── formatters (utils)
```

## ✨ Beneficios de Esta Estructura

✅ **Modular**: Fácil de mantener y escalar
✅ **Reutilizable**: Componentes y funciones pueden usarse en varios lugares
✅ **Testeable**: Servicios y funciones pueden ser probados independientemente
✅ **Mantenible**: Cada carpeta tiene una responsabilidad clara
✅ **Escalable**: Fácil agregar nuevas páginas, componentes o servicios
✅ **Colaborativo**: Otros desarrolladores entienden rápidamente la estructura

## 📝 Convenciones de Nombrado

- **Archivos de componentes**: PascalCase (ej: `TenantTable.jsx`)
- **Archivos de hooks**: camelCase con prefijo `use` (ej: `useTenants.js`)
- **Archivos de servicios**: camelCase con sufijo `Service` (ej: `tenantService.js`)
- **Archivos de utilidades**: camelCase con descripción (ej: `formatters.js`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `API_BASE_URL`)

## 🚀 Ejemplo de Importaciones

```javascript
// Buena práctica: Importar desde archivos index
import { useTenants } from '../hooks';
import { formatRUN, getTenantTypeBadgeColor } from '../utils';
import tenantService from '../services';

// Constantes
import { TENANT_COLUMNS, API_ENDPOINTS } from '../constants/config';
```
