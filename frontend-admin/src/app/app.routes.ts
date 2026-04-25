import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { permissionsGuard } from './core/guards/permissions.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [permissionsGuard],
        data: { permission: '/api/v1/dashboard' }
      },
      {
        path: 'productos',
        loadComponent: () => import('./features/products/product-list.component').then(m => m.ProductListComponent),
        canActivate: [permissionsGuard],
        data: { permission: '/api/v1/products' }
      },
      {
        path: 'productos/nuevo',
        loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent),
        canActivate: [permissionsGuard],
        data: { permission: '/api/v1/products' }
      },
      {
        path: 'productos/editar/:id',
        loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent),
        canActivate: [permissionsGuard],
        data: { permission: '/api/v1/products' }
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/users/user-list.component').then(m => m.UserListComponent),
        canActivate: [permissionsGuard],
        data: { role: 'admin' }
      },
      {
        path: 'ordenes',
        loadComponent: () => import('./features/orders/order-list.component').then(m => m.OrderListComponent),
        canActivate: [permissionsGuard],
        data: { permission: '/api/v1/orders' }
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/roles/role-list.component').then(m => m.RoleListComponent),
        canActivate: [permissionsGuard],
        data: { role: 'admin' }
      },
      {
        path: 'roles/nuevo',
        loadComponent: () => import('./features/roles/role-form.component').then(m => m.RoleFormComponent),
        canActivate: [permissionsGuard],
        data: { role: 'admin' }
      },
      {
        path: 'roles/editar/:id',
        loadComponent: () => import('./features/roles/role-form.component').then(m => m.RoleFormComponent),
        canActivate: [permissionsGuard],
        data: { role: 'admin' }
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/config/config-page.component').then(m => m.ConfigPageComponent),
        canActivate: [permissionsGuard],
        data: { role: 'admin' }
      },
      {
        path: 'pagos',
        loadComponent: () => import('./features/pagos/payment-list.component').then(m => m.PaymentListComponent),
        canActivate: [permissionsGuard],
        data: { role: 'admin' }
      },
      {
        path: 'notificaciones',
        loadComponent: () => import('./features/notifications/notification-list.component').then(m => m.NotificationListComponent),
        canActivate: [permissionsGuard],
        data: { role: 'admin' }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];