import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationTemplate, CreateTemplateDto, UpdateTemplateDto } from '../../shared/models/notification.model';

@Component({
  selector: 'app-notification-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-lg font-semibold text-slate-800">Plantillas de Notificación</h3>
          <p class="text-sm text-slate-500">Crea y gestiona plantillas para emails y WhatsApp</p>
        </div>
        <button
          (click)="openCreateDialog()"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
        >
          <i class="pi pi-plus"></i>
          Nueva Plantilla
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (template of templates(); track template._id) {
          <div class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center gap-2">
                <span [class]="template.type === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'"
                  class="px-2 py-1 text-xs font-medium rounded">
                  <i [class]="template.type === 'email' ? 'pi pi-envelope' : 'pi pi-whatsapp'" class="mr-1"></i>
                  {{ template.type === 'email' ? 'Email' : 'WhatsApp' }}
                </span>
                @if (!template.isActive) {
                  <span class="px-2 py-1 text-xs font-medium rounded bg-slate-100 text-slate-500">Inactiva</span>
                }
              </div>
              <div class="flex gap-1">
                <button
                  (click)="openEditDialog(template)"
                  class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <i class="pi pi-pencil text-sm"></i>
                </button>
                <button
                  (click)="confirmDelete(template)"
                  class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <i class="pi pi-trash text-sm"></i>
                </button>
              </div>
            </div>

            <h4 class="font-medium text-slate-800 mb-1">{{ template.name }}</h4>
            @if (template.subject) {
              <p class="text-sm text-slate-500 mb-2">Asunto: {{ template.subject }}</p>
            }
            <p class="text-sm text-slate-600 line-clamp-3">{{ template.body }}</p>

            @if (template.variables.length > 0) {
              <div class="mt-3 flex flex-wrap gap-1">
                @for (variable of template.variables; track variable) {
                  <span class="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded font-mono">
                    {{ getVariableDisplay(variable) }}
                  </span>
                }
              </div>
            }
          </div>
        } @empty {
          <div class="col-span-full text-center py-12 text-slate-500">
            <i class="pi pi-file text-4xl mb-3"></i>
            <p>No hay plantillas creadas</p>
          </div>
        }
      </div>
    </div>

    @if (showDialog()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
          <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-slate-800">
              {{ editingTemplate() ? 'Editar Plantilla' : 'Nueva Plantilla' }}
            </h3>
            <button (click)="closeDialog()" class="text-slate-400 hover:text-slate-600">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input
                type="text"
                [(ngModel)]="formData.name"
                placeholder="Nombre de la plantilla"
                class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select
                  [(ngModel)]="formData.type"
                  class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Canal</label>
                <select
                  [(ngModel)]="formData.channel"
                  class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="resend">Resend</option>
                  <option value="meta">Meta Cloud API</option>
                </select>
              </div>
            </div>

            @if (formData.type === 'email') {
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Asunto</label>
                <input
                  type="text"
                  [(ngModel)]="formData.subject"
                  placeholder="Asunto del email"
                  class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            }

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Mensaje</label>
              <textarea
                [(ngModel)]="formData.body"
                rows="5"
                placeholder="Cuerpo del mensaje. Usa {{ '{' }}{{ '{' }}variable{{ '}' }}{{ '}' }} para variables dinámicas."
                class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Variables (separadas por coma)</label>
              <input
                type="text"
                [ngModel]="formData.variables.join(', ')"
                (ngModelChange)="onVariablesChange($event)"
                placeholder="nombre, ordenId, estado, total"
                class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                [(ngModel)]="formData.isActive"
                class="w-4 h-4 text-blue-600 rounded"
              />
              <label for="isActive" class="text-sm text-slate-700">Activa</label>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              (click)="closeDialog()"
              class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              (click)="saveTemplate()"
              [disabled]="!canSave()"
              [class]="!canSave() ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'"
              class="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors"
            >
              {{ editingTemplate() ? 'Guardar Cambios' : 'Crear Plantilla' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (showDeleteDialog()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <i class="pi pi-exclamation-triangle text-red-600"></i>
            </div>
            <h3 class="text-lg font-semibold text-slate-800">Eliminar Plantilla</h3>
          </div>
          <p class="text-slate-600 mb-6">
            ¿Estás seguro de que deseas eliminar la plantilla "{{ templateToDelete()?.name }}"?
            Esta acción no se puede deshacer.
          </p>
          <div class="flex justify-end gap-3">
            <button
              (click)="cancelDelete()"
              class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              (click)="deleteTemplate()"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class NotificationTemplatesComponent implements OnInit {
  private notificationService = inject(NotificationService);

  templates = signal<NotificationTemplate[]>([]);
  showDialog = signal(false);
  showDeleteDialog = signal(false);
  editingTemplate = signal<NotificationTemplate | null>(null);
  templateToDelete = signal<NotificationTemplate | null>(null);

  formData: CreateTemplateDto = {
    name: '',
    subject: '',
    body: '',
    type: 'email',
    channel: 'resend',
    variables: [],
    isActive: true
  };

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.notificationService.loadTemplates().subscribe({
      next: (templates) => this.templates.set(templates)
    });
  }

  openCreateDialog(): void {
    this.editingTemplate.set(null);
    this.formData = {
      name: '',
      subject: '',
      body: '',
      type: 'email',
      channel: 'resend',
      variables: [],
      isActive: true
    };
    this.showDialog.set(true);
  }

  openEditDialog(template: NotificationTemplate): void {
    this.editingTemplate.set(template);
    this.formData = {
      name: template.name,
      subject: template.subject || '',
      body: template.body,
      type: template.type,
      channel: template.channel,
      variables: [...template.variables],
      isActive: template.isActive
    };
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.editingTemplate.set(null);
  }

  onVariablesChange(value: string): void {
    this.formData.variables = value.split(',').map(v => v.trim()).filter(v => v.length > 0);
  }

  getVariableDisplay(variable: string): string {
    return '{{' + variable + '}}';
  }

  canSave(): boolean {
    return this.formData.name.trim().length > 0 && this.formData.body.trim().length > 0;
  }

  saveTemplate(): void {
    if (!this.canSave()) return;

    const editing = this.editingTemplate();
    if (editing) {
      const updateData: UpdateTemplateDto = {
        name: this.formData.name,
        subject: this.formData.subject || undefined,
        body: this.formData.body,
        isActive: this.formData.isActive
      };
      this.notificationService.updateTemplate(editing._id, updateData).subscribe({
        next: () => {
          this.loadTemplates();
          this.closeDialog();
        }
      });
    } else {
      this.notificationService.createTemplate(this.formData).subscribe({
        next: () => {
          this.loadTemplates();
          this.closeDialog();
        }
      });
    }
  }

  confirmDelete(template: NotificationTemplate): void {
    this.templateToDelete.set(template);
    this.showDeleteDialog.set(true);
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.templateToDelete.set(null);
  }

  deleteTemplate(): void {
    const template = this.templateToDelete();
    if (!template) return;

    this.notificationService.deleteTemplate(template._id).subscribe({
      next: () => {
        this.loadTemplates();
        this.cancelDelete();
      }
    });
  }
}
