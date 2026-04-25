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
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'productos',
        loadComponent: () => import('./features/features.components').then(m => m.ProductListComponent),
        data: { permission: '/api/v1/products' }
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/features.components').then(m => m.UserListComponent),
        data: { role: 'admin' }
      },
      {
        path: 'ordenes',
        loadComponent: () => import('./features/features.components').then(m => m.OrderListComponent),
        data: { permission: '/api/v1/orders' }
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/features.components').then(m => m.RoleListComponent),
        data: { role: 'admin' }
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/features.components').then(m => m.ConfigPageComponent),
        data: { role: 'admin' }
      },
      {
        path: 'pagos',
        loadComponent: () => import('./features/features.components').then(m => m.PaymentListComponent),
        data: { role: 'admin' }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];