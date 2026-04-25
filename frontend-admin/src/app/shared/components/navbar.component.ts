import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, BadgeModule],
  template: `
    <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
      <div class="flex items-center gap-4">
        <h1 class="text-lg font-semibold text-slate-700">{{ pageTitle() }}</h1>
      </div>

      <div class="flex items-center gap-4">
        <button class="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <i class="pi pi-bell text-xl text-slate-600"></i>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div class="h-8 w-px bg-slate-200"></div>

        <div class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <p class="font-medium text-sm text-slate-700">{{ authService.user()?.name || 'Admin' }}</p>
            <p class="text-xs text-slate-500">{{ authService.user()?.role?.name || 'Usuario' }}</p>
          </div>
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform">
            <span class="text-sm font-bold text-white">{{ getInitials() }}</span>
          </div>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
  pageTitle = signal('Dashboard');

  getInitials(): string {
    const nombre = this.authService.user()?.name || 'A';
    return nombre.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }
}