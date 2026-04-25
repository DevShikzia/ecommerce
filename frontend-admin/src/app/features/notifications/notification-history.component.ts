import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationHistory, NotificationStatus } from '../../shared/models/notification.model';

@Component({
  selector: 'app-notification-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-lg font-semibold text-slate-800">Historial de Notificaciones</h3>
          <p class="text-sm text-slate-500">Registro de todas las notificaciones enviadas</p>
        </div>
        <div class="flex gap-2">
          <select
            [(ngModel)]="filterStatus"
            (ngModelChange)="applyFilters()"
            class="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="sent">Enviados</option>
            <option value="failed">Fallidos</option>
            <option value="pending">Pendientes</option>
          </select>
          <select
            [(ngModel)]="filterType"
            (ngModelChange)="applyFilters()"
            class="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Fecha</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Tipo</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Destinatario</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Asunto</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Estado</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (item of filteredHistory(); track item._id) {
              <tr class="border-b border-slate-100 hover:bg-slate-50">
                <td class="py-3 px-4 text-sm text-slate-600">
                  {{ item.sentAt | date:'dd/MM/yyyy HH:mm' }}
                </td>
                <td class="py-3 px-4">
                  <span [class]="item.type === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'"
                    class="px-2 py-1 text-xs font-medium rounded">
                    <i [class]="item.type === 'email' ? 'pi pi-envelope' : 'pi pi-whatsapp'" class="mr-1"></i>
                    {{ item.type === 'email' ? 'Email' : 'WhatsApp' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-sm text-slate-600">
                  {{ item.recipient }}
                </td>
                <td class="py-3 px-4 text-sm text-slate-600 truncate max-w-xs">
                  {{ item.subject || item.body.slice(0, 50) }}...
                </td>
                <td class="py-3 px-4">
                  <span [class]="getStatusClass(item.status)"
                    class="px-2 py-1 text-xs font-medium rounded">
                    <i [class]="getStatusIcon(item.status)" class="mr-1"></i>
                    {{ getStatusLabel(item.status) }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <button
                    (click)="viewDetails(item)"
                    class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Ver detalles"
                  >
                    <i class="pi pi-eye text-sm"></i>
                  </button>
                  @if (item.status === 'failed') {
                    <button
                      (click)="resendNotification(item)"
                      class="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors ml-1"
                      title="Reenviar"
                    >
                      <i class="pi pi-refresh text-sm"></i>
                    </button>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="py-12 text-center text-slate-500">
                  <i class="pi pi-inbox text-4xl mb-3"></i>
                  <p>No hay notificaciones en el historial</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (totalPages() > 1) {
        <div class="flex justify-center items-center gap-2 mt-4">
          <button
            (click)="goToPage(currentPage() - 1)"
            [disabled]="currentPage() === 1"
            [class]="currentPage() === 1 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-600 hover:bg-slate-50'"
            class="px-3 py-1.5 border border-slate-300 rounded-md text-sm transition-colors"
          >
            <i class="pi pi-chevron-left"></i>
          </button>
          <span class="text-sm text-slate-600">
            Página {{ currentPage() }} de {{ totalPages() }}
          </span>
          <button
            (click)="goToPage(currentPage() + 1)"
            [disabled]="currentPage() === totalPages()"
            [class]="currentPage() === totalPages() ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-600 hover:bg-slate-50'"
            class="px-3 py-1.5 border border-slate-300 rounded-md text-sm transition-colors"
          >
            <i class="pi pi-chevron-right"></i>
          </button>
        </div>
      }
    </div>

    @if (showDetailsDialog()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
          <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-slate-800">Detalles de Notificación</h3>
            <button (click)="closeDetailsDialog()" class="text-slate-400 hover:text-slate-600">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs font-medium text-slate-500">Tipo</p>
                <p class="text-sm text-slate-800">{{ selectedItem()?.type === 'email' ? 'Email' : 'WhatsApp' }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-slate-500">Estado</p>
                <p class="text-sm text-slate-800">{{ getStatusLabel(selectedItem()?.status || 'pending') }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-slate-500">Destinatario</p>
                <p class="text-sm text-slate-800">{{ selectedItem()?.recipient }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-slate-500">Fecha</p>
                <p class="text-sm text-slate-800">{{ selectedItem()?.sentAt | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
            </div>

            @if (selectedItem()?.subject) {
              <div>
                <p class="text-xs font-medium text-slate-500">Asunto</p>
                <p class="text-sm text-slate-800">{{ selectedItem()?.subject }}</p>
              </div>
            }

            <div>
              <p class="text-xs font-medium text-slate-500">Mensaje</p>
              <p class="text-sm text-slate-800 whitespace-pre-wrap">{{ selectedItem()?.body }}</p>
            </div>

            @if (selectedItem()?.errorMessage) {
              <div class="p-3 bg-red-50 border border-red-200 rounded-md">
                <p class="text-xs font-medium text-red-600">Error</p>
                <p class="text-sm text-red-700">{{ selectedItem()?.errorMessage }}</p>
              </div>
            }
          </div>

          <div class="px-6 py-4 border-t border-slate-200 flex justify-end">
            <button
              (click)="closeDetailsDialog()"
              class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class NotificationHistoryComponent implements OnInit {
  private notificationService = inject(NotificationService);

  history = signal<NotificationHistory[]>([]);
  filteredHistory = signal<NotificationHistory[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  total = signal(0);
  filterStatus = '';
  filterType = '';
  showDetailsDialog = signal(false);
  selectedItem = signal<NotificationHistory | null>(null);

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(page: number = 1): void {
    this.notificationService.loadHistory(page, 20).subscribe({
      next: (result) => {
        this.history.set(result.data);
        this.filteredHistory.set(result.data);
        this.total.set(result.total);
        this.totalPages.set(Math.ceil(result.total / 20));
        this.currentPage.set(page);
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.history()];

    if (this.filterStatus) {
      filtered = filtered.filter(item => item.status === this.filterStatus);
    }
    if (this.filterType) {
      filtered = filtered.filter(item => item.type === this.filterType);
    }

    this.filteredHistory.set(filtered);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.loadHistory(page);
  }

  viewDetails(item: NotificationHistory): void {
    this.selectedItem.set(item);
    this.showDetailsDialog.set(true);
  }

  closeDetailsDialog(): void {
    this.showDetailsDialog.set(false);
    this.selectedItem.set(null);
  }

  resendNotification(item: NotificationHistory): void {
    this.notificationService.resendNotification(item._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadHistory(this.currentPage());
        }
      }
    });
  }

  getStatusClass(status: NotificationStatus): string {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  getStatusIcon(status: NotificationStatus): string {
    switch (status) {
      case 'sent':
        return 'pi pi-check';
      case 'failed':
        return 'pi pi-times';
      case 'pending':
        return 'pi pi-clock';
      default:
        return 'pi pi-info';
    }
  }

  getStatusLabel(status: NotificationStatus): string {
    switch (status) {
      case 'sent':
        return 'Enviado';
      case 'failed':
        return 'Fallido';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  }
}
