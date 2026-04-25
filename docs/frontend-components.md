# Frontend Admin - Componentes

## Módulo Dashboard

### DashboardComponent
**Ubicación:** `frontend-admin/src/app/features/dashboard/dashboard.component.ts`

**Tipo:** Standalone Component

**Descripción:** Panel principal de administración que muestra estadísticas, gráficos y pedidos recientes.

**Datos requeridos:**
- `stats()`: DashboardStats - Estadísticas generales (ventas, pedidos, productos, usuarios)
- `orders()`: OrderSummary[] - Lista de pedidos recientes
- `salesChartData`: Gráfico de líneas con ventas últimos 7 días
- `categoryChartData`: Gráfico de dona con ventas por categoría

**Permisos requeridos:** `/api/v1/dashboard`

**Dependencias:**
- PrimeNG: CardModule, TableModule, ChartModule, TagModule
- Services: DashboardService, ConfigService, AuthService

### DashboardService
**Ubicación:** `frontend-admin/src/app/core/services/dashboard.service.ts`

**Métodos:**
- `loadDashboard()`: Carga todos los datos del dashboard
- `getStats()`: Observable<DashboardStats> - Estadísticas desde `/api/v1/dashboard/stats`
- `getOrders()`: Observable<OrderSummary[]> - Pedidos desde `/api/v1/dashboard/orders`
- `getSalesChart()`: Observable<SalesChartData> - Datos gráfico ventas desde `/api/v1/dashboard/sales-chart`
- `getCategorySales()`: Observable<CategorySalesData[]> - Ventas por categoría desde `/api/v1/dashboard/category-sales`

**Interfaces:**
```typescript
interface DashboardStats {
  ventasMes: number;
  ventasMesAnterior: number;
  pedidosPendientes: number;
  pedidosMesAnterior: number;
  usuariosNuevos: number;
  usuariosSemana: number;
  productosActivos: number;
  productosStockBajo: number;
}

interface OrderSummary {
  _id: string;
  usuario: { nombre?: string; name?: string; email: string };
  precioTotal: number;
  estado: string;
  fecha: string;
}
```

## Módulo Productos

### ProductListComponent
**Ubicación:** `frontend-admin/src/app/features/products/product-list.component.ts`

**Tipo:** Standalone Component

**Descripción:** Lista de productos con tabla PrimeNG, paginación, filtros y acciones.

**Datos requeridos:**
- `products()`: Product[] - Lista de productos
- `filteredProducts()`: Product[] - Productos filtrados por búsqueda
- `searchTerm`: string - Término de búsqueda

**Permisos requeridos:** `/api/v1/products`

**Funcionalidades:**
- Búsqueda por nombre, categoría, slug
- Paginación con opciones de 10, 25, 50
- Editar producto (navega a `/productos/editar/:id`)
- Eliminar producto con confirmación
- Indicador visual de stock bajo (< 10)

**Dependencias PrimeNG:** TableModule, ButtonModule, TagModule, InputTextModule, DialogModule

### ProductFormComponent
**Ubicación:** `frontend-admin/src/app/features/products/product-form.component.ts`

**Tipo:** Standalone Component

**Descripción:** Formulario para crear o editar productos.

**Parámetros de ruta:**
- `/productos/nuevo` - Crea nuevo producto
- `/productos/editar/:id` - Edita producto existente

**Campos del formulario:**
- Nombre (requerido)
- Slug (requerido, para URL)
- Descripción (textarea)
- Precio ( ARS)
- Stock
- Categoría
- Etiquetas (añadir/eliminar tags)
- Imágenes (subida a Cloudinary)
- Tipo de Producto (selector)
- Activo (checkbox)

**Permisos requeridos:** `/api/v1/products`

**Funcionalidades:**
- Subida de imágenes a Cloudinary
- Sistema de etiquetas
- Validación de campos requeridos

