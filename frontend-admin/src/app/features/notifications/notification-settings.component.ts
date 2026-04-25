import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationSettings } from '../../shared/models/notification.model';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-slate-800 mb-1">Configuración de Notificaciones</h3>
        <p class="text-sm text-slate-500">Activa o desactiva las notificaciones automáticas por estado de orden</p>
      </div>

      @if (settings()) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-slate-50 rounded-lg p-5 border border-slate-200">
            <h4 class="text-md font-semibold text-slate-800 mb-4">Notificaciones Automáticas</h4>
            <p class="text-sm text-slate-500 mb-4">
              Activa el envío automático de notificaciones cuando cambia el estado de una orden
            </p>

            <div class="space-y-3">
              @for (status of orderStatuses; track status.key) {
                <div class="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                  <div class="flex items-center gap-3">
                    <span [class]="getStatusIconClass(status.key)" class="w-8 h-8 rounded-full flex items-center justify-center">
                      <i [class]="status.icon"></i>
                    </span>
                    <span class="text-sm text-slate-700">{{ status.label }}</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      [checked]="isStatusEnabled(status.key)"
                      (change)="toggleStatus(status.key)"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              }
            </div>
          </div>

          <div class="bg-slate-50 rounded-lg p-5 border border-slate-200">
            <h4 class="text-md font-semibold text-slate-800 mb-4">Canales de Envío</h4>
            <p class="text-sm text-slate-500 mb-4">
              Configura los canales de notificación activos
            </p>

            <div class="space-y-3">
              <div class="flex items-center justify-between py-2 border-b border-slate-200">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <i class="pi pi-envelope"></i>
                  </span>
                  <div>
                    <span class="text-sm text-slate-700">Email (Resend)</span>
                    <p class="text-xs text-slate-500">3000 emails gratuitos/mes</p>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="settings()!.emailEnabled"
                    (ngModelChange)="saveSettings()"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div class="flex items-center justify-between py-2 border-b border-slate-200">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <i class="pi pi-whatsapp"></i>
                  </span>
                  <div>
                    <span class="text-sm text-slate-700">WhatsApp (Meta)</span>
                    <p class="text-xs text-slate-500">Cloud API de Meta</p>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="settings()!.whatsappEnabled"
                    (ngModelChange)="saveSettings()"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-slate-50 rounded-lg p-5 border border-slate-200">
          <h4 class="text-md font-semibold text-slate-800 mb-4">Credenciales de API</h4>
          <p class="text-sm text-slate-500 mb-4">
            Configura las credenciales para los servicios de envío de notificaciones
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">API Key de Resend</label>
              <input
                type="password"
                [(ngModel)]="settings()!.resendApiKey"
                (ngModelChange)="markAsChanged()"
                placeholder="re_xxxxxxxxxxxx"
                class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p class="text-xs text-slate-500 mt-1">Obtén tu API key en resend.com</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Meta Access Token</label>
              <input
                type="password"
                [(ngModel)]="settings()!.metaAccessToken"
                (ngModelChange)="markAsChanged()"
                placeholder="EAAxxxxxxxxxxxxx"
                class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p class="text-xs text-slate-500 mt-1">Token de acceso de la app de Meta</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Phone Number ID</label>
              <input
                type="text"
                [(ngModel)]="settings()!.metaPhoneNumberId"
                (ngModelChange)="markAsChanged()"
                placeholder="+54 9 11 1234-5678"
                class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p class="text-xs text-slate-500 mt-1">ID del número de WhatsApp Business</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">WhatsApp Business ID</label>
              <input
                type="text"
                [(ngModel)]="settings()!.metaWhatsAppBusinessId"
                (ngModelChange)="markAsChanged()"
                placeholder="123456789012345"
                class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p class="text-xs text-slate-500 mt-1">ID del negocio en Meta Business</p>
            </div>
          </div>

          @if (hasChanges()) {
            <div class="mt-4 flex justify-end">
              <button
                (click)="saveSettings()"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
              >
                <i class="pi pi-save"></i>
                Guardar Cambios
              </button>
            </div>
          }
        </div>
      } @else {
        <div class="flex items-center justify-center py-12">
          <i class="pi pi-spin pi-spinner text-4xl text-slate-400"></i>
        </div>
      }

      @if (successMessage()) {
        <div class="fixed bottom-4 right-4 p-4 bg-green-50 border border-green-200 rounded-lg shadow-lg">
          <p class="text-sm text-green-700">
            <i class="pi pi-check-circle mr-2"></i>
            {{ successMessage() }}
          </p>
        </div>
      }

      @if (errorMessage()) {
        <div class="fixed bottom-4 right-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-lg">
          <p class="text-sm text-red-700">
            <i class="pi pi-exclamation-triangle mr-2"></i>
            {{ errorMessage() }}
          </p>
        </div>
      }
    </div>
  `
})
export class NotificationSettingsComponent implements OnInit {
  private notificationService = inject(NotificationService);

  settings = signal<NotificationSettings | null>(null);
  hasChanges = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  orderStatuses = [
    { key: 'orderPending', label: 'Orden Creada (Pendiente)', icon: 'pi pi-clock' },
    { key: 'orderProcessing', label: 'Pago Confirmado (Procesando)', icon: 'pi pi-spinner' },
    { key: 'orderShipped', label: 'Pedido Enviado', icon: 'pi pi-truck' },
    { key: 'orderDelivered', label: 'Pedido Entregado', icon: 'pi pi-check' },
    { key: 'orderCancelled', label: 'Orden Cancelada', icon: 'pi pi-times' }
  ];

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.notificationService.loadSettings().subscribe({
      next: (settings) => this.settings.set(settings)
    });
  }

  isStatusEnabled(key: string): boolean {
    const s = this.settings();
    if (!s) return false;
    return s[key as keyof NotificationSettings] as boolean;
  }

  toggleStatus(key: string): void {
    const s = this.settings();
    if (!s) return;
    const currentValue = s[key as keyof NotificationSettings] as boolean;
    this.settings.update(settings => {
      if (!settings) return null;
      return { ...settings, [key]: !currentValue };
    });
    this.hasChanges.set(true);
  }

  getStatusIconClass(key: string): string {
    switch (key) {
      case 'orderPending':
        return 'bg-yellow-100 text-yellow-600';
      case 'orderProcessing':
        return 'bg-blue-100 text-blue-600';
      case 'orderShipped':
        return 'bg-purple-100 text-purple-600';
      case 'orderDelivered':
        return 'bg-green-100 text-green-600';
      case 'orderCancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  markAsChanged(): void {
    this.hasChanges.set(true);
  }

  saveSettings(): void {
    const s = this.settings();
    if (!s) return;

    this.notificationService.updateSettings(s).subscribe({
      next: (updated) => {
        this.settings.set(updated);
        this.hasChanges.set(false);
        this.showSuccess('Configuración guardada correctamente');
      },
      error: (err) => {
        this.showError(err.error?.message || 'Error al guardar la configuración');
      }
    });
  }

  private showSuccess(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  private showError(message: string): void {
    this.errorMessage.set(message);
    setTimeout(() => this.errorMessage.set(''), 5000);
  }
}
