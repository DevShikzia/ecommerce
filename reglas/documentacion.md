# Reglas de Documentación

## Contexto de Documentación
Todas las reglas para mantener la documentación del proyecto actualizada, en castellano, accesible para cualquier IA o desarrollador. La documentación se actualiza automáticamente al crear nuevos componentes, endpoints o cambios estructurales.

## Idioma
- Toda documentación (comentarios de código, archivos `.md`, mensajes de commit): Castellano.
- Código fuente (variables, funciones): Inglés, con comentarios en castellano usando JSDoc/TSDoc.

## Reglas Generales
- Cada archivo de reglas (`generales.md`, `backend.md`, `frontend.md`, `admin.md`) debe tener un resumen de contexto al inicio para que cualquier IA que lea solo ese archivo entienda el proyecto.
- Mantener `ARCHITECTURE.md` actualizado con cambios en estructura de carpetas, stack tecnológico o decisiones arquitectónicas.

## Documentación de Backend
- Al crear un nuevo endpoint: Actualizar `docs/api-endpoints.md` en castellano con:
  - Método HTTP, ruta, descripción.
  - Ejemplo de request (headers, body) y response (formato estándar `ApiResponse`).
  - Permisos requeridos.
- Comentarios en funciones/controladores con JSDoc en castellano:
  ```typescript
  /**
   * Obtiene la lista de productos activos
   * @param {Request} req - Petición de Express
   * @param {Response} res - Respuesta de Express
   * @returns {Promise<void>}
   */
  export const getProducts = async (req: Request, res: Response) => { ... };
  ```

## Documentación de Frontend
- Al crear un componente reutilizable: Actualizar `docs/frontend-components.md` con:
  - Nombre del componente, ubicación, props (entradas/salidas).
  - Ejemplo de uso.
- Interfaces de modelos en `shared/models/` con comentarios en castellano:
  ```typescript
  /**
   * Modelo de Producto
   * @property {string} id - ID único del producto
   * @property {string} name - Nombre del producto (inglés en código)
   * @property {number} price - Precio en ARS
   */
  export interface Product {
    id: string;
    name: string;
    price: number;
  }
  ```

## Documentación de Configuración
- Actualizar `docs/configuracion.md` al agregar nuevas opciones en la colección `Configuracion` de MongoDB (ej: nuevos métodos de pago, reglas de envío).

## Ejemplos de Documentación (Correcto / Incorrecto)
### Correcto (Actualización de api-endpoints.md)
```markdown
## GET /api/v1/products
Obtiene la lista de productos activos.

### Request
- Headers: `Authorization: Bearer <access_token>`
- Query params: `?category=tecnologia&page=1`

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "Laptop", "price": 150000 }
  ]
}
```
```

### Incorrecto (Sin documentar endpoint)
```markdown
## Endpoints
- GET /api/v1/products
```
(No incluye ejemplo de request/response, ni permisos requeridos)
```
