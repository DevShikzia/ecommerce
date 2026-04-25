# Plan de Arquitectura: E-commerce Full Stack

## 1. Stack Tecnológico
- Backend: Node.js + Express + Mongoose (MongoDB)
- Frontend (Cliente): Angular (Standalone Components)
- Frontend (Admin): Angular (App independiente)
- Base de datos: MongoDB Atlas (Tier M0 gratuito inicial)
- Autenticación: JWT (Access + Refresh Tokens)
- Buscador: MongoDB Atlas Search
- Almacenamiento de imágenes: Cloudinary (Tier gratuito)
- Pasarelas de pago: Mercado Pago, Efectivo, Transferencia (configurables por admin)
- Notificaciones: Resend (Email, 3000/mes gratis) + alternativa manual

## 2. Estructura General de Carpetas
```
e-commerce/
├── backend/                    # API Node.js + Express
├── frontend-cliente/           # App Angular para clientes
├── frontend-admin/             # App Angular independiente para administración
├── reglas/                     # Reglas genéricas para cualquier IA
│   ├── generales.md
│   ├── backend.md
│   ├── frontend.md
│   └── admin.md
├── docs/                       # Documentación adicional
├── .github/                    # GitHub Actions + Copilot
│   ├── copilot-instructions.md
│   └── workflows/
├── ARCHITECTURE.md
└── README.md
```

## 3. Estructura Detallada Backend
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts         # Conexión MongoDB
│   │   └── env.ts              # Validación de variables de entorno
│   ├── controllers/
│   ├── models/
│   │   ├── Product.ts
│   │   ├── User.ts
│   │   ├── Order.ts
│   │   ├── Cart.ts
│   │   ├── ProductType.ts     # Gestiona campos dinámicos por tipo
│   │   ├── Role.ts              # Roles con permisos granulares
│   │   └── Permission.ts          # Endpoints y páginas accesibles
│   ├── routes/
│   ├── middleware/
│   │   ├── auth.middleware.ts  # Verifica JWT
│   │   ├── permisos.middleware.ts # Verifica permisos de rol
│   │   └── error.middleware.ts
│   ├── services/
│   ├── seed/
│   │   └── admin.seed.ts       # Script para crear admin inicial
│   ├── utils/
│   │   ├── jwt.utils.ts
│   │   ├── route-scanner.ts    # Escaneo de rutas
│   │   └── notificaciones.utils.ts
│   └── app.ts
├── tests/
├── .env
├── .env.example
├── package.json
└── server.js
```

## 4. Estructura Detallada Frontend Cliente
```
frontend-cliente/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   ├── guards/
│   │   │   └── interceptors/
│   │   ├── features/
│   │   │   ├── home/
│   │   │   ├── productos/
│   │   │   ├── producto-detalle/
│   │   │   ├── carrito/
│   │   │   ├── checkout/
│   │   │   └── ordenes/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   ├── models/
│   │   │   └── utils/
│   ├── assets/
│   └── environments/
├── package.json
└── angular.json
```

## 5. Estructura Detallada Frontend Admin
```
frontend-admin/
├── src/
│   ├── app/
│   │   ├── core/
│   │   ├── features/
│   │   │   ├── dashboard/
│   │   │   ├── productos/
│   │   │   ├── usuarios/
│   │   │   ├── roles/
│   │   │   ├── ordenes/
│   │   │   ├── pagos/
│   │   │   └── configuracion/
│   └── environments/
├── package.json
└── angular.json
```

## 6. Modelos de Datos (Mongoose)
### Producto
- Campos base: nombre, descripción, precio, stock, categoría, etiquetas[], imágenes[], slug, activo, tipoProducto (ref)
- Campos dinámicos: customFields (objeto según TipoProducto)
- Valoraciones: [{ usuario, puntuación, comentario }]

### Usuario
- Campos: nombre, email (único), password (hasheado), rol (ref), dirección{}, teléfono, avatar, googleId (opcional), verificado, resetToken

### Orden
- Campos: usuario (ref), items[{ producto, cantidad, precio }], direccionEnvio{}, infoPago{}, precioTotal, estado, metodoPago, fecha

### Carrito
- Campos: usuario (ref, único), items[{ producto, cantidad, precio }], precioTotal

### TipoProducto
- Campos: nombre, campos[{ nombre, tipo, obligatorio, unidad }] (ej: duración para servicios, peso para físicos)

### Rol
- Campos: nombre, permisos[] (ref a Permiso), descripción

### Permiso
- Campos: recurso (endpoint/página), acción (GET/POST/ver), descripción, autogenerado (true/false)

## 7. Estrategia JWT
- Access Token: 15 min expiración, contiene userId + rol
- Refresh Token: 7 días, almacenado en cookie httpOnly
- Flujo: Login → validar credenciales → devolver tokens → cliente envía Access Token en header `Authorization: Bearer <token>`
- El backend escanea todas las rutas al arrancar y guarda endpoints en la colección Permiso automáticamente
- El frontend admin escanea rutas al compilar y guarda páginas accesibles en la DB

## 8. Reglas para IAs
- Todas las reglas se guardan en la carpeta raíz `reglas/`, legibles por cualquier IA (Cursor, opencode, antigravity, Copilot)
- `reglas/generales.md`: Convenciones del proyecto, stack, idioma (español), estructura general
- `reglas/backend.md`: Patrones Node.js, Express, Mongoose, JWT, MongoDB Atlas Search
- `reglas/frontend.md`: Patrones Angular, Standalone Components, Services, Signals
- `reglas/admin.md`: Reglas para el panel de administración, gestión de roles y permisos

## 9. Orden de Desarrollo
1. Sistema de roles y permisos granulares autogestionado (backend + modelos Rol/Permiso)
2. MVP Inicial:
   - Registro/Login (normal + Google OAuth 2.0)
   - Catálogo de productos con buscador Atlas Search
   - Carrito persistente en DB
   - Checkout con Mercado Pago + opciones de pago configurables
   - Panel admin básico
3. Funciones avanzadas:
   - Envíos con integración OCA/Andreani/Correo Argentino
   - Notificaciones WhatsApp
   - AFIP (facturación electrónica)

## 10. Despliegue (Económico)
- Frontend Cliente + Admin: Vercel (Tier gratuito)
- Backend: Render (Tier gratuito) o Railway (Crédito inicial $5)
- Base de datos: MongoDB Atlas (Tier M0 gratuito, 512MB)
- Imágenes: Cloudinary (Tier gratuito, 10GB)

## 11. Pruebas
- Backend: Jest + Supertest (unitarias e integración)
- Frontend: Jasmine + Karma (Angular nativo)
- E2E: Playwright (flujos completos)
