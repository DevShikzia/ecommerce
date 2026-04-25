import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { RoleService } from '../../core/services/role.service';
import { Role, Permission, CreateRoleDto } from '../../shared/models';

interface PermissionGroup {
  label: string;
  permissions: Permission[];
}

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    CheckboxModule,
    CardModule
  ],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="mb-6">
        <button 
          (click)="goBack()"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4">
          <i class="pi pi-arrow-left"></i>
          Volver a roles
        </button>
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isEdit() ? 'Editar Rol' : 'Nuevo Rol' }}
        </h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <p-card>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <input 
                  pInputText 
                  [(ngModel)]="formData.name"
                  placeholder="Nombre del rol"
                  class="w-full">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea 
                  pInputTextarea 
                  [(ngModel)]="formData.description"
                  placeholder="Descripción del rol"
                  rows="3"
                  class="w-full">
                </textarea>
              </div>
            </div>
          </p-card>
        </div>

        <div class="lg:col-span-3">
          <p-card header="Permisos">
            <div class="space-y-4">
              @for (group of permissionGroups(); track group.label) {
                <div class="border border-gray-200 rounded-lg p-4">
                  <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ group.label }}</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    @for (perm of group.permissions; track perm._id) {
                      <div class="flex items-center gap-2">
                        <p-checkbox 
                          [value]="perm._id"
                          [(ngModel)]="selectedPermissionIds"
                          [inputId]="'perm-' + perm._id">
                        </p-checkbox>
                        <label [for]="'perm-' + perm._id" class="text-sm text-gray-700 cursor-pointer">
                          {{ perm.resource }}
                          <span class="text-xs text-gray-400 ml-1">({{ perm.action }})</span>
                        </label>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </p-card>
        </div>
      </div>

      <div class="flex justify-end gap-4 mt-6">
        <button 
          (click)="goBack()"
          class="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300">
          Cancelar
        </button>
        <button 
          (click)="saveRole()"
          [disabled]="isSaving() || !formData.name"
          class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
          {{ isSaving() ? 'Guardando...' : 'Guardar Rol' }}
        </button>
      </div>
    </div>
  `
})
export class RoleFormComponent implements OnInit {
  private roleService = inject(RoleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  roleId = signal<string | null>(null);
  isEdit = signal(false);
  isSaving = signal(false);
  permissions = this.roleService.permissions;
  selectedPermissionIds: string[] = [];
  permissionGroups = signal<PermissionGroup[]>([]);

  formData = {
    name: '',
    description: ''
  };

  ngOnInit(): void {
    this.loadPermissions();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.roleId.set(id);
      this.isEdit.set(true);
      this.loadRole(id);
    }
  }

  loadPermissions(): void {
    this.roleService.loadPermissions().subscribe({
      next: (permissions) => {
        this.groupPermissions(permissions);
      }
    });
  }

  loadRole(id: string): void {
    this.roleService.getRole(id).subscribe({
      next: (role) => {
        this.formData = {
          name: role.name,
          description: role.description || ''
        };
        this.selectedPermissionIds = role.permissions?.map(p => p._id) || [];
      }
    });
  }

  private groupPermissions(permissions: Permission[]): void {
    const groups: Record<string, Permission[]> = {};
    permissions.forEach(perm => {
      const parts = perm.resource.split('/');
      const category = parts[1] || 'Otros';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(perm);
    });

    const groupList: PermissionGroup[] = Object.entries(groups).map(([label, perms]) => ({
      label: this.formatCategoryLabel(label),
      permissions: perms
    }));

    this.permissionGroups.set(groupList);
  }

  private formatCategoryLabel(category: string): string {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  saveRole(): void {
    if (!this.formData.name) return;

    this.isSaving.set(true);

    const roleData = {
      name: this.formData.name,
      description: this.formData.description,
      permissionIds: this.selectedPermissionIds
    };

    if (this.isEdit() && this.roleId()) {
      this.roleService.updateRole(this.roleId()!, roleData).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/roles']);
        },
        error: () => this.isSaving.set(false)
      });
    } else {
      this.roleService.createRole(roleData as CreateRoleDto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/roles']);
        },
        error: () => this.isSaving.set(false)
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/roles']);
  }
}