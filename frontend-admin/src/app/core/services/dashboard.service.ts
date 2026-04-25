import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  ventasMes: number;
  ventasMesAnterior: number;
  pedidosPendientes: number;
  pedidosMesAnterior: number;
  usuariosNuevos: number;
  usuariosSemana: number;
  productosActivos: number;
  productosStockBajo: number;
}

export interface OrderSummary {
  _id: string;
  usuario: { nombre?: string; name?: string; email: string };
  precioTotal: number;
  estado: string;
  fecha: string;
}

export interface SalesChartData {
  labels: string[];
  values: number[];
}

export interface CategorySalesData {
  categoria: string;
  ventas: number;
}

export interface DashboardData {
  stats: DashboardStats;
  orders: OrderSummary[];
  salesChart: SalesChartData;
  categorySales: CategorySalesData[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = environment.apiUrl;

  private loadingSignal = signal<boolean>(false);
  private statsSignal = signal<DashboardStats | null>(null);
  private ordersSignal = signal<OrderSummary[]>([]);
  private salesChartSignal = signal<SalesChartData | null>(null);
  private categorySalesSignal = signal<CategorySalesData[]>([]);

  readonly isLoading = this.loadingSignal.asReadonly();
  readonly stats = this.statsSignal.asReadonly();
  readonly orders = this.ordersSignal.asReadonly();
  readonly salesChart = this.salesChartSignal.asReadonly();
  readonly categorySales = this.categorySalesSignal.asReadonly();

  constructor(private http: HttpClient) {}

  loadDashboard(): void {
    this.loadingSignal.set(true);
    this.http.get<{ success: boolean; data: DashboardData }>(`${this.apiUrl}/dashboard`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.statsSignal.set(response.data.stats);
          this.ordersSignal.set(response.data.orders);
          this.salesChartSignal.set(response.data.salesChart);
          this.categorySalesSignal.set(response.data.categorySales);
        }
        this.loadingSignal.set(false);
      },
      error: (error) => {
        console.error('Error al cargar dashboard:', error);
        this.loadingSignal.set(false);
      }
    });
  }

  getStats(): Observable<{ success: boolean; data: DashboardStats }> {
    return this.http.get<{ success: boolean; data: DashboardStats }>(`${this.apiUrl}/dashboard/stats`);
  }

  getOrders(): Observable<{ success: boolean; data: OrderSummary[] }> {
    return this.http.get<{ success: boolean; data: OrderSummary[] }>(`${this.apiUrl}/dashboard/orders`);
  }

  getSalesChart(): Observable<{ success: boolean; data: SalesChartData }> {
    return this.http.get<{ success: boolean; data: SalesChartData }>(`${this.apiUrl}/dashboard/sales-chart`);
  }

  getCategorySales(): Observable<{ success: boolean; data: CategorySalesData[] }> {
    return this.http.get<{ success: boolean; data: CategorySalesData[] }>(`${this.apiUrl}/dashboard/category-sales`);
  }
}