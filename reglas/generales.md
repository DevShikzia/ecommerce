# Reglas Generales del Proyecto

## Contexto del Proyecto
Este es un e-commerce Full Stack desarrollado con Node.js (Express) + Angular + MongoDB, orientado al mercado argentino. Usa moneda ARS, no requiere multiidioma, y todas las respuestas de IA, comentarios de código y commits deben estar en castellano.

## Idioma
- Código fuente (variables, funciones, nombres de archivos, clases): Inglés.
- Comentarios de código: Castellano.
- Respuestas de herramientas de IA: Castellano.
- Mensajes de commits: Castellano (formato convencional: `feat:`, `fix:`, `docs:`, etc).

## Convenciones de Nombrado
- Variables y funciones en JS/TS: `camelCase`.
- Nombres de archivos: `kebab-case` (ej: `auth.service.ts`, `product.controller.js`).
- Componentes Angular: `PascalCase` (ej: `ProductCardComponent`).
- Endpoints API: Plural, formato `/api/v1/recurso` (ej: `/api/v1/products`).

## Reglas de Código Generales
- Backend: No usar `var`, priorizar `const` sobre `let`, usar `async/await` en lugar de callbacks.
- Frontend/Backend: No usar `any` en TypeScript, todo debe estar tipado con interfaces o tipos explícitos.
- Priorizar reutilización: Antes de crear un nuevo componente o función, verificar si existe uno reutilizable en `shared/` o `utils/`.

## Configuración Global
- Toda configuración modificable por el administrador (nombre del e-commerce, logo, colores, métodos de pago, reglas de envío) se almacena en la colección `Configuracion` de MongoDB, no hardcodeada en el código.
- Los frontends (cliente y admin) deben leer esta configuración al iniciar para aplicar temas y reglas dinámicas.

## Documentación
- Toda regla de documentación se detalla en `reglas/documentacion.md`.
- Mantener `ARCHITECTURE.md` actualizado con cambios de estructura o decisiones técnicas.

## Ejemplos de Código (Correcto / Incorrecto)
### Correcto (Nombrado)
```typescript
// Producto interface en frontend/src/app/shared/models/product.model.ts
export interface Product {
  id: string;
  name: string; // En código fuente: inglés
  price: number;
}
```

### Incorrecto (Nombrado)
```typescript
// No usar español en nombres de variables
export interface Producto {
  id: string;
  nombre: string; // Incorrecto
}
```

### Correcto (Backend async/await)
```javascript
// backend/src/controllers/product.controller.js
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Incorrecto (Backend callback)
```javascript
// No usar callbacks
Product.find((err, products) => {
  if (err) return res.status(500).json({ error: err });
  res.json(products);
});
```
