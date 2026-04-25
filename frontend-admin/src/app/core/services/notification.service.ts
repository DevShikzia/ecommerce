import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  NotificationHistory,
  NotificationSettings,
  NotificationTemplate,
  NotificationStats,
  SendNotificationDto,
  CreateTemplateDto,
  UpdateTemplateDto
} from '../../shared/models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  private templatesSignal = signal<NotificationTemplate[]>([]);
  private historySignal = signal<NotificationHistory[]>([]);
  private settingsSignal = signal<NotificationSettings | null>(null);
  private loadingSignal = signal<boolean>(false);

  readonly templates = this.templatesSignal.asReadonly();
  readonly history = this.historySignal.asReadonly();
  readonly settings = this.settingsSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();

  constructor(private http: HttpClient) {}

  loadTemplates(): Observable<NotificationTemplate[]> {
    this.loadingSignal.set(true);
    return this.http.get<{ success: boolean; data: NotificationTemplate[] }>(`${this.apiUrl}/templates`).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.templatesSignal.set(response.data);
          }
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false)
      }),
      map(response => response.data)
    );
  }

  getTemplate(id: string): Observable<NotificationTemplate> {
    return this.http.get<{ success: boolean; data: NotificationTemplate }>(`${this.apiUrl}/templates/${id}`).pipe(
      map(response => response.data)
    );
  }

  createTemplate(template: CreateTemplateDto): Observable<NotificationTemplate> {
    return this.http.post<{ success: boolean; data: NotificationTemplate }>(`${this.apiUrl}/templates`, template).pipe(
      tap(response => {
        if (response.success) {
          this.templatesSignal.update(templates => [...templates, response.data]);
        }
      }),
      map(response => response.data)
    );
  }

  updateTemplate(id: string, template: UpdateTemplateDto): Observable<NotificationTemplate> {
    return this.http.patch<{ success: boolean; data: NotificationTemplate }>(`${this.apiUrl}/templates/${id}`, template).pipe(
      tap(response => {
        if (response.success) {
          this.templatesSignal.update(templates =>
            templates.map(t => t._id === id ? response.data : t)
          );
        }
      }),
      map(response => response.data)
    );
  }

  deleteTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/templates/${id}`).pipe(
      tap(() => {
        this.templatesSignal.update(templates => templates.filter(t => t._id !== id));
      })
    );
  }

  loadHistory(page: number = 1, limit: number = 20): Observable<{ data: NotificationHistory[]; total: number }> {
    this.loadingSignal.set(true);
    return this.http.get<{ success: boolean; data: NotificationHistory[]; total: number }>(
      `${this.apiUrl}/history`, { params: { page: page.toString(), limit: limit.toString() } }
    ).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.historySignal.set(response.data);
          }
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false)
      }),
      map(response => ({ data: response.data, total: response.total }))
    );
  }

  sendNotification(dto: SendNotificationDto): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/send`, dto);
  }

  loadSettings(): Observable<NotificationSettings> {
    return this.http.get<{ success: boolean; data: NotificationSettings }>(`${this.apiUrl}/settings`).pipe(
      tap(response => {
        if (response.success) {
          this.settingsSignal.set(response.data);
        }
      }),
      map(response => response.data)
    );
  }

  updateSettings(settings: Partial<NotificationSettings>): Observable<NotificationSettings> {
    return this.http.patch<{ success: boolean; data: NotificationSettings }>(`${this.apiUrl}/settings`, settings).pipe(
      tap(response => {
        if (response.success) {
          this.settingsSignal.set(response.data);
        }
      }),
      map(response => response.data)
    );
  }

  getStats(): Observable<NotificationStats> {
    return this.http.get<{ success: boolean; data: NotificationStats }>(`${this.apiUrl}/stats`).pipe(
      map(response => response.data)
    );
  }

  resendNotification(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/resend`, {});
  }
}
