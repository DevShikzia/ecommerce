# API Endpoints - E-commerce Backend

Ruta base: `/api/v1`

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