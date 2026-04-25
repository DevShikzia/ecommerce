import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { RoleService } from '../../core/services/role.service';
import { Role } from '../../shared/models';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule
  ],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Roles y Permisos</h1>
          <p class="text-gray-500 mt-1">Configuración de roles y permisos del sistema</p>
        </div>
        <button 
          (click)="navigateToCreate()"
          class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 transition-colors">
          <i class="pi pi-shield"></i>
          Nuevo Rol
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p-table 
          [value]="roles()" 
          [rows]="10" 
          [paginator]="true"
          [loading]="isLoading()"
          styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr class="bg-gray-50">
              <th class="text-xs font-semibold text-gray-600 uppercase">Nombre</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Permisos</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Descripción</th>
              <th class="text-xs font-semibold text-gray-600 uppercase text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-role>
            <tr class="hover:bg-gray-50">
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i class="pi pi-shield text-purple-600"></i>
                  </div>
                  <span class="font-medium text-gray-800">{{ role.name }}</span>
                </div>
              </td>
              <td>
                <div class="flex flex-wrap gap-1">
                  @for (perm of role.permissions?.slice(0, 3); track perm._id) {
                    <span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      {{ perm.resource }}
                    </span>
                  }
                  @if ((role.permissions?.length || 0) > 3) {
                    <span class="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
                      +{{ (role.permissions?.length || 0) - 3 }}
                    </span>
                  }
                </div>
              </td>
              <td class="text-gray-600 text-sm">
                {{ role.description || 'Sin descripción' }}
              </td>
              <td>
                <div class="flex items-center justify-center gap-2">
                  <button 
                    (click)="navigateToEdit(role._id)"
                    class="p-button p-button-sm p-button-text p-button-rounded"
                    pTooltip="Editar">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button 
                    (click)="confirmDelete(role)"
                    class="p-button p-button-sm p-button-text p-button-rounded p-button-danger"
                    pTooltip="Eliminar">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="4" class="text-center py-12">
                <i class="pi pi-shield text-4xl text-gray-300 mb-3 block"></i>
                <p class="text-gray-500">No hay roles configurados</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <p-dialog 
        header="Confirmar eliminación" 
        [(visible)]="deleteDialogVisible" 
        [modal]="true" 
        [style]="{width: '400px'}"
        [closable]="false">
        <p>¿Estás seguro de eliminar el rol "{{ roleToDelete()?.name }}"?</p>
        <div class="flex justify-end gap-2 mt-4">
          <button 
            (click)="deleteDialogVisible = false"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300">
            Cancelar
          </button>
          <button 
            (click)="deleteRole()"
            class="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">
            Eliminar
          </button>
        </div>
      </p-dialog>
    </div>
  `
})
export class RoleListComponent implements OnInit {
  private roleService = inject(RoleService);
  private router = inject(Router);

  roles = this.roleService.roles;
  isLoading = this.roleService.isLoading;
  deleteDialogVisible = false;
  roleToDelete = signal<Role | null>(null);

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.loadRoles().subscribe();
  }

  navigateToCreate(): void {
    this.router.navigate(['/roles/nuevo']);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/roles/editar', id]);
  }

  confirmDelete(role: Role): void {
    this.roleToDelete.set(role);
    this.deleteDialogVisible = true;
  }

  deleteRole(): void {
    const role = this.roleToDelete();
    if (role) {
      this.roleService.deleteRole(role._id).subscribe({
        next: () => {
          this.deleteDialogVisible = false;
          this.roleToDelete.set(null);
        }
      });
    }
  }
}