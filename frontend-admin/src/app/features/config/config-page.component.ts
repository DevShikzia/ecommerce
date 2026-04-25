import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ColorPickerModule } from 'primeng/colorpicker';
import { FileUploadModule } from 'primeng/fileupload';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { ConfigService } from '../../core/services/config.service';
import { Configuracion, MetodoPago, ReglaEnvio } from '../../shared/models';

@Component({
  selector: 'app-config-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    ColorPickerModule,
    FileUploadModule,
    CheckboxModule,
    DialogModule
  ],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Configuración</h1>
        <p class="text-gray-500 mt-1">Configuración general del e-commerce</p>
      </div>

      <div class="space-y-6">
        <p-card header="Información de la Tienda">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de la tienda</label>
              <input 
                pInputText 
                [(ngModel)]="storeName"
                placeholder="Mi Tienda"
                class="w-full">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
              <input 
                pInputText 
                [(ngModel)]="logoUrl"
                placeholder="https://..."
                class="w-full">
            </div>
          </div>
          <div class="mt-4">
            <p-fileUpload
              mode="basic"
              [maxFileSize]="2000000"
              accept="image/*"
              chooseLabel="Subir Logo"
              (onSelect)="onLogoUpload($event)"
              [auto]="true">
            </p-fileUpload>
          </div>
        </p-card>

        <p-card header="Colores del Tema">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Primario</label>
              <div class="flex items-center gap-2">
                <input 
                  type="color" 
                  [(ngModel)]="colores.primario"
                  class="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer">
                <input 
                  pInputText 
                  [(ngModel)]="colores.primario"
                  class="flex-1 font-mono text-sm">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Secundario</label>
              <div class="flex items-center gap-2">
                <input 
                  type="color" 
                  [(ngModel)]="colores.secundario"
                  class="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer">
                <input 
                  pInputText 
                  [(ngModel)]="colores.secundario"
                  class="flex-1 font-mono text-sm">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Acento</label>
              <div class="flex items-center gap-2">
                <input 
                  type="color" 
                  [(ngModel)]="colores.acento"
                  class="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer">
                <input 
                  pInputText 
                  [(ngModel)]="colores.acento"
                  class="flex-1 font-mono text-sm">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fondo</label>
              <div class="flex items-center gap-2">
                <input 
                  type="color" 
                  [(ngModel)]="colores.fondo"
                  class="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer">
                <input 
                  pInputText 
                  [(ngModel)]="colores.fondo"
                  class="flex-1 font-mono text-sm">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Texto</label>
              <div class="flex items-center gap-2">
                <input 
                  type="color" 
                  [(ngModel)]="colores.texto"
                  class="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer">
                <input 
                  pInputText 
                  [(ngModel)]="colores.texto"
                  class="flex-1 font-mono text-sm">
              </div>
            </div>
          </div>
        </p-card>

        <p-card header="Métodos de Pago">
          <div class="space-y-4">
            @for (method of paymentMethods(); track method.id) {
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i class="pi pi-credit-card text-blue-600"></i>
                  </div>
                  <div>
                    <p class="font-medium text-gray-800">{{ method.nombre }}</p>
                    <p class="text-xs text-gray-500">{{ method.id }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <span class="text-sm text-gray-600">Activo</span>
                    <input 
                      type="checkbox" 
                      [(ngModel)]="method.activo"
                      class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500">
                  </label>
                  <button 
                    (click)="removePaymentMethod(method.id)"
                    class="p-button p-button-text p-button-danger p-button-sm">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </div>
            }

            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div class="flex gap-3">
                <input 
                  pInputText 
                  [(ngModel)]="newPaymentMethod"
                  placeholder="Nombre del método"
                  class="flex-1">
                <button 
                  (click)="addPaymentMethod()"
                  [disabled]="!newPaymentMethod"
                  class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </p-card>

        <p-card header="Reglas de Envío">
          <div class="space-y-4">
            @for (rule of shippingRules(); track rule.id) {
              <div class="p-4 bg-gray-50 rounded-lg">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <p class="font-medium text-gray-800">{{ rule.nombre }}</p>
                    <p class="text-sm text-gray-500">
                      {{ rule.precio | currency:'ARS':'symbol':'1.0-0' }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <span class="text-sm text-gray-600">Activo</span>
                      <input 
                      type="checkbox" 
                      [(ngModel)]="rule.activo"
                      class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500">
                    </label>
                    <button 
                      (click)="removeShippingRule(rule.id)"
                      class="p-button p-button-text p-button-danger p-button-sm">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="text-xs text-gray-500">
                  @if (rule.condiciones?.zonas?.length) {
                    <span class="mr-3">Zonas: {{ rule.condiciones.zonas.join(', ') }}</span>
                  }
                  @if (rule.condiciones?.precioMin != null) {
                    <span class="mr-3">Min: {{ rule.condiciones.precioMin | currency:'ARS':'symbol':'1.0-0' }}</span>
                  }
                  @if (rule.condiciones?.precioMax != null) {
                    <span>Max: {{ rule.condiciones.precioMax | currency:'ARS':'symbol':'1.0-0' }}</span>
                  }
                </div>
              </div>
            }

            <button 
              (click)="showShippingDialog = true"
              class="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
              <i class="pi pi-plus mr-2"></i>
              Agregar regla de envío
            </button>
          </div>
        </p-card>

        <div class="flex justify-end gap-4">
          <button 
            (click)="resetConfig()"
            class="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300">
            Restaurar
          </button>
          <button 
            (click)="saveConfig()"
            [disabled]="isSaving()"
            class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
            {{ isSaving() ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>

      <p-dialog 
        header="Nueva Regla de Envío" 
        [(visible)]="showShippingDialog" 
        [modal]="true" 
        [style]="{width: '450px'}"
        [closable]="false">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input pInputText [(ngModel)]="newShippingRule.nombre" class="w-full">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Precio (ARS)</label>
            <input pInputText type="number" [(ngModel)]="newShippingRule.precio" class="w-full">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Zonas (separadas por coma)</label>
            <input pInputText [(ngModel)]="newShippingRule.zonas" class="w-full" placeholder="CABA, GBA, Interior">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Precio mínimo</label>
              <input pInputText type="number" [(ngModel)]="newShippingRule.precioMin" class="w-full">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Precio máximo</label>
              <input pInputText type="number" [(ngModel)]="newShippingRule.precioMax" class="w-full">
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button 
            (click)="showShippingDialog = false"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300">
            Cancelar
          </button>
          <button 
            (click)="addShippingRule()"
            class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            Agregar
          </button>
        </div>
      </p-dialog>
    </div>
  `
})
export class ConfigPageComponent implements OnInit {
  private configService = inject(ConfigService);

  config = this.configService.config;
  isSaving = signal(false);

  storeName = '';
  logoUrl = '';

  colores = {
    primario: '#3b82f6',
    secundario: '#64748b',
    acento: '#f59e0b',
    fondo: '#f8fafc',
    texto: '#1e293b'
  };

  paymentMethods = signal<MetodoPago[]>([]);
  shippingRules = signal<ReglaEnvio[]>([]);

  newPaymentMethod = '';
  showShippingDialog = false;
  newShippingRule = {
    nombre: '',
    precio: 0,
    zonas: '',
    precioMin: null as number | null,
    precioMax: null as number | null
  };

  ngOnInit(): void {
    const cfg = this.config();
    if (cfg) {
      this.storeName = cfg.nombreTienda || '';
      this.logoUrl = cfg.logo || '';
      if (cfg.colores) {
        this.colores = { ...cfg.colores };
      }
      if (cfg.metodosPago) {
        this.paymentMethods.set([...cfg.metodosPago]);
      }
      if (cfg.reglasEnvio) {
        this.shippingRules.set([...cfg.reglasEnvio]);
      }
    }
  }

  onLogoUpload(event: { currentFiles: File[] }): void {
    const file = event.currentFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  addPaymentMethod(): void {
    if (this.newPaymentMethod.trim()) {
      const newMethod: MetodoPago = {
        id: this.newPaymentMethod.toLowerCase().replace(/\s+/g, '-'),
        nombre: this.newPaymentMethod.trim(),
        activo: true
      };
      this.paymentMethods.update(methods => [...methods, newMethod]);
      this.newPaymentMethod = '';
    }
  }

  removePaymentMethod(id: string): void {
    this.paymentMethods.update(methods => methods.filter(m => m.id !== id));
  }

  addShippingRule(): void {
    const rule: ReglaEnvio = {
      id: `rule-${Date.now()}`,
      nombre: this.newShippingRule.nombre,
      activo: true,
      precio: this.newShippingRule.precio,
      condiciones: {
        zonas: this.newShippingRule.zonas.split(',').map(z => z.trim()).filter(z => z),
        precioMin: this.newShippingRule.precioMin ?? undefined,
        precioMax: this.newShippingRule.precioMax ?? undefined
      }
    };
    this.shippingRules.update(rules => [...rules, rule]);
    this.newShippingRule = { nombre: '', precio: 0, zonas: '', precioMin: null, precioMax: null };
    this.showShippingDialog = false;
  }

  removeShippingRule(id: string): void {
    this.shippingRules.update(rules => rules.filter(r => r.id !== id));
  }

  resetConfig(): void {
    this.configService.loadConfig();
    const cfg = this.config();
    if (cfg?.colores) {
      this.colores = { ...cfg.colores };
    }
    if (cfg?.metodosPago) {
      this.paymentMethods.set([...cfg.metodosPago]);
    }
    if (cfg?.reglasEnvio) {
      this.shippingRules.set([...cfg.reglasEnvio]);
    }
  }

  saveConfig(): void {
    this.isSaving.set(true);

    const updateData = {
      nombreTienda: this.storeName,
      logo: this.logoUrl,
      colores: this.colores,
      metodosPago: this.paymentMethods(),
      reglasEnvio: this.shippingRules()
    };

    this.configService.updateConfig(updateData).subscribe({
      next: () => this.isSaving.set(false),
      error: () => this.isSaving.set(false)
    });
  }
}