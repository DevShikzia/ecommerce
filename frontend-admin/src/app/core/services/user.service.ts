import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = environment.apiUrl;

  private usersSignal = signal<User[]>([]);
  private loadingSignal = signal<boolean>(false);

  readonly users = this.usersSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();

  constructor(private http: HttpClient) {}

  loadUsers(): Observable<User[]> {
    this.loadingSignal.set(true);
    return this.http.get<{ success: boolean; data: User[] }>(`${this.apiUrl}/users`).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.usersSignal.set(response.data);
          }
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false)
      }),
      map(response => response.data)
    );
  }

  getUser(id: string): Observable<User> {
    return this.http.get<{ success: boolean; data: User }>(`${this.apiUrl}/users/${id}`).pipe(
      map(response => response.data)
    );
  }

  updateUser(id: string, data: { rol?: string; isActive?: boolean }): Observable<User> {
    return this.http.put<{ success: boolean; data: User }>(`${this.apiUrl}/users/${id}`, data).pipe(
      tap(response => {
        if (response.success) {
          this.usersSignal.update(users =>
            users.map(u => u._id === id ? response.data : u)
          );
        }
      }),
      map(response => response.data)
    );
  }

  toggleUserStatus(id: string): Observable<User> {
    return this.http.patch<{ success: boolean; data: User }>(`${this.apiUrl}/users/${id}/toggle-status`, {}).pipe(
      tap(response => {
        if (response.success) {
          this.usersSignal.update(users =>
            users.map(u => u._id === id ? response.data : u)
          );
        }
      }),
      map(response => response.data)
    );
  }
}