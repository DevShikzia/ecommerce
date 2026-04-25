import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-100">
      <div class="text-center">
        <i class="pi pi-lock text-8xl text-slate-300 mb-6"></i>
        <h1 class="text-4xl font-bold text-slate-800 mb-4">Acceso Denegado</h1>
        <p class="text-slate-500 mb-6">No tenés permisos para acceder a esta página.</p>
        <a
          href="/dashboard"
          class="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Volver al Dashboard
        </a>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {}