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

### POST /api/v1/products/:id/ratings
Agrega o actualiza una valoración a un producto. Solo usuarios que han comprado el producto pueden valorarlo.

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
  "data": { ...producto con rating },
  "message": "Rating agregado correctamente"
}
```

**Errores**:
- `400`: Rating requerido (1-5)
- `403`: Solo usuarios que compraron el producto pueden valorarlo
- `404`: Producto no encontrado

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

### Configuración de Autocompletado (Opcional)

Para habilitar autocompletado en el campo `name`, agregar un sub-campo:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": [
        {
          "type": "string",
          "analyzer": "standard",
          "searchAnalyzer": "standard"
        },
        {
          "type": "autocomplete",
          "analyzer": "autocomplete",
          "searchAnalyzer": "autocomplete"
        }
      ],
      "description": { "type": "string" },
      "tags": { "type": "string" },
      "category": { "type": "string", "analyzer": "keyword" },
      "price": { "type": "number" }
    }
  }
}
```

### Uso de Atlas Search en el Código

El servicio de productos usa búsqueda de texto nativo de MongoDB cuando Atlas Search no está configurado:

```typescript
// Búsqueda con Atlas Search (cuando está disponible)
const products = await Product.aggregate([
  {
    $search: {
      index: 'default',
      text: {
        query: searchTerm,
        path: ['name', 'description', 'tags']
      }
    }
  }
]);
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

---

## Endpoints de Carrito

Gestión del carrito de compras. Requiere autenticación JWT.

### GET /api/v1/cart
Obtiene el carrito del usuario autenticado.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user": "507f1f77bcf86cd799439010",
    "items": [
      {
        "product": "507f1f77bcf86cd799439012",
        "productName": "Laptop Pro",
        "quantity": 2,
        "price": 150000
      }
    ],
    "totalPrice": 300000,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/v1/cart/add
Agrega un producto al carrito.

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Body**:
```json
{
  "productId": "507f1f77bcf86cd799439012",
  "quantity": 1
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": { ...carrito actualizado },
  "message": "Producto agregado al carrito"
}
```

**Errores**:
- `400`: ID del producto requerido
- `400`: Producto no encontrado
- `400`: Producto no disponible
- `400`: Stock insuficiente

### PUT /api/v1/cart/item
Actualiza la cantidad de un producto en el carrito.

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Body**:
```json
{
  "productId": "507f1f77bcf86cd799439012",
  "quantity": 3
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": { ...carrito actualizado },
  "message": "Carrito actualizado"
}
```

### DELETE /api/v1/cart/item/:productId
Elimina un producto del carrito.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200 OK)**
```json
{
  "success": true,
  "data": { ...carrito actualizado },
  "message": "Producto eliminado del carrito"
}
```

### DELETE /api/v1/cart/clear
Vacía el carrito del usuario.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Carrito vaciado"
}
```

### POST /api/v1/cart/migrate
Migra el carrito de localStorage al carrito del usuario logueado.

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Body**:
```json
{
  "localCartItems": [
    { "productId": "507f1f77bcf86cd799439012", "quantity": 1 },
    { "productId": "507f1f77bcf86cd799439013", "quantity": 2 }
  ]
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": { ...carrito migrated },
  "message": "Carrito migrado correctamente"
}
```

---

## Endpoints de Órdenes

Gestión de órdenes y checkout. Requiere autenticación JWT.

### GET /api/v1/orders
Obtiene las órdenes del usuario autenticado.

**Headers**: `Authorization: Bearer <access_token>`

**Query Params**:
| Parámetro |Tipo|Descripción|Default|
|---------|---|-----------|-------|
| page |number|Número de página|1|
| limit |number|Cantidad por página|20|

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user": "507f1f77bcf86cd799439010",
      "items": [...],
      "shippingAddress": {
        "street": "Av. Libertador",
        "number": "1000",
        "city": "Buenos Aires",
        "province": "CABA",
        "postalCode": "1001"
      },
      "paymentInfo": {
        "method": "mercadopago",
        "status": "approved"
      },
      "totalPrice": 30500,
      "status": "processing",
      "paymentMethod": "MercadoPago",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### GET /api/v1/orders/:id
Obtiene una orden por su ID.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200 OK)**
```json
{
  "success": true,
  "data": { ...orden completa }
}
```

### POST /api/v1/orders
Crea una nueva orden (checkout).

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Body**:
```json
{
  "shippingAddress": {
    "street": "Av. Libertador",
    "number": "1000",
    "floor": "5",
    "apartment": "A",
    "city": "Buenos Aires",
    "province": "CABA",
    "postalCode": "1001"
  },
  "paymentMethod": "mercadopago",
  "paymentMethodType": "mercadopago"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": { ...orden creada },
  "message": "Orden creada correctamente"
}
```