**Dependencias PrimeNG:** InputTextModule, InputTextareaModule, InputNumberModule, ButtonModule, SelectModule, FileUploadModule, TagModule, CardModule

### ProductService
**Ubicación:** `frontend-admin/src/app/core/services/product.service.ts`

**Métodos:**
- `loadProducts()`: Observable<Product[]> - Carga productos desde `/api/v1/products`
- `getProduct(id)`: Observable<Product> - Obtiene producto por ID
- `createProduct(product)`: Observable<Product> - Crea nuevo producto
- `updateProduct(id, product)`: Observable<Product> - Actualiza producto
- `deleteProduct(id)`: Observable<void> - Elimina producto
- `uploadImage(file)`: Observable<{ url: string }> - Sube imagen a Cloudinary

## Módulo Usuarios

### UserListComponent
**Ubicación:** `frontend-admin/src/app/features/users/user-list.component.ts`

**Tipo:** Standalone Component

**Descripción:** Lista de usuarios con gestión de roles y estados.

**Datos requeridos:**
- `users()`: User[] - Lista de usuarios
- `filteredUsers()`: User[] - Usuarios filtrados
- `roles()`: Role[] - Lista de roles disponibles

**Permisos requeridos:** Role `admin`

**Funcionalidades:**
- Búsqueda por nombre y email
- Editar rol de usuario (diálogo)
- Activar/desactivar usuario
- Indicadores de estado y verificación

**Dependencias PrimeNG:** TableModule, ButtonModule, TagModule, InputTextModule, DialogModule, SelectModule

### UserService
**Ubicación:** `frontend-admin/src/app/core/services/user.service.ts`

**Métodos:**
- `loadUsers()`: Observable<User[]> - Carga usuarios desde `/api/v1/users`
- `getUser(id)`: Observable<User> - Obtiene usuario por ID
- `updateUser(id, data)`: Observable<User> - Actualiza usuario (rol, estado)
- `toggleUserStatus(id)`: Observable<User> - Activa/desactiva usuario

## Módulo Roles

### RoleListComponent
**Ubicación:** `frontend-admin/src/app/features/roles/role-list.component.ts`

**Tipo:** Standalone Component

**Descripción:** Lista de roles con permisos asignados.

**Permisos requeridos:** Role `admin`

**Funcionalidades:**
- Ver roles con sus permisos
- Crear nuevo rol (navega a `/roles/nuevo`)
- Editar rol (navega a `/roles/editar/:id`)
- Eliminar rol con confirmación

**Dependencias PrimeNG:** TableModule, ButtonModule, TagModule, DialogModule

### RoleFormComponent
**Ubicación:** `frontend-admin/src/app/features/roles/role-form.component.ts`

**Tipo:** Standalone Component

**Descripción:** Formulario para crear/editar roles y asignar permisos.

**Parámetros de ruta:**
- `/roles/nuevo` - Crea nuevo rol
- `/roles/editar/:id` - Edita rol existente

**Campos del formulario:**
- Nombre (requerido)
- Descripción
- Permisos (checkboxes agrupados por categoría)

**Permisos requeridos:** Role `admin`

**Funcionalidades:**
- Agrupación de permisos por recurso
- Checkboxes para selección múltiple
- Edición de permisos existentes

**Dependencias PrimeNG:** InputTextModule, InputTextareaModule, ButtonModule, CheckboxModule, CardModule

### RoleService
**Ubicación:** `frontend-admin/src/app/core/services/role.service.ts`

**Métodos:**
- `loadRoles()`: Observable<Role[]> - Carga roles desde `/api/v1/roles`
- `loadPermissions()`: Observable<Permission[]> - Carga permisos desde `/api/v1/permissions`
- `getRole(id)`: Observable<Role> - Obtiene rol por ID
- `createRole(role)`: Observable<Role> - Crea nuevo rol
- `updateRole(id, role)`: Observable<Role> - Actualiza rol
- `deleteRole(id)`: Observable<void> - Elimina rol

