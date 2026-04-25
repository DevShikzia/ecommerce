import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Configuracion } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly apiUrl = environment.apiUrl;

  private configSignal = signal<Configuracion | null>(null);
  private loadingSignal = signal<boolean>(false);

  readonly config = this.configSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();

  readonly nombreTienda = () => this.configSignal()?.nombreTienda || 'E-commerce';
  readonly logo = () => this.configSignal()?.logo || '/assets/default-logo.png';
  readonly colores = () => this.configSignal()?.colores || {
    primario: '#3b82f6',
    secundario: '#64748b',
    acento: '#f59e0b',
    fondo: '#f8fafc',
    texto: '#1e293b'
  };

  constructor(private http: HttpClient) {
    this.loadConfig();
  }

  loadConfig(): void {
    this.loadingSignal.set(true);
    this.http.get<{ success: boolean; data?: Configuracion }>(`${this.apiUrl}/config`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.configSignal.set(response.data);
          this.applyTheme(response.data);
        }
        this.loadingSignal.set(false);
      },
      error: (error) => {
        console.error('Error al cargar configuración:', error);
        this.loadingSignal.set(false);
      }
    });
  }

  updateConfig(config: Partial<Configuracion>): Observable<{ success: boolean; data: Configuracion }> {
    return this.http.put<{ success: boolean; data: Configuracion }>(`${this.apiUrl}/config`, config).pipe(
      tap(response => {
        if (response.success) {
          this.configSignal.set(response.data);
          this.applyTheme(response.data);
        }
      })
    );
  }

  private applyTheme(config: Configuracion): void {
    const root = document.documentElement;
    if (config?.colores) {
      root.style.setProperty('--primary-color', config.colores.primario || '#3b82f6');
      root.style.setProperty('--secondary-color', config.colores.secundario || '#64748b');
      root.style.setProperty('--accent-color', config.colores.acento || '#f59e0b');
      root.style.setProperty('--surface-ground', config.colores.fondo || '#f8fafc');
      root.style.setProperty('--text-color', config.colores.texto || '#1e293b');
    }
    if (config?.nombreTienda) {
      document.title = config.nombreTienda;
    }
  }
}