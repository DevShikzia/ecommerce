# API Endpoints - E-commerce Backend

Ruta base: `/api/v1`

## Autenticación

Todos los endpoints de autenticación son públicos (no requieren autenticación JWT), excepto `/api/v1/auth/me`.

### POST /api/v1/auth/register
Registra un nuevo usuario en el sistema.

**Content-Type**: `application/json`

**Body**:
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "TuPassword123"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "isVerified": false
    }
  },
  "message": "Usuario registrado correctamente"
}
```

**Errores**:
- `400`: Datos inválidos o incompletos
- `400`: El correo electrónico ya está registrado

---

### POST /api/v1/auth/login
Inicia sesión con email y contraseña.

**Content-Type**: `application/json`

**Body**:
```json
{
  "email": "juan@example.com",
  "password": "TuPassword123"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "isVerified": true,
      "role": { "_id": "...", "name": "user" }
    }
  },
  "message": "Login exitoso"
}
```

El Refresh Token se establece automáticamente en una cookie `httpOnly`.

**Errores**:
- `400`: Email o contraseña requeridos
- `401`: Credenciales inválidas

---

### POST /api/v1/auth/google
Inicia sesión con Google OAuth 2.0.

**Content-Type**: `application/json`

**Body**:
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

El `credential` es el ID Token de Google obtenido del botón "Sign in with Google".

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "isVerified": true,
      "avatar": "https://...",
      "role": { "_id": "...", "name": "user" }
    }
  },
  "message": "Login con Google exitoso"
}
```

**Errores**:
- `400`: Token de Google requerido o inválido
- `401`: Error con login de Google

---

### POST /api/v1/auth/verify-email
Verifica el correo electrónico del usuario.

**Content-Type**: `application/json`

**Body**:
```json
{
  "token": "abc123def456"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Email verificado correctamente"
}
```

**Errores**:
- `400`: Token de verificación requerido o inválido/expirado

---

### POST /api/v1/auth/forgot-password
Envia un email para recuperar la contraseña.

**Content-Type**: `application/json`

**Body**:
```json
{
  "email": "juan@example.com"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Si el email existe, se enviará un enlace de recuperación"
}
```

**Notas**: Por seguridad, siempre retorna 200 aunque el email no exista.

---

### POST /api/v1/auth/reset-password
Restablece la contraseña del usuario.

**Content-Type**: `application/json`

**Body**:
```json
{
  "token": "abc123def456",
  "password": "NuevaPassword123"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Contraseña actualizada correctamente"
}
```

**Errores**:
- `400`: Token o contraseña requeridos
- `400`: La contraseña debe tener al menos 6 caracteres
- `400`: Token de recuperación inválido o expirado

---

### POST /api/v1/auth/refresh-token
Refresca el Access Token usando el Refresh Token de la cookie.

**Headers**: No requiere Authorization header (usa la cookie)

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token refrescado correctamente"
}
```

**Errores**:
- `401`: Refresh token no encontrado o inválido

---

### POST /api/v1/auth/logout
Cierra la sesión del usuario.

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

---

### GET /api/v1/auth/me
Obtiene el usuario actualmente autenticado.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "juan@example.com",
    "role": "user",
    "name": "Juan Pérez"
  }
}
```

**Errores**:
- `401`: No autenticado

---

## Formato de Respuesta Estándar

Todas las respuestas siguen el formato `ApiResponse<T>`:

```json
{
  "success": true,
  "data": {},
  "message": "Operación exitosa"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| success | boolean | Indica si la operación fue exitosa |
| data | T | Datos de respuesta (opcional) |
| message | string | Mensaje descriptivo (opcional) |
| errors | array | Errores de validación (opcional) |

## Endpoints Iniciales

### GET /api/v1/health
Verifica que la API esté funcionando.

**Response (200 OK)**
```json
{
  "success": true,
  "message": "API funcionando correctamente"
}
```

## Endpoints de Roles

Gestión de roles del sistema. Requiere autenticación JWT y permisos.

### GET /api/v1/roles
Obtiene todos los roles del sistema.

**Headers**: `Authorization: Bearer <access_token>`

**Permisos requeridos**: `roles` - acción `get`

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "admin",
      "description": "Rol de administrador",
      "permissions": [
        { "_id": "...", "resource": "/api/v1/roles", "action": "GET", "isAutoGenerated": false }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/v1/roles/:id
Obtiene un rol por su ID.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "admin",
    "description": "Rol de administrador",
    "permissions": [...]
  }
}
```

### POST /api/v1/roles
Crea un nuevo rol.

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Body**:
```json
{
  "name": "editor",
  "description": "Rol de editor",
  "permissions": ["507f1f77bcf86cd799439012"]
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "editor",
    "description": "Rol de editor",
    "permissions": [...]
  },
  "message": "Rol creado correctamente"
}
```

### PUT /api/v1/roles/:id
Actualiza un rol existente.

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Body**:
```json
{
  "name": "editor",
  "description": "Rol de editor de contenido"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": { ... },
  "message": "Rol actualizado correctamente"
}
```

### DELETE /api/v1/roles/:id
Elimina un rol.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Rol eliminado correctamente"
}
```

### POST /api/v1/roles/:id/permissions
Agrega permisos a un rol.

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Body**:
```json
{
  "permissionIds": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": { ...permissions actualizadas... },
  "message": "Permisos agregados correctamente"
}
```

### DELETE /api/v1/roles/:id/permissions
Elimina permisos de un rol.

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Body**:
```json
{
  "permissionIds": ["507f1f77bcf86cd799439012"]
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Permisos eliminados correctamente"
}
```

## Endpoints de Permisos

Gestión de permisos del sistema. Requiere autenticación JWT y permisos.

### GET /api/v1/permissions
Obtiene todos los permisos del sistema.

**Headers**: `Authorization: Bearer <access_token>`

**Permisos requeridos**: `permissions` - acción `get`

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "resource": "/api/v1/products",
      "action": "GET",
      "description": "Permiso para ver productos",
      "isAutoGenerated": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/v1/permissions/auto-generated
Obtiene solo los permisos autogenerados por el sistema.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200 OK)**
```json
{
  "success": true,
  "data": [...]
}
```

### GET /api/v1/permissions/:id
Obtiene un permiso por su ID.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200 OK)**
```json
{
  "success": true,
  "data": { ... }
}
```

### POST /api/v1/permissions
Crea un nuevo permiso manualmente.

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Body**:
```json
{
  "resource": "/api/v1/users",
  "action": "POST",
  "description": "Permiso para crear usuarios"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": { ... },
  "message": "Permiso creado correctamente"
}
```

### PUT /api/v1/permissions/:id
Actualiza un permiso existente.

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Body**:
```json
{
  "description": "Permiso para ver y crear productos"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": { ... },
  "message": "Permiso actualizado correctamente"
}
```

### DELETE /api/v1/permissions/:id
Elimina un permiso.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Permiso eliminado correctamente"
}
```

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

## Crear Primer Usuario Administrator

Para crear el primer usuario administrador del sistema, ejecutar el script de seed:

```bash
cd backend
npm run create-admin
```

**Variables requeridas**:
```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=TuPasswordSeguro123 ADMIN_NAME=Administrador npm run create-admin
```

**O** configurar en `.env`:
```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=TuPasswordSeguro123
ADMIN_NAME=Administrator
```

**Luego ejecutar**:
```bash
npm run create-admin
```

**Output esperado**:
```
Conectado a MongoDB
Rol "admin" creado con todos los permisos
Usuario admin creado: admin@example.com con rol "admin"
IMPORTANT: Guarde estas credenciales de forma segura
```

**Notas de seguridad**:
- La contraseña se hashea con bcrypt (12 rondas)
- El script verifica si el admin ya existe (idempotente)
- Luego de crear, eliminar las variables ADMIN del `.env` o comentarlas

---

## Endpoints de Productos

Gestión del catálogo de productos. Algunos endpoints requieren autenticación JWT y permisos.

### GET /api/v1/products
Obtiene la lista de productos activos paginados.

**Headers**: No requiere autenticación

**Query Params**:
| Parámetro |Tipo|Descripción|Default|
|-----------|---|------------|-------|
| page |number|Número de página|1|
| limit |number|Cantidad por página|20|
| category |string|Filtrar por categoría|-|
| sort |string|Ordenar por campo|-createdAt|

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Laptop Pro",
        "description": "Laptop profesional de alta gama",
        "price": 150000,
        "stock": 10,
        "category": "tecnologia",
        "tags": ["laptop", "computadora", "apple"],
        "images": ["https://..."],
        "slug": "laptop-pro",
        "isActive": true,
        "ratings": [],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### GET /api/v1/products/search
Búsqueda de productos con filtros.

**Headers**: No requiere autenticación

**Query Params**:
| Parámetro |Tipo|Descripción|
|-----------|---|-------------|
| q |string|Consulta de búsqueda texto|
| category |string|Filtrar por categoría|
| tags |string|Etiquetas separadas por coma|
| minPrice |number|precio mínimo|
| maxPrice |number|precio máximo|
| page |number|Número de página|1|
| limit |number|Cantidad por página|20|

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Laptop Pro",
      "price": 150000,
      "category": "tecnologia",
      "slug": "laptop-pro"
    }
  ]
}
```

### GET /api/v1/products/autocomplete
Sugerencias de autocompletado para búsqueda.

**Headers**: No requiere autenticación

**Query Params**:
| Parámetro |Tipo|Descripción|
|-----------|---|-------------|
| q |string|Consulta (mínimo 2 caracteres)|

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    { "id": "507f1f77bcf86cd799439011", "name": "Laptop Pro", "slug": "laptop-pro", "category": "tecnologia" }
  ]
}
```