## Módulo Órdenes

### OrderListComponent
**Ubicación:** `frontend-admin/src/app/features/orders/order-list.component.ts`

**Tipo:** Standalone Component

**Descripción:** Lista de pedidos con gestión de estados y notificaciones.

**Datos requeridos:**
- `orders()`: Order[] - Lista de pedidos
- `filteredOrders()`: Order[] - Pedidos filtrados

**Permisos requeridos:** `/api/v1/orders`

**Funcionalidades:**
- Búsqueda por ID y email
- Filtro por estado (pendiente, procesando, enviado, entregado, cancelado)
- Ver detalle del pedido (diálogo)
- Cambiar estado del pedido
- Reenviar notificación al cliente

**Estados de orden:** pending, processing, shipped, delivered, cancelled

**Dependencias PrimeNG:** TableModule, ButtonModule, TagModule, InputTextModule, SelectModule, DialogModule

### OrderService
**Ubicación:** `frontend-admin/src/app/core/services/order.service.ts`

**Métodos:**
- `loadOrders()`: Observable<Order[]> - Carga pedidos desde `/api/v1/orders`
- `getOrder(id)`: Observable<Order> - Obtiene pedido por ID
- `updateOrderStatus(id, status)`: Observable<Order> - Actualiza estado
- `resendNotification(id)`: Observable<{ success: boolean; message: string }> - Reenvía notificación

## Módulo Configuración

### ConfigPageComponent
**Ubicación:** `frontend-admin/src/app/features/config/config-page.component.ts`

**Tipo:** Standalone Component

**Descripción:** Configuración general del e-commerce.

**Permisos requeridos:** Role `admin`

**Secciones:**
1. **Información de la Tienda**
   - Nombre de la tienda
   - Logo (subida a Cloudinary)

2. **Colores del Tema**
   - Primario, Secundario, Acento, Fondo, Texto
   - Selector de color con input hexadecimal

3. **Métodos de Pago**
   - Lista de métodos activos/inactivos
   - Agregar/eliminar métodos
   - Toggle de activación

4. **Reglas de Envío**
   - Lista de reglas con condiciones
   - Agregar reglas con zonas y rangos de precio
   - Toggle de activación

**Dependencias PrimeNG:** InputTextModule, InputTextareaModule, InputSwitchModule, ButtonModule, CardModule, ColorPickerModule, FileUploadModule, DialogModule

## Rutas Protegidas

| Ruta | Componente | Guard | Permiso/Requisito |
|------|------------|-------|-------------------|
| `/dashboard` | DashboardComponent | authGuard, permissionsGuard | `/api/v1/dashboard` |
| `/productos` | ProductListComponent | authGuard, permissionsGuard | `/api/v1/products` |
| `/productos/nuevo` | ProductFormComponent | authGuard, permissionsGuard | `/api/v1/products` |
| `/productos/editar/:id` | ProductFormComponent | authGuard, permissionsGuard | `/api/v1/products` |
| `/usuarios` | UserListComponent | authGuard, permissionsGuard | role: admin |
| `/ordenes` | OrderListComponent | authGuard, permissionsGuard | `/api/v1/orders` |
| `/roles` | RoleListComponent | authGuard, permissionsGuard | role: admin |
| `/roles/nuevo` | RoleFormComponent | authGuard, permissionsGuard | role: admin |
| `/roles/editar/:id` | RoleFormComponent | authGuard, permissionsGuard | role: admin |
| `/configuracion` | ConfigPageComponent | authGuard, permissionsGuard | role: admin |
| `/pagos` | PaymentListComponent | authGuard, permissionsGuard | role: admin |
| `/notificaciones` | NotificationListComponent | authGuard, permissionsGuard | role: admin |

## Guards

### authGuard
**Ubicación:** `frontend-admin/src/app/core/guards/auth.guard.ts`

Verifica que el usuario esté autenticado (JWT válido en localStorage). Redirige a `/login` si no lo está.

