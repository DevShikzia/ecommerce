# Reglas de Backend (Node.js + Express + TypeScript + MongoDB)

## Contexto del Backend
API RESTful desarrollada con Node.js, Express, TypeScript y Mongoose para MongoDB Atlas. Gestiona autenticación JWT, búsqueda con Atlas Search, y permisos granulares autogestionados. Todas las respuestas de IA y comentarios están en castellano, código fuente en inglés.

## Idioma
- Código fuente (variables, funciones, clases): Inglés.
- Comentarios de código: Castellano.
- Respuestas de IA: Castellano.

## Convenciones de Código
- No usar `var`, priorizar `const` sobre `let`, usar `async/await` en lugar de callbacks.
- No usar `any` en TypeScript: todo debe estar tipado con interfaces o tipos explícitos (ej: `ProductDocument`, `UserInterface`).
- Nombres de archivos: `kebab-case` (ej: `product.controller.ts`, `auth.service.ts`).
- Variables y funciones: `camelCase`.
- Endpoints: Formato `/api/v1/recursos` (plural, ej: `/api/v1/products`).

## Dependencias
- Librerías aprobadas: `express`, `mongoose`, `jsonwebtoken`, `dotenv`, `cors`, `winston`, `@types/node`, `ts-node`, `typescript`, `bcryptjs`, `cloudinary`, `resend`.
- Para instalar nuevas dependencias: La IA debe recomendar la librería, explicar su uso y pedir confirmación al usuario antes de ejecutar `npm install`.

## Manejo de Errores y Logs
- Centralizar logs con Winston: niveles (error, warn, info, debug), archivos rotativos en `backend/logs/`.
- Envolver todo controlador/servicio en `try/catch`, usar middleware de errores centralizado `error.middleware.ts`.
- Formato de respuesta estándar para el frontend:
  ```typescript
  interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
  }
  ```
- Usar códigos HTTP estándar: 200 (éxito), 400 (error cliente), 401 (no autenticado), 403 (no autorizado), 500 (error servidor).

## JWT y Autenticación
- Access Token: 15 minutos de expiración, contiene `userId` y `role`.
- Refresh Token: 7 días de expiración, almacenado en cookie `httpOnly`.
- Middleware `auth.middleware.ts` verifica el Access Token y adjunta `req.user`.
- Login con Google OAuth 2.0 directo en backend, integra con JWT.

## MongoDB y Modelos
- Modelos en `backend/src/models/` (ej: `Product.ts`, `User.ts`, `Role.ts`, `Permission.ts`).
- Al arrancar el servidor: Escanear todas las rutas registradas y guardar los endpoints en la colección `Permission` de MongoDB automáticamente.
- Colección `Configuracion` para valores modificables por admin (métodos de pago, reglas de envío, nombre del e-commerce).
- Atlas Search habilitado para el modelo `Product` (búsqueda por nombre, descripción, etiquetas, categoría, autocompletado).

## Endpoints y Permisos
- Escaneo automático de rutas al iniciar para generar permisos en DB.
- Middleware `permisos.middleware.ts` verifica si el rol del usuario tiene el permiso para acceder al endpoint.
- Actualizar `docs/api-endpoints.md` en castellano con ejemplo de request/response cada vez que se cree un nuevo endpoint.

## Ejemplos de Código (Correcto / Incorrecto)
### Correcto (Controlador con tipos)
```typescript
// backend/src/controllers/product.controller.ts
import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { ApiResponse } from '../types/api-response';

export const getProducts = async (req: Request, res: Response<ApiResponse<Product[]>>) => {
  try {
    const products = await Product.find({ isActive: true });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener productos' });
  }
};
```

### Incorrecto (Uso de any y callback)
```typescript
// No usar any ni callbacks
export const getProducts = (req: Request, res: Response) => {
  Product.find((err, products) => { // Callback incorrecto
    if (err) return res.status(500).json({ error: err }); // Sin formato estándar
    res.json(products); // Tipo any implícito
  });
};
```

### Correcto (Winston Logger)
```typescript
// backend/src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```
