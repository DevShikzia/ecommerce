import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, Permission, CreateRoleDto, UpdateRoleDto } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly apiUrl = environment.apiUrl;

  private rolesSignal = signal<Role[]>([]);
  private permissionsSignal = signal<Permission[]>([]);
  private loadingSignal = signal<boolean>(false);

  readonly roles = this.rolesSignal.asReadonly();
  readonly permissions = this.permissionsSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();

  constructor(private http: HttpClient) {}

  loadRoles(): Observable<Role[]> {
    this.loadingSignal.set(true);
    return this.http.get<{ success: boolean; data: Role[] }>(`${this.apiUrl}/roles`).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.rolesSignal.set(response.data);
          }
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false)
      }),
      map(response => response.data)
    );
  }

  loadPermissions(): Observable<Permission[]> {
    return this.http.get<{ success: boolean; data: Permission[] }>(`${this.apiUrl}/permissions`).pipe(
      tap(response => {
        if (response.success) {
          this.permissionsSignal.set(response.data);
        }
      }),
      map(response => response.data)
    );
  }

  getRole(id: string): Observable<Role> {
    return this.http.get<{ success: boolean; data: Role }>(`${this.apiUrl}/roles/${id}`).pipe(
      map(response => response.data)
    );
  }

  createRole(role: CreateRoleDto): Observable<Role> {
    return this.http.post<{ success: boolean; data: Role }>(`${this.apiUrl}/roles`, role).pipe(
      tap(response => {
        if (response.success) {
          this.rolesSignal.update(roles => [...roles, response.data]);
        }
      }),
      map(response => response.data)
    );
  }

  updateRole(id: string, role: UpdateRoleDto): Observable<Role> {
    return this.http.put<{ success: boolean; data: Role }>(`${this.apiUrl}/roles/${id}`, role).pipe(
      tap(response => {
        if (response.success) {
          this.rolesSignal.update(roles =>
            roles.map(r => r._id === id ? response.data : r)
          );
        }
      }),
      map(response => response.data)
    );
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/roles/${id}`).pipe(
      tap(() => {
        this.rolesSignal.update(roles => roles.filter(r => r._id !== id));
      }),
      map(() => undefined)
    );
  }
}