### permissionsGuard
**Ubicación:** `frontend-admin/src/app/core/guards/permissions.guard.ts`

Verifica permisos granulares del usuario. Lee `route.data['permission']` o `route.data['role']` y redirige a `/unauthorized` si no tiene acceso.

## Servicios

### AuthService
**Ubicación:** `frontend-admin/src/app/core/services/auth.service.ts`

**Métodos:**
- `login(email, password)`: Observable<User>
- `logout()`: void
- `hasPermission(resource, action?)`: boolean
- `hasRole(roleName)`: boolean
- `refreshToken()`: Observable<User>
- `getAccessToken()`: string | null

**Señales:**
- `user`: User | null
- `permissions`: string[]
- `isAuthenticated`: boolean
- `isLoading`: boolean

### ConfigService
**Ubicación:** `frontend-admin/src/app/core/services/config.service.ts`

**Métodos:**
- `loadConfig()`: void - Carga configuración desde `/api/v1/config`
- `updateConfig(config)`: Observable<Configuracion> - Actualiza configuración

**Señales:**
- `config`: Configuracion | null
- `nombreTienda`: string
- `logo`: string
- `colores`: objeto con primario, secundario, acento, fondo, texto

## Modelos

### Product
**Ubicación:** `frontend-admin/src/app/shared/models/product.model.ts`

```typescript
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  tags: string[];
  images: string[];
  slug: string;
  isActive: boolean;
  productType?: ProductType;
  customFields?: Record<string, unknown>;
  ratings: Rating[];
  createdAt: string;
  updatedAt: string;
}
```

### Order
**Ubicación:** `frontend-admin/src/app/shared/models/order.model.ts`

```typescript
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  _id: string;
  user: UserSummary;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}
```

### Role
**Ubicación:** `frontend-admin/src/app/shared/models/role.model.ts`

```typescript
interface Role {
  _id: string;
  name: string;
  permissions: Permission[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  _id: string;
  resource: string;
  action: PermissionAction;
  description?: string;
  isAutoGenerated: boolean;
}
```

### Configuracion
**Ubicación:** `frontend-admin/src/app/shared/models/config.model.ts`

```typescript
interface Configuracion {
  _id: string;
  nombreTienda?: string;
  logo?: string;
  colores?: {
    primario: string;
    secundario: string;
    acento: string;
    fondo: string;
    texto: string;
  };
  metodosPago?: MetodoPago[];
  reglasEnvio?: ReglaEnvio[];
  createdAt?: string;
  updatedAt?: string;
}
```

## Módulo Notificaciones

### NotificationListComponent
**Ubicación:** `frontend-admin/src/app/features/notifications/notification-list.component.ts`

**Tipo:** Standalone Component

**Descripción:** Contenedor principal del módulo de notificaciones con tabs para enviar, gestionar plantillas, historial y configuración.

**Datos requeridos:**
- `stats()`: NotificationStats - Estadísticas de envío (total, fallidos, emails, whatsapp)

**Permisos requeridos:** Role `admin`

**Sub-componentes:**
- NotificationSendComponent
- NotificationTemplatesComponent
- NotificationHistoryComponent
- NotificationSettingsComponent

**Dependencias PrimeNG:** CardModule, TableModule, TagModule

### NotificationSendComponent
**Ubicación:** `frontend-admin/src/app/features/notifications/notification-send.component.ts`

**Tipo:** Standalone Component

**Descripción:** Formulario para enviar notificaciones por email o WhatsApp.

**Funcionalidades:**
- Selector de tipo (email/whatsapp)
- Selección de destinatarios (usuarios, órdenes o personalizado)
- Carga de plantilla
- Vista previa del mensaje
- Envío de notificación

**Dependencias PrimeNG:** InputTextModule, InputTextareaModule, SelectModule, ButtonModule

