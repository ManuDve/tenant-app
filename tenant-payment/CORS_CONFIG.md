# Configuración CORS - Backend Spring Boot

## 📋 Descripción

Se ha configurado CORS (Cross-Origin Resource Sharing) en el backend para permitir solicitudes desde el frontend React en desarrollo y producción.

## 🔧 Cambios Realizados

### 1. Clase de Configuración Global (CorsConfig.java)

Se creó la clase `CorsConfig` en el paquete `config` que implementa `WebMvcConfigurer`.

**Ubicación:** `src/main/java/cl/maotech/tenantpayment/config/CorsConfig.java`

**Función:**
- Configura CORS globalmente para todos los endpoints `/api/**`
- Permite solicitudes desde múltiples orígenes
- Máxima flexibilidad y centralización

### 2. Anotación en Controlador (TenantController.java)

Se agregó la anotación `@CrossOrigin` al controlador para mayor explicitación.

**Ubicación:** `src/main/java/cl/maotech/tenantpayment/controller/TenantController.java`

**Ventaja:** Mayor control y claridad sobre qué endpoints permiten CORS

## ✅ Orígenes Permitidos

```
- http://localhost:5173       (Vite dev server - puerto por defecto)
- http://localhost:3000        (Alternativa común)
- http://127.0.0.1:5173       (localhost alternativo)
- http://127.0.0.1:3000       (localhost alternativo)
```

## 🔐 Métodos HTTP Permitidos

```
GET, POST, PUT, DELETE, PATCH, OPTIONS
```

## 📤 Headers Permitidos

```
* (todos los headers)
```

## ⚙️ Configuración Adicional

| Propiedad | Valor | Descripción |
|-----------|-------|-------------|
| `allowCredentials` | `true` | Permite cookies y autenticación |
| `maxAge` | `3600` | Tiempo de caché de preflight (segundos) |

## 🚀 Cómo Usar

### En Desarrollo (con Vite)

El frontend en `http://localhost:5173` puede ahora hacer solicitudes a `http://localhost:8090/api/...` sin problemas.

### Ejemplo en React

```javascript
// No necesitas proxies ni configuración adicional
const response = await fetch('http://localhost:8090/api/tenants');
const data = await response.json();
```

## 🔄 Flujo de Solicitud CORS

```
1. Frontend hace solicitud a otro origen
2. Navegador envía solicitud preflight (OPTIONS)
3. Backend (CorsConfig) responde con headers CORS
4. Navegador permite la solicitud real (GET, POST, etc.)
5. Datos son retornados al frontend
```

## 📝 Para Agregar Nuevos Orígenes

### Opción 1: Modificar CorsConfig.java

```java
registry.addMapping("/api/**")
        .allowedOrigins(
            "http://localhost:5173",
            "http://localhost:3000",
            "https://mi-dominio.com"  // Nuevo origen
        )
        // ...
```

### Opción 2: Modificar Variables de Entorno (Recomendado)

```properties
# application.properties
app.cors.allowed-origins=http://localhost:5173,https://mi-dominio.com
```

Luego en CorsConfig:

```java
@Value("${app.cors.allowed-origins}")
private String allowedOrigins;

@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
            .allowedOrigins(allowedOrigins.split(","))
            // ...
}
```

## 🛡️ Seguridad

⚠️ **Importante para Producción:**

En producción, **NO** uses `*` (todos los orígenes). Siempre especifica los orígenes permitidos:

```java
// ❌ MAL (en producción)
.allowedOrigins("*")

// ✅ BIEN
.allowedOrigins("https://mi-app.com", "https://www.mi-app.com")
```

## 🧪 Probando CORS

### Con curl

```bash
# Solicitud preflight
curl -X OPTIONS http://localhost:8090/api/tenants \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Solicitud real
curl -X GET http://localhost:8090/api/tenants \
  -H "Origin: http://localhost:5173" \
  -v
```

### Con JavaScript (Frontend)

```javascript
fetch('http://localhost:8090/api/tenants', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## 📚 Referencias

- [MDN: CORS](https://developer.mozilla.org/es/docs/Web/HTTP/CORS)
- [Spring Boot: CORS](https://spring.io/guides/gs/rest-service-cors/)
- [Vite: Server Options](https://vitejs.dev/config/server-options.html)

## ✨ Estado

✅ CORS configurado correctamente
✅ Frontend puede consumir API sin errores de CORS
✅ Listo para desarrollo y testing
