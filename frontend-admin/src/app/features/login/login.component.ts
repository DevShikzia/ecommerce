import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex">
      <div class="hidden lg:flex lg:w-1/2 bg-blue-600 p-12 flex-col justify-between">
        <div>
          <div class="flex items-center gap-3 mb-8">
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <i class="pi pi-shop text-2xl text-white"></i>
            </div>
            <h1 class="text-2xl font-bold text-white">{{ configService.nombreTienda() }}</h1>
          </div>
          <h2 class="text-4xl font-bold text-white leading-tight mb-4">
            Panel de Administración
          </h2>
          <p class="text-blue-200 text-lg">Gestiona tu e-commerce de manera eficiente y segura.</p>
        </div>
        <div class="flex items-center gap-4 text-blue-200">
          <i class="pi pi-shield text-3xl"></i>
          <div>
            <p class="font-semibold text-white">Seguridad SSL</p>
            <p class="text-sm">Conexión encriptada de extremo a extremo</p>
          </div>
        </div>
      </div>

      <div class="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div class="w-full max-w-md">
          <div class="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <i class="pi pi-shop text-2xl text-white"></i>
            </div>
            <h1 class="text-2xl font-bold text-gray-800">{{ configService.nombreTienda() }}</h1>
          </div>

          <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-gray-800">Bienvenido</h2>
              <p class="text-gray-500 mt-2">Ingresá tus credenciales para continuar</p>
            </div>

            <form (ngSubmit)="onLogin()" class="flex flex-col gap-5">
              <div class="flex flex-col gap-2">
                <label for="email" class="text-sm font-medium text-gray-700">Correo electrónico</label>
                <div class="relative">
                  <i class="pi pi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    id="email"
                    type="email"
                    [(ngModel)]="email"
                    name="email"
                    placeholder="admin@ejemplo.com"
                    class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400 bg-white"
                    required
                  />
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label for="password" class="text-sm font-medium text-gray-700">Contraseña</label>
                <div class="relative">
                  <i class="pi pi-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    id="password"
                    type="password"
                    [(ngModel)]="password"
                    name="password"
                    placeholder="Tu contraseña"
                    class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400 bg-white"
                    required
                  />
                </div>
              </div>

              @if (error()) {
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <i class="pi pi-exclamation-triangle"></i>
                  {{ error() }}
                </div>
              }

              <button
                type="submit"
                [disabled]="loading()"
                class="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
              >
                @if (loading()) {
                  <i class="pi pi-spin pi-spinner"></i>
                }
                Iniciar Sesión
              </button>
            </form>
          </div>

          <p class="text-center text-gray-400 text-sm mt-6">
            © 2024 {{ configService.nombreTienda() }}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  configService = inject(ConfigService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  onLogin(): void {
    if (!this.email || !this.password) {
      this.error.set('Completá todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        this.loading.set(false);
        if (user) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Credenciales inválidas');
      }
    });
  }
}