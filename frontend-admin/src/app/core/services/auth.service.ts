import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { environment } from '../../../environments/environment';

interface User {
  _id: string;
  name?: string;
  nombre?: string;
  email: string;
  isVerified?: boolean;
  verificado?: boolean;
  role: {
    _id: string;
    name: string;
    permissions: string[];
    description?: string;
  };
}

interface LoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken?: string;
    user: User;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  private userSignal = signal<User | null>(null);
  private permissionsSignal = signal<string[]>([]);
  private loadingSignal = signal<boolean>(false);

  readonly user = this.userSignal.asReadonly();
  readonly permissions = this.permissionsSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly isLoading = this.loadingSignal.asReadonly();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const user = JSON.parse(userData) as User;
        this.userSignal.set(user);
        this.loadPermissions();
      } catch {
        this.clearAuth();
      }
    }
  }

  login(email: string, password: string): Observable<User> {
    this.loadingSignal.set(true);
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('accessToken', response.data.accessToken);
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
          }
          localStorage.setItem('user', JSON.stringify(response.data.user));
          this.userSignal.set(response.data.user);
          this.loadPermissions();
        }
        this.loadingSignal.set(false);
      }),
      map(response => response.data?.user as User),
      catchError(error => {
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({
      error: () => {}
    });
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  private clearAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.userSignal.set(null);
    this.permissionsSignal.set([]);
  }

  private loadPermissions(): void {
    const user = this.userSignal();
    if (user?.role?.permissions) {
      this.permissionsSignal.set(user.role.permissions);
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  hasPermission(resource: string, action?: string): boolean {
    const permissions = this.permissionsSignal();
    if (!permissions || permissions.length === 0) return false;
    return permissions.includes(resource) || permissions.includes('*');
  }

  hasRole(roleName: string): boolean {
    const user = this.userSignal();
    return user?.role?.name === roleName;
  }

  refreshToken(): Observable<User> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('accessToken', response.data.accessToken);
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
          }
        }
      }),
      map(response => response.data?.user as User)
    );
  }
}