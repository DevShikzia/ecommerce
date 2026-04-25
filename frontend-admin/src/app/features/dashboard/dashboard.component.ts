import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { ConfigService } from '../../core/services/config.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, ChartModule],
  template: `
    <div class="p-6 bg-slate-50 min-h-screen">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800">
          Bienvenido, {{ authService.user()?.name }}
        </h1>
        <p class="text-slate-500 mt-1">Panel de administración de {{ configService.nombreTienda() }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Ventas del mes</p>
              <p class="text-3xl font-bold text-slate-800 mt-1">$0</p>
              <p class="text-xs text-green-600 mt-1">+0% vs mes anterior</p>
            </div>
            <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <i class="pi pi-dollar text-2xl text-blue-600"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Pedidos</p>
              <p class="text-3xl font-bold text-slate-800 mt-1">0</p>
              <p class="text-xs text-green-600 mt-1">+0% vs mes anterior</p>
            </div>
            <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <i class="pi pi-shopping-cart text-2xl text-green-600"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Productos</p>
              <p class="text-3xl font-bold text-slate-800 mt-1">0</p>
              <p class="text-xs text-slate-400 mt-1">0 en stock bajo</p>
            </div>
            <div class="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
              <i class="pi pi-box text-2xl text-orange-600"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Usuarios</p>
              <p class="text-3xl font-bold text-slate-800 mt-1">0</p>
              <p class="text-xs text-green-600 mt-1">+0 nuevos esta semana</p>
            </div>
            <div class="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
              <i class="pi pi-users text-2xl text-purple-600"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Últimos Pedidos</h2>
          <p-table [value]="[]" [rows]="5" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr class="bg-slate-50">
                <th class="text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                <th class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Cliente</th>
                <th class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Total</th>
                <th class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body">
              <tr>
                <td colspan="4" class="text-center py-8 text-slate-400">
                  <i class="pi pi-inbox text-4xl mb-2 block"></i>
                  No hay pedidos aún
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Productos más vendidos</h2>
          <p-table [value]="[]" [rows]="5" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr class="bg-slate-50">
                <th class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Producto</th>
                <th class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Ventas</th>
                <th class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Stock</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body">
              <tr>
                <td colspan="3" class="text-center py-8 text-slate-400">
                  <i class="pi pi-box text-4xl mb-2 block"></i>
                  No hay productos aún
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  configService = inject(ConfigService);
  authService = inject(AuthService);
}