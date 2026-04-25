import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus } from '../../shared/models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    SelectModule,
    DialogModule
  ],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Pedidos</h1>
        <p class="text-gray-500 mt-1">Gestión de pedidos del sistema</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex flex-wrap gap-4 mb-4">
          <div class="flex-1 min-w-[200px]">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input 
                pInputText 
                type="text" 
                [(ngModel)]="searchTerm"
                (input)="onSearch()"
                placeholder="Buscar por ID o email..." 
                class="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl">
            </span>
          </div>
          <div class="min-w-[200px]">
            <p-select 
              [(ngModel)]="statusFilter"
              [options]="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Filtrar por estado"
              (onChange)="onStatusFilter()"
              [showClear]="true"
              class="w-full">
            </p-select>
          </div>
        </div>

        <p-table 
          [value]="filteredOrders()" 
          [rows]="10" 
          [paginator]="true"
          [rowsPerPageOptions]="[10, 25, 50]"
          [loading]="isLoading()"
          styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr class="bg-gray-50">
              <th class="text-xs font-semibold text-gray-600 uppercase">ID</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Cliente</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Total</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Estado</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Fecha</th>
              <th class="text-xs font-semibold text-gray-600 uppercase text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-order>
            <tr class="hover:bg-gray-50">
              <td class="font-mono text-sm text-gray-600">{{ order._id.slice(-8) }}</td>
              <td>
                <div>
                  <p class="font-medium text-gray-800">{{ order.user?.name || 'Usuario' }}</p>
                  <p class="text-xs text-gray-400">{{ order.user?.email }}</p>
                </div>
              </td>
              <td class="font-semibold text-gray-800">
                {{ order.totalPrice | currency:'ARS':'symbol':'1.0-0' }}
              </td>
              <td>
                <p-tag 
                  [value]="getStatusLabel(order.status)"
                  [severity]="getStatusSeverity(order.status)">
                </p-tag>
              </td>
              <td class="text-sm text-gray-600">
                {{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}
              </td>
              <td>
                <div class="flex items-center justify-center gap-2">
                  <button 
                    (click)="viewOrderDetail(order)"
                    class="p-button p-button-sm p-button-text p-button-rounded"
                    pTooltip="Ver detalle">
                    <i class="pi pi-eye"></i>
                  </button>
                  <button 
                    (click)="openStatusDialog(order)"
                    class="p-button p-button-sm p-button-text p-button-rounded"
                    pTooltip="Cambiar estado">
                    <i class="pi pi-sync"></i>
                  </button>
                  <button 
                    (click)="resendNotification(order)"
                    class="p-button p-button-sm p-button-text p-button-rounded"
                    pTooltip="Reenviar notificación">
                    <i class="pi pi-envelope"></i>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-12">
                <i class="pi pi-shopping-cart text-4xl text-gray-300 mb-3 block"></i>
                <p class="text-gray-500">No hay pedidos registrados</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <p-dialog 
        header="Detalle del Pedido" 
        [(visible)]="detailDialogVisible" 
        [modal]="true" 
        [style]="{width: '600px'}"
        [closable]="true">
        @if (selectedOrder()) {
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500">ID Pedido</p>
                <p class="font-mono text-sm">{{ selectedOrder()!._id }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Fecha</p>
                <p>{{ selectedOrder()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
            </div>

            <div>
              <p class="text-xs text-gray-500">Cliente</p>
              <p class="font-medium">{{ selectedOrder()!.user?.name }}</p>
              <p class="text-sm text-gray-600">{{ selectedOrder()!.user?.email || 'N/A' }}</p>
            </div>

            <div>
              <p class="text-xs text-gray-500 mb-2">Items</p>
              <div class="bg-gray-50 rounded-lg p-3 space-y-2">
                @for (item of selectedOrder()!.items; track item.product) {
                  <div class="flex justify-between items-center">
                    <span class="text-sm">{{ item.productName }} x{{ item.quantity }}</span>
                    <span class="font-medium">{{ item.price | currency:'ARS':'symbol':'1.0-0' }}</span>
                  </div>
                }
              </div>
            </div>

            <div class="flex justify-between items-center border-t pt-4">
              <span class="font-semibold">Total</span>
              <span class="text-xl font-bold text-blue-600">
                {{ selectedOrder()!.totalPrice | currency:'ARS':'symbol':'1.0-0' }}
              </span>
            </div>

            <div>
              <p class="text-xs text-gray-500">Dirección de envío</p>
              <p class="text-sm">
                {{ selectedOrder()!.shippingAddress.street }} {{ selectedOrder()!.shippingAddress.number }},
                {{ selectedOrder()!.shippingAddress.city }}, {{ selectedOrder()!.shippingAddress.province }}
                {{ selectedOrder()!.shippingAddress.postalCode }}
              </p>
            </div>

            <div>
              <p class="text-xs text-gray-500">Método de pago</p>
              <p class="text-sm">{{ selectedOrder()!.paymentMethod }}</p>
            </div>
          </div>
        }
      </p-dialog>

      <p-dialog 
        header="Cambiar Estado" 
        [(visible)]="statusDialogVisible" 
        [modal]="true" 
        [style]="{width: '400px'}"
        [closable]="false">
        <div class="space-y-4">
          <p class="text-sm text-gray-600">
            Selecciona el nuevo estado para el pedido 
            <span class="font-mono">{{ selectedOrder()?._id?.slice(-8) }}</span>
          </p>
          <p-select 
            [(ngModel)]="newStatus"
            [options]="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar estado"
            class="w-full">
          </p-select>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button 
            (click)="statusDialogVisible = false"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300">
            Cancelar
          </button>
          <button 
            (click)="updateOrderStatus()"
            class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            Actualizar
          </button>
        </div>
      </p-dialog>
    </div>
  `
})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);
  private router = inject(Router);

  orders = this.orderService.orders;
  isLoading = this.orderService.isLoading;
  searchTerm = '';
  statusFilter: OrderStatus | null = null;
  detailDialogVisible = false;
  statusDialogVisible = false;
  selectedOrder = signal<Order | null>(null);
  newStatus: OrderStatus | null = null;

  filteredOrders = signal<Order[]>([]);

  statusOptions = [
    { label: 'Pendiente', value: 'pending' },
    { label: 'Procesando', value: 'processing' },
    { label: 'Enviado', value: 'shipped' },
    { label: 'Entregado', value: 'delivered' },
    { label: 'Cancelado', value: 'cancelled' }
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.loadOrders().subscribe({
      next: () => this.updateFilteredOrders()
    });
  }

  onSearch(): void {
    this.updateFilteredOrders();
  }

  onStatusFilter(): void {
    this.updateFilteredOrders();
  }

  private updateFilteredOrders(): void {
    let orders = this.orders();

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      orders = orders.filter(o => 
        o._id.toLowerCase().includes(term) ||
        o.user?.email?.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter) {
      orders = orders.filter(o => o.status === this.statusFilter);
    }

    this.filteredOrders.set(orders);
  }

  getStatusLabel(status: OrderStatus): string {
    return this.statusOptions.find(s => s.value === status)?.label || status;
  }

  getStatusSeverity(status: OrderStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'pending': return 'warn';
      case 'processing': return 'info';
      case 'shipped': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  }

  viewOrderDetail(order: Order): void {
    this.selectedOrder.set(order);
    this.detailDialogVisible = true;
  }

  openStatusDialog(order: Order): void {
    this.selectedOrder.set(order);
    this.newStatus = order.status;
    this.statusDialogVisible = true;
  }

  updateOrderStatus(): void {
    const order = this.selectedOrder();
    if (order && this.newStatus) {
      this.orderService.updateOrderStatus(order._id, this.newStatus).subscribe({
        next: () => {
          this.statusDialogVisible = false;
          this.updateFilteredOrders();
        }
      });
    }
  }

  resendNotification(order: Order): void {
    this.orderService.resendNotification(order._id).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Notificación reenviada exitosamente');
        }
      }
    });
  }
}