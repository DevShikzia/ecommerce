import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ConfigService } from '../../core/services/config.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  permission?: string;
  role?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col">
      <div class="p-5 border-b border-slate-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <i class="pi pi-shop text-lg text-white"></i>
          </div>
          <div class="min-w-0">
            <h2 class="font-bold text-base truncate">{{ configService.nombreTienda() }}</h2>
            <p class="text-xs text-slate-400">Panel Admin</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto p-4">
        <ul class="space-y-1">
          @for (item of menuItems(); track item.route) {
            @if (canShowItem(item)) {
              <li>
                <a
                  [routerLink]="item.route"
                  routerLinkActive="bg-blue-600 text-white"
                  class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-all text-sm"
                >
                  <i [class]="'pi ' + item.icon + ' text-base'"></i>
                  <span>{{ item.label }}</span>
                </a>
              </li>
            }
          }
        </ul>
      </nav>

      <div class="p-4 border-t border-slate-700">
        <div class="flex items-center gap-3 mb-3 p-3 bg-slate-800 rounded-lg">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span class="text-sm font-bold">{{ getInitials() }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm truncate">{{ authService.user()?.name || 'Admin' }}</p>
            <p class="text-xs text-slate-400 truncate">{{ authService.user()?.role?.name || 'Usuario' }}</p>
          </div>
        </div>
        <button
          (click)="logout()"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-all text-sm text-red-400 hover:text-white"
        >
          <i class="pi pi-sign-out text-base"></i>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);
  configService = inject(ConfigService);

  menuItems = signal<MenuItem[]>([
    { label: 'Dashboard', icon: 'pi-chart-bar', route: '/dashboard' },
    { label: 'Productos', icon: 'pi-box', route: '/productos', permission: '/api/v1/products' },
    { label: 'Pedidos', icon: 'pi-shopping-cart', route: '/ordenes', permission: '/api/v1/orders' },
    { label: 'Métodos de Pago', icon: 'pi-credit-card', route: '/pagos', role: 'admin' },
    { label: 'Usuarios', icon: 'pi-users', route: '/usuarios', permission: '/api/v1/users', role: 'admin' },
    { label: 'Roles y Permisos', icon: 'pi-shield', route: '/roles', role: 'admin' },
    { label: 'Configuración', icon: 'pi-cog', route: '/configuracion', role: 'admin' }
  ]);

  canShowItem(item: MenuItem): boolean {
    if (item.role && !this.authService.hasRole(item.role)) {
      return false;
    }
    if (item.permission && !this.authService.hasPermission(item.permission)) {
      return false;
    }
    return true;
  }

  getInitials(): string {
    const nombre = this.authService.user()?.name || 'A';
    return nombre.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  logout(): void {
    this.authService.logout();
  }
}