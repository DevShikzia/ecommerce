import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Productos</h1>
          <p class="text-gray-500 mt-1">Gestión del catálogo de productos</p>
        </div>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 transition-colors">
          <i class="pi pi-plus"></i>
          Nuevo Producto
        </button>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p-table [value]="[]" [rows]="10" [paginator]="true" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr class="bg-gray-50">
              <th class="text-xs font-semibold text-gray-600 uppercase">Producto</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Precio</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Stock</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Estado</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body">
            <tr>
              <td colspan="5" class="text-center py-12 text-gray-400">
                <i class="pi pi-box text-4xl mb-3 block"></i>
                No hay productos registrados
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `
})
export class ProductListComponent {}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Usuarios</h1>
          <p class="text-gray-500 mt-1">Gestión de usuarios del sistema</p>
        </div>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 transition-colors">
          <i class="pi pi-user-plus"></i>
          Nuevo Usuario
        </button>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p-table [value]="[]" [rows]="10" [paginator]="true" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr class="bg-gray-50">
              <th class="text-xs font-semibold text-gray-600 uppercase">Nombre</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Rol</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Estado</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body">
            <tr>
              <td colspan="5" class="text-center py-12 text-gray-400">
                <i class="pi pi-users text-4xl mb-3 block"></i>
                No hay usuarios registrados
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `
})
export class UserListComponent {}

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Roles y Permisos</h1>
          <p class="text-gray-500 mt-1">Configuración de roles y permisos del sistema</p>
        </div>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 transition-colors">
          <i class="pi pi-shield"></i>
          Nuevo Rol
        </button>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p-table [value]="[]" [rows]="10" [paginator]="true" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr class="bg-gray-50">
              <th class="text-xs font-semibold text-gray-600 uppercase">Nombre</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Permisos</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Descripción</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body">
            <tr>
              <td colspan="4" class="text-center py-12 text-gray-400">
                <i class="pi pi-shield text-4xl mb-3 block"></i>
                No hay roles configurados
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `
})
export class RoleListComponent {}

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Pedidos</h1>
        <p class="text-gray-500 mt-1">Gestión de pedidos del sistema</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p-table [value]="[]" [rows]="10" [paginator]="true" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr class="bg-gray-50">
              <th class="text-xs font-semibold text-gray-600 uppercase">ID</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Cliente</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Total</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Estado</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Fecha</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body">
            <tr>
              <td colspan="6" class="text-center py-12 text-gray-400">
                <i class="pi pi-shopping-cart text-4xl mb-3 block"></i>
                No hay pedidos registrados
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `
})
export class OrderListComponent {}

@Component({
  selector: 'app-config-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Configuración</h1>
        <p class="text-gray-500 mt-1">Configuración general del e-commerce</p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Información de la Tienda</h2>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-2">Nombre de la tienda</label>
              <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" placeholder="Mi Tienda">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-2">Logo URL</label>
              <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" placeholder="https://...">
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Colores del Tema</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-2">Color Primario</label>
              <input type="color" class="w-full h-12 border border-gray-300 rounded-xl cursor-pointer" value="#3b82f6">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-2">Color Secundario</label>
              <input type="color" class="w-full h-12 border border-gray-300 rounded-xl cursor-pointer" value="#64748b">
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConfigPageComponent {}

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Métodos de Pago</h1>
          <p class="text-gray-500 mt-1">Configura los métodos de pago disponibles</p>
        </div>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 transition-colors">
          <i class="pi pi-plus"></i>
          Nuevo Método
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <i class="pi pi-credit-card text-xl text-blue-600"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Mercado Pago</h3>
              <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Activo</span>
            </div>
          </div>
          <p class="text-gray-500 text-sm">Integración con Mercado Pago para pagos online</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <i class="pi pi-money-bill text-xl text-green-600"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Efectivo</h3>
              <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Activo</span>
            </div>
          </div>
          <p class="text-gray-500 text-sm">Pago en efectivo al recibir</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <i class="pi pi-building text-xl text-purple-600"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Transferencia</h3>
              <span class="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">Pendiente</span>
            </div>
          </div>
          <p class="text-gray-500 text-sm">Transferencia bancaria directa</p>
        </div>
      </div>
    </div>
  `
})
export class PaymentListComponent {}