### POST /api/v1/orders/preference
Crea una preferencia de pago de MercadoPago para una orden.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "preferenceId": "1234567890",
    "initPoint": "https://www.mercadopago.com.ar/checkout/preference?pref..."
  }
}
```

### GET /api/v1/orders/payment-methods
Obtiene los métodos de pago configurados por el admin.

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "paymentMethods": [
      { "id": "mercadopago", "name": "MercadoPago", "type": "mercadopago", "enabled": true },
      { "id": "cash", "name": "Efectivo", "type": "cash", "enabled": true, "instructions": "Pago contra entrega" },
      { "id": "transfer", "name": "Transferencia", "type": "transfer", "enabled": true, "instructions": "CBU: 1234567890123456789012" }
    ],
    "shippingConfig": {
      "freeShippingMinAmount": 15000,
      "fixedShippingCost": 500,
      "enabled": true
    }
  }
}
```

### GET /api/v1/orders/admin
Obtiene todas las órdenes (solo admin).

**Headers**: `Authorization: Bearer <access_token>`

**Permisos requeridos**: `orders` - acción `GET`

**Query Params**:
| Parámetro |Tipo|Descripción|
|---------|---|-------------|
| page |number|Número de página|
| limit |number|Cantidad por página|
| status |string|Filtrar por estado|

**Response (200 OK)**
```json
{
  "success": true,
  "data": [...órdenes],
  "pagination": { ... }
}
```

### PUT /api/v1/orders/:id/status
Actualiza el estado de una orden (solo admin).

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Permisos requeridos**: `orders` - acción `PUT`

**Body**:
```json
{
  "status": "shipped"
}
```

**Estados válidos**: `pending`, `processing`, `shipped`, `delivered`, `cancelled`

**Response (200 OK)**
```json
{
  "success": true,
  "data": { ...orden actualizada },
  "message": "Estado de la orden actualizado"
}
```

### POST /api/v1/orders/webhook
Endpoint para recibir notificaciones de MercadoPago cuando se confirma un pago.

**Nota**: Este endpoint NO requiere autenticación JWT. MercadoPago lo llama directamente.

**Query Params**:
| Parámetro |Tipo|Descripción|
|---------|---|-------------|
| topic |string|Tipo de notificación (ej: "payment")|
| id |string|ID del recurso notificado|

**MercadoPago envía**:
```
POST /api/v1/orders/webhook?topic=payment&id=1234567890
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Webhook procesado"
}
```

**Flujo del webhook**:
1. Usuario completa pago en MercadoPago
2. MercadoPago llama a este endpoint con `topic=payment` e `id` del pago
3. Backend obtiene datos del pago
4. Backend actualiza el estado de la orden según el resultado del pago
5. Backend envía email de notificación al cliente

**Configuración en MercadoPago**:
En el dashboard de MercadoPago, configurar la URL de webhook:
```
https://tu-backend.com/api/v1/orders/webhook
```

---

## Endpoints de Configuración

Gestión de configuración del e-commerce. GET /api/v1/config es público, GET /api/v1/config/full y PUT /api/v1/config requieren autenticación JWT y permisos de admin.

