import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderStatus, UpdateOrderStatusDto } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = environment.apiUrl;

  private ordersSignal = signal<Order[]>([]);
  private loadingSignal = signal<boolean>(false);

  readonly orders = this.ordersSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();

  constructor(private http: HttpClient) {}

  loadOrders(): Observable<Order[]> {
    this.loadingSignal.set(true);
    return this.http.get<{ success: boolean; data: Order[] }>(`${this.apiUrl}/orders`).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.ordersSignal.set(response.data);
          }
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false)
      }),
      map(response => response.data)
    );
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<{ success: boolean; data: Order }>(`${this.apiUrl}/orders/${id}`).pipe(
      map(response => response.data)
    );
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<{ success: boolean; data: Order }>(`${this.apiUrl}/orders/${id}/status`, { status } as UpdateOrderStatusDto).pipe(
      tap(response => {
        if (response.success) {
          this.ordersSignal.update(orders =>
            orders.map(o => o._id === id ? response.data : o)
          );
        }
      }),
      map(response => response.data)
    );
  }

  resendNotification(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/orders/${id}/notify`, {});
  }
}