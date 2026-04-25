import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationStats } from '../../shared/models/notification.model';
import { NotificationSendComponent } from './notification-send.component';
import { NotificationTemplatesComponent } from './notification-templates.component';
import { NotificationHistoryComponent } from './notification-history.component';
import { NotificationSettingsComponent } from './notification-settings.component';

type TabType = 'send' | 'templates' | 'history' | 'settings';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    NotificationSendComponent,
    NotificationTemplatesComponent,
    NotificationHistoryComponent,
    NotificationSettingsComponent
  ],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-800">Notificaciones</h1>
        <p class="text-slate-500 text-sm mt-1">Gestiona el envío de emails y WhatsApp</p>
      </div>

      @if (stats()) {
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <i class="pi pi-check-circle text-green-600"></i>
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-800">{{ stats()!.totalSent }}</p>
                <p class="text-xs text-slate-500">Enviados</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <i class="pi pi-times-circle text-red-600"></i>
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-800">{{ stats()!.totalFailed }}</p>
                <p class="text-xs text-slate-500">Fallidos</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="pi pi-envelope text-blue-600"></i>
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-800">{{ stats()!.emailSent }}</p>
                <p class="text-xs text-slate-500">Emails</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <i class="pi pi-whatsapp text-green-600"></i>
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-800">{{ stats()!.whatsappSent }}</p>
                <p class="text-xs text-slate-500">WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      }

      <div class="bg-white rounded-lg shadow-sm border border-slate-200">
        <div class="border-b border-slate-200">
          <nav class="flex gap-1 px-4">
            @for (tab of tabs; track tab.id) {
              <button
                (click)="activeTab.set(tab.id)"
                [class]="activeTab() === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'"
                class="px-4 py-3 text-sm font-medium transition-colors"
              >
                <i [class]="'pi ' + tab.icon + ' mr-2'"></i>
                {{ tab.label }}
              </button>
            }
          </nav>
        </div>

        <div class="p-6">
          @switch (activeTab()) {
            @case ('send') {
              <app-notification-send />
            }
            @case ('templates') {
              <app-notification-templates />
            }
            @case ('history') {
              <app-notification-history />
            }
            @case ('settings') {
              <app-notification-settings />
            }
          }
        </div>
      </div>
    </div>
  `
})
export class NotificationListComponent implements OnInit {
  private notificationService = inject(NotificationService);

  stats = signal<NotificationStats | null>(null);
  activeTab = signal<TabType>('send');

  tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'send', label: 'Enviar', icon: 'pi-send' },
    { id: 'templates', label: 'Plantillas', icon: 'pi-file' },
    { id: 'history', label: 'Historial', icon: 'pi-history' },
    { id: 'settings', label: 'Configuración', icon: 'pi-cog' }
  ];

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.notificationService.getStats().subscribe({
      next: (stats) => this.stats.set(stats)
    });
  }
}