### GET /api/v1/products/categories
Obtiene todas las categorías disponibles.

**Response (200 OK)**
```json
{
  "success": true,
  "data": ["tecnologia", "ropa", "hogar", "deportes"]
}
```

### GET /api/v1/products/tags
Obtiene todas las etiquetas disponibles.

**Response (200 OK)**
```json
{
  "success": true,
  "data": ["laptop", "smartphone", "ropa-deportiva"]
}
```

### GET /api/v1/products/facets
Obtiene facetas para filtros laterales.

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "categories": [
      { "name": "tecnologia", "count": 50 },
      { "name": "ropa", "count": 30 }
    ],
    "tags": [
      { "name": "laptop", "count": 20 },
      { "name": "smartphone", "count": 15 }
    ],
    "priceRange": { "min": 1000, "max": 500000 }
  }
}
```

### GET /api/v1/products/:id
Obtiene un producto por su ID.

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Laptop Pro",
    "description": "Laptop profesional",
    "price": 150000,
    "stock": 10,
    "category": "tecnologia",
    "tags": ["laptop"],
    "images": ["https://..."],
    "slug": "laptop-pro",
    "isActive": true,
    "ratings": [
      { "user": { "name": "Usuario", "avatar": "https://..." }, "rating": 5, "comment": "Excelente", "createdAt": "2024-01-01" }
    ]
  }
}
```

**Errores**: `404`: Producto no encontrado

### POST /api/v1/products
Crea un nuevo producto.

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Permisos requeridos**: `products` - acción `POST`

**Body**:
```json
{
  "name": "Nuevo Producto",
  "description": "Descripción del producto",
  "price": 10000,
  "stock": 50,
  "category": "categoria",
  "tags": ["etiqueta1", "etiqueta2"],
  "images": ["https://..."],
  "slug": "nuevo-producto",
  "productType": "507f1f77bcf86cd799439010",
  "customFields": {}
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": { ...producto creado },
  "message": "Producto creado correctamente"
}
```

**Errores**: `400`: Datos inválidos o incompletos, `400`: El slug ya está en uso

### PUT /api/v1/products/:id
Actualiza un producto existente.

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Permisos requeridos**: `products` - acción `PUT`

**Body**:
```json
{
  "name": "Producto Actualizado",
  "price": 12000,
  "stock": 100
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": { ...producto actualizado },
  "message": "Producto actualizado correctamente"
}
```

### DELETE /api/v1/products/:id
Elimina un producto (soft delete).

**Headers**: `Authorization: Bearer <access_token>`

**Permisos requeridos**: `products` - acción `DELETE`

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Producto eliminado correctamente"
}
```

### POST /api/v1/products/:id/images
Agrega una imagen a un producto.

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Permisos requeridos**: `products` - acción `POST`

**Body**:
```json
{
  "imageUrl": "https://res.cloudinary.com/.../image.jpg"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": { ...producto con nueva imagen },
  "message": "Imagen agregada correctamente"
}
```

### POST /api/v1/products/:id/rate
Agrega una valoración a un producto.

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Body**:
```json
{
  "rating": 5,
  "comment": "Excelente producto, muy recomendado"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": { ...producto con nuevo rating },
  "message": "Rating agregado correctamente"
}
```

**Errores**: `400`: Rating requerido (1-5)

---

## Atlas Search - MongoDB

Para utilizar la búsqueda avanzada con Atlas Search, crear el índice en MongoDB Atlas:

1. Ir a Atlas Search en el cluster
2. Crear índice para la colección `products`
3. Usar el siguiente código JSON:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": {
        "type": "string",
        "analyzer": "standard",
        "searchAnalyzer": "standard"
      },
      "description": {
        "type": "string",
        "analyzer": "standard"
      },
      "tags": {
        "type": "string",
        "analyzer": "standard"
      },
      "category": {
        "type": "string",
        "analyzer": "keyword"
      },
      "price": {
        "type": "number"
      }
    }
  }
}
```

---

## Cloudinary - Subida de Imágenes

Para subir imágenes de productos a Cloudinary:

1. Configurar credenciales en `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

2. Usar el método `uploadImageToCloudinary` del servicio:
```typescript
import { uploadImageToCloudinary } from '../services/product.service';

const result = await uploadImageToCloudinary('/path/to/image.jpg');
// result: { url: 'https://...', publicId: 'ecommerce/products/...' }
```

3. La imagen se redimensiona automáticamente a 1200x1200 con optimización de calidad.