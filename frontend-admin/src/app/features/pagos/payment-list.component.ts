import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Métodos de Pago</h1>
        <p class="text-gray-500 mt-1">Configura los métodos de pago disponibles para tus clientes</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p class="text-gray-500 text-center py-8">Gestión de métodos de pago</p>
      </div>
    </div>
  `
})
export class PaymentListComponent {}