### NotificationTemplatesComponent
**Ubicación:** `frontend-admin/src/app/features/notifications/notification-templates.component.ts`

**Tipo:** Standalone Component

**Descripción:** Gestión de plantillas de notificación con CRUD completo.

**Funcionalidades:**
- Lista de plantillas con filtros
- Crear/editar plantilla (diálogo)
- Eliminar con confirmación
- Variables dinámicas en mensajes
- Activar/desactivar plantillas

**Dependencias PrimeNG:** DialogModule, InputTextModule, InputTextareaModule, SelectModule, CheckboxModule

### NotificationHistoryComponent
**Ubicación:** `frontend-admin/src/app/features/notifications/notification-history.component.ts`

**Tipo:** Standalone Component

**Descripción:** Historial de notificaciones enviadas con paginación y filtros.

**Datos requeridos:**
- `history()`: NotificationHistory[] - Lista de notificaciones
- `filteredHistory()`: NotificationHistory[] - Notificaciones filtradas

**Funcionalidades:**
- Filtro por estado (enviado, fallido, pendiente)
- Filtro por tipo (email, whatsapp)
- Ver detalles de notificación
- Reenviar notificación fallida
- Paginación

**Dependencias PrimeNG:** TableModule, DialogModule, SelectModule

### NotificationSettingsComponent
**Ubicación:** `frontend-admin/src/app/features/notifications/notification-settings.component.ts`

**Tipo:** Standalone Component

**Descripción:** Configuración de notificaciones automáticas y credenciales de API.

**Funcionalidades:**
- Activar/desactivar notificaciones por estado de orden
- Configurar canales (email, whatsapp)
- Ingresar credenciales de Resend y Meta Cloud API

**Dependencias PrimeNG:** InputTextModule, InputSwitchModule, CardModule

### NotificationService
**Ubicación:** `frontend-admin/src/app/core/services/notification.service.ts`

**Métodos:**
- `loadTemplates()`: Observable<NotificationTemplate[]> - Carga plantillas
- `createTemplate(template)`: Observable<NotificationTemplate> - Crea plantilla
- `updateTemplate(id, template)`: Observable<NotificationTemplate> - Actualiza plantilla
- `deleteTemplate(id)`: Observable<void> - Elimina plantilla
- `loadHistory(page, limit)`: Observable<{ data, total }> - Carga historial
- `sendNotification(dto)`: Observable<{ success, message }> - Envía notificación
- `loadSettings()`: Observable<NotificationSettings> - Carga configuración
- `updateSettings(settings)`: Observable<NotificationSettings> - Guarda configuración
- `getStats()`: Observable<NotificationStats> - Obtiene estadísticas
- `resendNotification(id)`: Observable<{ success, message }> - Reenvía notificación

### Modelos de Notificación
**Ubicación:** `frontend-admin/src/app/shared/models/notification.model.ts`

```typescript
interface NotificationTemplate {
  _id: string;
  name: string;
  subject?: string;
  body: string;
  type: 'email' | 'whatsapp';
  channel: 'resend' | 'meta';
  variables: string[];
  isActive: boolean;
}

interface NotificationHistory {
  _id: string;
  type: 'email' | 'whatsapp';
  channel: 'resend' | 'meta';
  recipient: string;
  subject?: string;
  body: string;
  status: 'sent' | 'failed' | 'pending';
  errorMessage?: string;
  orderId?: string;
  userId?: string;
  sentAt: string;
}

interface NotificationSettings {
  _id: string;
  orderPending: boolean;
  orderProcessing: boolean;
  orderShipped: boolean;
  orderDelivered: boolean;
  orderCancelled: boolean;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  resendApiKey?: string;
  metaAccessToken?: string;
  metaPhoneNumberId?: string;
  metaWhatsAppBusinessId?: string;
}

interface NotificationStats {
  totalSent: number;
  totalFailed: number;
  emailSent: number;
  whatsappSent: number;
  todaySent: number;
}
```
```