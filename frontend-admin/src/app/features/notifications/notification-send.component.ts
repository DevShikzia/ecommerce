import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { OrderService } from '../../core/services/order.service';
import { UserService } from '../../core/services/user.service';
import { NotificationTemplate, SendNotificationDto, NotificationType } from '../../shared/models/notification.model';
import { Order } from '../../shared/models/order.model';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-notification-send',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-slate-50 rounded-lg p-5 border border-slate-200">
        <h3 class="text-lg font-semibold text-slate-800 mb-4">Nueva Notificación</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Tipo de notificación</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="email"
                  [(ngModel)]="notificationType"
                  (ngModelChange)="onTypeChange()"
                  class="w-4 h-4 text-blue-600"
                />
                <span class="text-sm text-slate-600">
                  <i class="pi pi-envelope mr-1"></i>Email
                </span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="whatsapp"
                  [(ngModel)]="notificationType"
                  (ngModelChange)="onTypeChange()"
                  class="w-4 h-4 text-green-600"
                />
                <span class="text-sm text-slate-600">
                  <i class="pi pi-whatsapp mr-1"></i>WhatsApp
                </span>
              </label>
            </div>
          </div>

          @if (notificationType === 'email') {
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Destinatarios</label>
              <div class="flex gap-2 mb-2">
                <button
                  (click)="recipientType.set('users')"
                  [class]="recipientType() === 'users' ? 'bg-blue-100 border-blue-600 text-blue-700' : 'bg-white border-slate-300 text-slate-600'"
                  class="px-3 py-1.5 text-xs font-medium border rounded-md transition-colors"
                >
                  Usuarios
                </button>
                <button
                  (click)="recipientType.set('orders')"
                  [class]="recipientType() === 'orders' ? 'bg-blue-100 border-blue-600 text-blue-700' : 'bg-white border-slate-300 text-slate-600'"
                  class="px-3 py-1.5 text-xs font-medium border rounded-md transition-colors"
                >
                  Órdenes
                </button>
                <button
                  (click)="recipientType.set('custom')"
                  [class]="recipientType() === 'custom' ? 'bg-blue-100 border-blue-600 text-blue-700' : 'bg-white border-slate-300 text-slate-600'"
                  class="px-3 py-1.5 text-xs font-medium border rounded-md transition-colors"
                >
                  Personalizado
                </button>
              </div>

              @switch (recipientType()) {
                @case ('users') {
                  <select
                    [(ngModel)]="selectedUserId"
                    class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar usuario...</option>
                    @for (user of users(); track user._id) {
                      <option [value]="user._id">{{ user.nombre || user.email }} ({{ user.email }})</option>
                    }
                  </select>
                }
                @case ('orders') {
                  <select
                    [(ngModel)]="selectedOrderId"
                    class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar orden...</option>
                    @for (order of orders(); track order._id) {
                      <option [value]="order._id">
                        #{{ order._id.slice(-6) }} - {{ order.user?.email }} - {{ order.status }}
                      </option>
                    }
                  </select>
                }
                @case ('custom') {
                  <input
                    type="email"
                    [(ngModel)]="customRecipient"
                    placeholder="email@ejemplo.com"
                    class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                }
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Asunto</label>
              <input
                type="text"
                [(ngModel)]="subject"
                placeholder="Asunto del email"
                class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          } @else {
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Teléfono destinatario</label>
              <input
                type="tel"
                [(ngModel)]="phoneNumber"
                placeholder="+54 11 1234-5678"
                class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          }

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Plantilla (opcional)</label>
            <select
              [(ngModel)]="selectedTemplateId"
              (ngModelChange)="onTemplateSelect()"
              class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sin plantilla</option>
              @for (template of templates(); track template._id) {
                @if (template.type === notificationType && template.isActive) {
                  <option [value]="template._id">{{ template.name }}</option>
                }
              }
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Mensaje</label>
            <textarea
              [(ngModel)]="message"
              rows="6"
              placeholder="Escribe tu mensaje aquí..."
              class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            ></textarea>
            @if (templates().length > 0) {
              <p class="text-xs text-slate-500 mt-1">
                Variables disponibles: {{ '{' }}{{ '{' }}nombre{{ '}' }}{{ '}' }}, {{ '{' }}{{ '{' }}ordenId{{ '}' }}{{ '}' }}, {{ '{' }}{{ '{' }}estado{{ '}' }}{{ '}' }}, {{ '{' }}{{ '{' }}total{{ '}' }}{{ '}' }}
              </p>
            }
          </div>

          <button
            (click)="sendNotification()"
            [disabled]="isSending() || !canSend()"
            [class]="isSending() || !canSend()
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'"
            class="w-full py-2.5 rounded-md text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
          >
            @if (isSending()) {
              <i class="pi pi-spin pi-spinner"></i>
              Enviando...
            } @else {
              <i class="pi pi-send"></i>
              Enviar Notificación
            }
          </button>
        </div>
      </div>

      <div class="bg-slate-50 rounded-lg p-5 border border-slate-200">
        <h3 class="text-lg font-semibold text-slate-800 mb-4">Vista Previa</h3>

        <div class="bg-white rounded-lg border border-slate-200 overflow-hidden">
          @if (notificationType === 'email') {
            <div class="bg-slate-100 px-4 py-3 border-b border-slate-200">
              <p class="text-xs text-slate-500">Para:</p>
              <p class="text-sm font-medium text-slate-800">{{ getRecipientDisplay() }}</p>
            </div>
            <div class="bg-slate-100 px-4 py-3 border-b border-slate-200">
              <p class="text-xs text-slate-500">Asunto:</p>
              <p class="text-sm font-medium text-slate-800">{{ subject || 'Sin asunto' }}</p>
            </div>
          } @else {
            <div class="bg-green-50 px-4 py-3 border-b border-green-100">
              <p class="text-xs text-green-600">
                <i class="pi pi-whatsapp mr-1"></i>WhatsApp
              </p>
              <p class="text-sm font-medium text-slate-800">{{ phoneNumber || 'Sin teléfono' }}</p>
            </div>
          }

          <div class="p-4">
            <p class="text-sm text-slate-700 whitespace-pre-wrap">{{ message || 'Sin mensaje' }}</p>
          </div>
        </div>

        @if (errorMessage()) {
          <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-600">
              <i class="pi pi-exclamation-triangle mr-1"></i>
              {{ errorMessage() }}
            </p>
          </div>
        }

        @if (successMessage()) {
          <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p class="text-sm text-green-600">
              <i class="pi pi-check-circle mr-1"></i>
              {{ successMessage() }}
            </p>
          </div>
        }
      </div>
    </div>
  `
})
export class NotificationSendComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private orderService = inject(OrderService);
  private userService = inject(UserService);

  notificationType: NotificationType = 'email';
  recipientType = signal<'users' | 'orders' | 'custom'>('users');
  selectedUserId = '';
  selectedOrderId = '';
  customRecipient = '';
  phoneNumber = '';
  subject = '';
  message = '';
  selectedTemplateId = '';

  templates = signal<NotificationTemplate[]>([]);
  orders = signal<Order[]>([]);
  users = signal<User[]>([]);

  isSending = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    this.loadTemplates();
    this.loadOrders();
    this.loadUsers();
  }

  loadTemplates(): void {
    this.notificationService.loadTemplates().subscribe({
      next: (templates) => this.templates.set(templates)
    });
  }

  loadOrders(): void {
    this.orderService.loadOrders().subscribe({
      next: (orders) => this.orders.set(orders)
    });
  }

  loadUsers(): void {
    this.userService.loadUsers().subscribe({
      next: (users) => this.users.set(users)
    });
  }

  onTypeChange(): void {
    this.selectedTemplateId = '';
    this.message = '';
    this.subject = '';
  }

  onTemplateSelect(): void {
    if (!this.selectedTemplateId) return;

    const template = this.templates().find(t => t._id === this.selectedTemplateId);
    if (template) {
      this.subject = template.subject || '';
      this.message = template.body;
    }
  }

  getRecipientDisplay(): string {
    if (this.recipientType() === 'users' && this.selectedUserId) {
      const user = this.users().find(u => u._id === this.selectedUserId);
      return user?.email || this.selectedUserId;
    }
    if (this.recipientType() === 'orders' && this.selectedOrderId) {
      const order = this.orders().find(o => o._id === this.selectedOrderId);
      return order?.user?.email || 'Orden sin email';
    }
    if (this.recipientType() === 'custom' && this.customRecipient) {
      return this.customRecipient;
    }
    return 'Sin destinatario';
  }

  canSend(): boolean {
    if (!this.message.trim()) return false;

    if (this.notificationType === 'email') {
      return this.recipientType() === 'users' && !!this.selectedUserId ||
             this.recipientType() === 'orders' && !!this.selectedOrderId ||
             this.recipientType() === 'custom' && !!this.customRecipient;
    } else {
      return !!this.phoneNumber.trim();
    }
  }

  sendNotification(): void {
    if (!this.canSend()) return;

    this.isSending.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    let recipient = '';
    let orderId: string | undefined;
    let userId: string | undefined;

    if (this.notificationType === 'email') {
      if (this.recipientType() === 'users') {
        recipient = this.users().find(u => u._id === this.selectedUserId)?.email || '';
        userId = this.selectedUserId;
      } else if (this.recipientType() === 'orders') {
        recipient = this.orders().find(o => o._id === this.selectedOrderId)?.user?.email || '';
        orderId = this.selectedOrderId;
      } else {
        recipient = this.customRecipient;
      }
    } else {
      recipient = this.phoneNumber;
    }

    const dto: SendNotificationDto = {
      type: this.notificationType,
      recipient,
      subject: this.notificationType === 'email' ? this.subject : undefined,
      body: this.message,
      orderId,
      userId,
      templateId: this.selectedTemplateId || undefined
    };

    this.notificationService.sendNotification(dto).subscribe({
      next: (response) => {
        this.isSending.set(false);
        if (response.success) {
          this.successMessage.set(response.message);
          this.resetForm();
        } else {
          this.errorMessage.set(response.message);
        }
      },
      error: (err) => {
        this.isSending.set(false);
        this.errorMessage.set(err.error?.message || 'Error al enviar la notificación');
      }
    });
  }

  private resetForm(): void {
    this.selectedUserId = '';
    this.selectedOrderId = '';
    this.customRecipient = '';
    this.phoneNumber = '';
    this.subject = '';
    this.message = '';
    this.selectedTemplateId = '';
  }
}