### GET /api/v1/config
Obtiene la configuración pública del e-commerce (sin datos sensibles).

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "nombreEcommerce": "Mi Tienda",
    "logo": "https://res.cloudinary.com/.../logo.png",
    "colores": {
      "primary": "#000000",
      "secondary": "#666666",
      "background": "#FFFFFF",
      "text": "#333333"
    },
    "moneda": "ARS"
  }
}
```

### GET /api/v1/config/full
Obtiene la configuración completa del e-commerce (solo admin).

**Headers**: `Authorization: Bearer <access_token>`

**Permisos requeridos**: `config` - acción `GET`

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "nombreEcommerce": "Mi Tienda",
    "logo": "https://res.cloudinary.com/.../logo.png",
    "colores": {
      "primary": "#000000",
      "secondary": "#666666",
      "background": "#FFFFFF",
      "text": "#333333"
    },
    "metodosPago": [
      { "nombre": "MercadoPago", "habilitado": true, "config": {} },
      { "nombre": "Efectivo", "habilitado": true, "config": { "instrucciones": "Pago contra entrega" } }
    ],
    "reglasEnvio": {
      "montoMinimoGratis": 15000,
      "costoFijo": 500,
      "habilitado": true
    },
    "moneda": "ARS",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errores**:
- `401`: No autenticado
- `403`: Sin permisos

### PUT /api/v1/config
Actualiza la configuración del e-commerce (solo admin).

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Permisos requeridos**: `config` - acción `PUT`

**Body**:
```json
{
  "nombreEcommerce": "Mi Tienda Actualizada",
  "logo": "data:image/png;base64,...",
  "colores": {
    "primary": "#1a73e8",
    "secondary": "#fbbc04",
    "background": "#FFFFFF",
    "text": "#333333"
  },
  "metodosPago": [
    { "nombre": "MercadoPago", "habilitado": true, "config": {} },
    { "nombre": "Efectivo", "habilitado": true, "config": { "instrucciones": "Pago contra entrega" } },
    { "nombre": "Transferencia", "habilitado": false, "config": { "cbu": "1234567890123456789012" } }
  ],
  "reglasEnvio": {
    "montoMinimoGratis": 20000,
    "costoFijo": 600,
    "habilitado": true
  },
  "moneda": "ARS"
}
```

**Notas**:
- Si `logo` comienza con `data:`, se sube a Cloudinary automáticamente
- El logo anterior se reemplaza si existe

**Response (200 OK)**
```json
{
  "success": true,
  "data": { ...configuración actualizada },
  "message": "Configuración actualizada correctamente"
}
```

**Errores**:
- `400`: Error al subir logo a Cloudinary
- `401`: No autenticado
- `403`: Sin permisos

---

## MercadoPago - Configuración

### Requisitos Previos

1. **Cuenta de MercadoPago**: Crear cuenta en https://www.mercadopago.com.ar
2. **Credenciales**: Obtener el Access Token desde el dashboard

### Paso 1: Obtener Access Token

1. Iniciar sesión en MercadoPago
2. Ir a **Configuración** > **Credenciales** (o **Integraciones**)
3. Copiar el **Access Token** (para producción) o el de **prueba** (para tests)

### Paso 2: Configurar Variable de Entorno

Agregar al archivo `.env` del backend:

```env
# MercadoPago
# Token de producción
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxxxxxxxxxxxxxx

# O para pruebas/sandbox:
# MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxxxxxxxxxxxxxx
```

### Paso 3: Configurar Métodos de Pago (Admin)

Llamar al endpoint de configuración con un token de admin:

```bash
curl -X PUT http://localhost:3000/api/v1/config \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "storeName": "Mi Tienda",
    "storeEmail": "tienda@email.com",
    "storePhone": "+5491112345678",
    "paymentMethods": [
      {
        "id": "mercadopago",
        "name": "MercadoPago",
        "type": "mercadopago",
        "enabled": true
      },
      {
        "id": "cash",
        "name": "Efectivo",
        "type": "cash",
        "enabled": true,
        "instructions": "Pago contra entrega al recibir el pedido"
      },
      {
        "id": "transfer",
        "name": "Transferencia Bancaria",
        "type": "transfer",
        "enabled": true,
        "instructions": "CBU: 0000000000000000000000 - Alias: mitienda.oficial"
      }
    ],
    "shippingConfig": {
      "freeShippingMinAmount": 15000,
      "fixedShippingCost": 500,
      "enabled": true
    }
  }'
