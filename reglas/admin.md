# Reglas de Frontend Admin (Angular Independiente)

## Contexto del Panel de Administración
Aplicación Angular independiente (carpeta `frontend-admin/`) para gestión del e-commerce. Usa PrimeNG para UI sobria, verifica permisos granulares en frontend y backend. Todas las respuestas de IA y comentarios en castellano, código fuente en inglés.

## Idioma
- Código fuente (variables, funciones, clases): Inglés.
- Comentarios de código: Castellano.
- Respuestas de IA: Castellano.

## Convenciones de Código
- No usar `any` en TypeScript: Todo tipado con interfaces en `src/app/shared/models/`.
- Componentes: `PascalCase`, Standalone (sin NgModules), en `src/app/features/` o `src/app/shared/components/`.
- Nombres de archivos: `kebab-case` (ej: `role-list.component.ts`, `product-edit.component.ts`).

## UI y Diseño
- Librería UI: PrimeNG (temas sobrios, componentes preconstruidos para tablas, formularios y dashboards).
- Temas configurables: El admin define colores, nombre del e-commerce y logo en la colección `Configuracion` de MongoDB. El panel lee esta configuración al iniciar.

## Gestión de Roles y Permisos
- Doble verificación de seguridad:
  1. Backend: Middleware `permisos.middleware.ts` verifica si el rol tiene permiso para el endpoint.
  2. Frontend: Guards (`auth.guard.ts`, `permissions.guard.ts`) verifican si el usuario tiene permiso para acceder a la ruta.
- Autogestión de permisos: Al compilar el frontend admin, escanear todas las rutas definidas y guardar las páginas accesibles en la colección `Permission` de MongoDB automáticamente.
- El admin puede crear roles, asignar permisos (endpoints API y páginas de Angular) y editar reglas de envío, pagos y configuración general.

## Reglas de Reutilización
- Componentes reutilizables en `src/app/shared/components/` (ej: `DataTableComponent`, `FormFieldComponent`).
- Servicios en `src/app/core/services/` (ej: `role.service.ts`, `permission.service.ts`).

## Ejemplos de Código (Correcto / Incorrecto)
### Correcto (Guard de Permisos)
```typescript
// frontend-admin/src/app/core/guards/permissions.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionsGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermission = route.data['permission'];
  if (authService.hasPermission(requiredPermission)) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};
```

### Incorrecto (Sin verificación de permisos)
```typescript
// No exponer rutas sin verificar permisos
import { Routes } from '@angular/router';
import { RoleListComponent } from '../features/roles/role-list.component';

export const routes: Routes = [
  { path: 'roles', component: RoleListComponent } // Sin guard incorrecto
];
```
