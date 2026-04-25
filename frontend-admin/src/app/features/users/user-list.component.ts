import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { UserService } from '../../core/services/user.service';
import { RoleService } from '../../core/services/role.service';
import { User, Role } from '../../shared/models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    DialogModule,
    SelectModule,
    TooltipModule
  ],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Usuarios</h1>
          <p class="text-gray-500 mt-1">Gestión de usuarios del sistema</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="mb-4">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input 
              pInputText 
              type="text" 
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
              placeholder="Buscar usuarios..." 
              class="w-full md:w-64 px-4 py-3 pl-10 border border-gray-300 rounded-xl">
          </span>
        </div>

        <p-table 
          [value]="filteredUsers()" 
          [rows]="10" 
          [paginator]="true"
          [rowsPerPageOptions]="[10, 25, 50]"
          [loading]="isLoading()"
          styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr class="bg-gray-50">
              <th class="text-xs font-semibold text-gray-600 uppercase">Nombre</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Rol</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Estado</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Verificado</th>
              <th class="text-xs font-semibold text-gray-600 uppercase text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-user>
            <tr class="hover:bg-gray-50">
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-blue-600 font-medium">
                      {{ user.nombre?.charAt(0)?.toUpperCase() || 'U' }}
                    </span>
                  </div>
                  <span class="font-medium text-gray-800">{{ user.nombre }}</span>
                </div>
              </td>
              <td class="text-gray-600">{{ user.email }}</td>
              <td>
                <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                  {{ user.rol?.nombre || 'Sin rol' }}
                </span>
              </td>
              <td>
                <p-tag 
                  [value]="user.isActive ? 'Activo' : 'Inactivo'"
                  [severity]="user.isActive ? 'success' : 'secondary'">
                </p-tag>
              </td>
              <td>
                <p-tag 
                  [value]="user.verificado ? 'Verificado' : 'Pendiente'"
                  [severity]="user.verificado ? 'info' : 'secondary'">
                </p-tag>
              </td>
              <td>
                <div class="flex items-center justify-center gap-2">
                  <button 
                    (click)="openEditDialog(user)"
                    class="p-button p-button-sm p-button-text p-button-rounded"
                    pTooltip="Editar rol">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button 
                    (click)="toggleUserStatus(user)"
                    class="p-button p-button-sm p-button-text p-button-rounded"
                    [class.p-button-danger]="user.isActive"
                    [pTooltip]="user.isActive ? 'Desactivar' : 'Activar'">
                    <i [class]="user.isActive ? 'pi pi-ban' : 'pi pi-check'"></i>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-12">
                <i class="pi pi-users text-4xl text-gray-300 mb-3 block"></i>
                <p class="text-gray-500">No hay usuarios registrados</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <p-dialog 
        header="Editar Usuario" 
        [(visible)]="editDialogVisible" 
        [modal]="true" 
        [style]="{width: '450px'}"
        [closable]="false">
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-500 mb-1">Usuario</p>
            <p class="font-medium">{{ selectedUser()?.nombre }}</p>
            <p class="text-sm text-gray-400">{{ selectedUser()?.email }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rol</label>
            <p-select 
              [(ngModel)]="selectedRoleId"
              [options]="roles()"
              optionLabel="nombre"
              optionValue="_id"
              placeholder="Seleccionar rol"
              class="w-full">
            </p-select>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button 
            (click)="editDialogVisible = false"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300">
            Cancelar
          </button>
          <button 
            (click)="saveUserRole()"
            class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            Guardar
          </button>
        </div>
      </p-dialog>
    </div>
  `
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);

  users = this.userService.users;
  isLoading = this.userService.isLoading;
  roles = signal<Role[]>([]);
  searchTerm = '';
  editDialogVisible = false;
  selectedUser = signal<User | null>(null);
  selectedRoleId = '';

  filteredUsers = signal<User[]>([]);

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.userService.loadUsers().subscribe({
      next: () => this.updateFilteredUsers()
    });
  }

  loadRoles(): void {
    this.roleService.loadRoles().subscribe({
      next: (roles) => this.roles.set(roles)
    });
  }

  onSearch(): void {
    this.updateFilteredUsers();
  }

  private updateFilteredUsers(): void {
    const term = this.searchTerm.toLowerCase();
    const users = this.users();
    if (!term) {
      this.filteredUsers.set(users);
    } else {
      this.filteredUsers.set(
        users.filter(u => 
          u.nombre?.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
        )
      );
    }
  }

  openEditDialog(user: User): void {
    this.selectedUser.set(user);
    this.selectedRoleId = user.rol?._id || '';
    this.editDialogVisible = true;
  }

  saveUserRole(): void {
    const user = this.selectedUser();
    if (user && this.selectedRoleId) {
      this.userService.updateUser(user._id, { rol: this.selectedRoleId }).subscribe({
        next: () => {
          this.editDialogVisible = false;
          this.updateFilteredUsers();
        }
      });
    }
  }

  toggleUserStatus(user: User): void {
    this.userService.toggleUserStatus(user._id).subscribe({
      next: () => this.updateFilteredUsers()
    });
  }
}