```

### Flujo de Pago con MercadoPago

1. **Usuario agrega productos al carrito**
2. **Usuario inicia checkout**: `POST /api/v1/orders`
3. **Backend crea la orden** y reduce stock
4. **Frontend obtiene preferencia**: `POST /api/v1/orders/preference/:orderId`
5. **Frontend redirige** al usuario a `initPoint` de MercadoPago
6. **Usuario completa pago** en la página de MercadoPago
7. **MercadoPago redirecciona**a `/checkout/success?orderId=...`

### Webhook (Automático)

El webhook está configurado para recibir notificaciones automáticas de MercadoPago cuando el estado del pago cambia:

1. **Configurar en MercadoPago**: Ir a Webhooks en el dashboard y configurar:
   ```
   https://tu-backend.com/api/v1/orders/webhook
   ```
2. **Topic**: Seleccionar `Pagos` (payments)
3. **El backend procesa automáticamente**:
   - Recibe la notificación
   - Obtiene datos del pago via API
   - Actualiza el estado de la orden
   - Envía email de notificación al cliente

**Notificaciones por email**:
Cuando el estado de una orden cambia (vía webhook o actualización manual), el sistema envía un email al cliente con:
- Número de pedido
- Nuevo estado
- Detalle de items
- Total

### Estados de Orden

| Estado | Descripción |
|--------|-------------|
| `pending` | Orden creada, esperando pago |
| `processing` | Pago aprobado, preparando envío |
| `shipped` | Pedido enviado |
| `delivered` | Pedido entregado |
| `canceled` | Orden cancelada |

### Errores Comunes

| Error | Causa | Solución |
|-------|------|---------|
| `MERCADO_PAGO_ACCESS_TOKEN no configurado` | Falta variable.env | Agregar el token al `.env` |
| `401 Unauthorized` | Token inválido | Verificar el Access Token |
| `pending` | Pago en proceso | El usuario debe completar el pago |

---

## Endpoints de Perfil de Usuario

Gestión del perfil del usuario autenticado. Requiere autenticación JWT.

### GET /api/v1/users/profile
Obtiene el perfil del usuario autenticado.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "user",
    "address": {
      "street": "Av. Libertador",
      "number": "1000",
      "city": "Buenos Aires",
      "province": "CABA",
      "postalCode": "1001"
    },
    "phone": "+5491112345678",
    "avatar": "https://...",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errores**:
- `401`: No autenticado
- `404`: Usuario no encontrado

---

### PUT /api/v1/users/profile
Actualiza el perfil del usuario autenticado.

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Body**:
```json
{
  "name": "Juan Pérez Actualizado",
  "address": {
    "street": "Av. Santa Fe",
    "number": "500",
    "city": "Buenos Aires",
    "province": "CABA",
    "postalCode": "2000"
  },
  "phone": "+5491198765432",
  "avatar": "https://..." // O base64 data:image/png;base64,...
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Juan Pérez Actualizado",
    "email": "juan@example.com",
    "role": "user",
    "address": {...},
    "phone": "+5491198765432",
    "avatar": "https://...",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Perfil actualizado correctamente"
}
```

**Notas**:
- Si `avatar` comienza con `data:`, se sube a Cloudinary automáticamente
- El avatar anterior se elimina de Cloudinary si existe

**Errores**:
- `400`: Error al subir imagen a Cloudinary

---

### POST /api/v1/users/change-password
Cambia la contraseña del usuario autenticado.

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Body**:
```json
{
  "currentPassword": "PasswordActual123",
  "newPassword": "NuevaPassword456"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": true,
  "message": "Contraseña cambiada correctamente"
}
```

**Errores**:
- `400`: Contraseña actual y nueva contraseña son requeridas
- `400`: La nueva contraseña debe tener al menos 6 caracteres
- `400`: La contraseña actual es incorrecta

---

## Endpoints de Administración de Usuarios

Gestión de usuarios del sistema por administradores. Requiere autenticación JWT y permisos.

### GET /api/v1/admin/users
Obtiene la lista de usuarios con paginación y filtros.

**Headers**: `Authorization: Bearer <access_token>`

**Permisos requeridos**: `admin/users` - acción `GET`

**Query Params**:
| Parámetro |Tipo|Descripción|Default|
|---------|---|-----------|-------|
| page |number|Número de página|1|
| limit |number|Cantidad por página|20|
| role |string|Filtrar por nombre de rol|-|
| isActive |boolean|Filtrar por estado activo|true|
| search |string|Buscar por nombre o email|-|

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "role": "user",
        "isVerified": true,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

---

### GET /api/v1/admin/users/roles
Obtiene todos los roles disponibles del sistema.

**Headers**: `Authorization: Bearer <access_token>`

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    { "id": "507f1f77bcf86cd799439012", "name": "admin" },
    { "id": "507f1f77bcf86cd799439013", "name": "user" },
    { "id": "507f1f77bcf86cd799439014", "name": "editor" }
  ]
}
```

---

### GET /api/v1/admin/users/:id
Obtiene un usuario por su ID.

**Headers**: `Authorization: Bearer <access_token>`

**Permisos requeridos**: `admin/users` - acción `GET`

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "admin",
    "isVerified": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errores**:
- `404`: Usuario no encontrado

---

### PUT /api/v1/admin/users/:id
Actualiza un usuario existente.

**Headers**: `Authorization: Bearer <access_token>`
**Content-Type**: `application/json`

**Permisos requeridos**: `admin/users` - acción `PUT`

**Body**:
```json
{
  "name": "Usuario Actualizado",
  "email": "nuevo@email.com",
  "phone": "+5491112345678",
  "role": "editor",
  "isVerified": true
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Usuario Actualizado",
    "email": "nuevo@email.com",
    "role": "editor",
    "isVerified": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Usuario actualizado correctamente"
}
```

**Errores**:
- `400`: El correo electrónico ya está en uso
- `400`: Rol no encontrado
- `404`: Usuario no encontrado

---

### PATCH /api/v1/admin/users/:id/status
Activa o desactiva un usuario.

**Headers**: `Authorization: Bearer <access_token>`

**Permisos requeridos**: `admin/users` - acción `PATCH`

**Response (200 OK)**
```json
{
  "success": true,
  "data": false,
  "message": "Usuario desactivado"
}
```

**Errores**:
- `404`: Usuario no encontrado

---

### DELETE /api/v1/admin/users/:id
Elimina un usuario (soft delete, lo marca como inactivo).

**Headers**: `Authorization: Bearer <access_token>`

**Permisos requeridos**: `admin/users` - acción `DELETE`

**Response (200 OK)**
```json
{
  "success": true,
  "data": true,
  "message": "Usuario eliminado correctamente"
}
```

**Errores**:
- `404`: Usuario no encontrado