import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { DashboardService, DashboardStats, OrderSummary, CategorySalesData } from '../../core/services/dashboard.service';
import { ConfigService } from '../../core/services/config.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, ChartModule, TagModule],
  template: `
    <div class="p-6 bg-slate-50 min-h-screen">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800">
          Bienvenido, {{ authService.user()?.name || authService.user()?.nombre }}
        </h1>
        <p class="text-slate-500 mt-1">Panel de administración de {{ configService.nombreTienda() }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Ventas del mes</p>
              <p class="text-3xl font-bold text-slate-800 mt-1">{{ formatCurrency(stats()?.ventasMes || 0) }}</p>
              <p class="text-xs mt-1" [class.text-green-600]="getVentasGrowth() > 0" [class.text-red-600]="getVentasGrowth() < 0">
                {{ getVentasGrowth() > 0 ? '+' : '' }}{{ getVentasGrowth() | number:'1.0-0' }}% vs mes anterior
              </p>
            </div>
            <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <i class="pi pi-dollar text-2xl text-blue-600"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Pedidos pendientes</p>
              <p class="text-3xl font-bold text-slate-800 mt-1">{{ stats()?.pedidosPendientes || 0 }}</p>
              <p class="text-xs text-slate-400 mt-1">{{ stats()?.pedidosMesAnterior || 0 }} el mes pasado</p>
            </div>
            <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <i class="pi pi-shopping-cart text-2xl text-green-600"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Productos activos</p>
              <p class="text-3xl font-bold text-slate-800 mt-1">{{ stats()?.productosActivos || 0 }}</p>
              <p class="text-xs" [class.text-orange-600]="(stats()?.productosStockBajo || 0) > 0" [class.text-slate-400]="(stats()?.productosStockBajo || 0) === 0">
                {{ stats()?.productosStockBajo || 0 }} en stock bajo
              </p>
            </div>
            <div class="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
              <i class="pi pi-box text-2xl text-orange-600"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Usuarios nuevos</p>
              <p class="text-3xl font-bold text-slate-800 mt-1">{{ stats()?.usuariosNuevos || 0 }}</p>
              <p class="text-xs text-green-600 mt-1">+{{ stats()?.usuariosSemana || 0 }} esta semana</p>
            </div>
            <div class="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
              <i class="pi pi-users text-2xl text-purple-600"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Ventas últimos 7 días</h2>
          <p-chart type="line" [data]="salesChartData" [options]="chartOptions" height="300px"></p-chart>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Ventas por categoría</h2>
          <p-chart type="doughnut" [data]="categoryChartData" [options]="doughnutOptions" height="300px"></p-chart>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4">Últimos pedidos</h2>
        <p-table [value]="orders()" [rows]="5" styleClass="p-datatable-sm" [tableStyle]="{'min-width': '50rem'}">
          <ng-template pTemplate="header">
            <tr class="bg-slate-50">
              <th class="text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
              <th class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Cliente</th>
              <th class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Total</th>
              <th class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
              <th class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Fecha</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-order>
            <tr>
              <td class="text-sm text-slate-600">{{ order._id.slice(-6) }}</td>
              <td class="text-sm text-slate-600">{{ order.usuario?.nombre || order.usuario?.name || order.usuario?.email }}</td>
              <td class="text-sm font-medium text-slate-800">{{ formatCurrency(order.precioTotal) }}</td>
              <td><p-tag [value]="order.estado" [severity]="getSeverity(order.estado)"></p-tag></td>
              <td class="text-sm text-slate-500">{{ formatDate(order.fecha) }}</td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center py-8 text-slate-400">
                <i class="pi pi-inbox text-4xl mb-2 block"></i>
                No hay pedidos aún
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  dashboardService = inject(DashboardService);
  configService = inject(ConfigService);
  authService = inject(AuthService);

  salesChartData: any;
  categoryChartData: any;
  chartOptions: any;
  doughnutOptions: any;

  stats = this.dashboardService.stats;
  orders = this.dashboardService.orders;

  constructor() {
    effect(() => {
      const salesData = this.dashboardService.salesChart();
      if (salesData) {
        this.updateSalesChart(salesData);
      }
    });

    effect(() => {
      const categoryData = this.dashboardService.categorySales();
      if (categoryData && categoryData.length > 0) {
        this.updateCategoryChart(categoryData);
      }
    });
  }

  ngOnInit(): void {
    this.dashboardService.loadDashboard();
    this.initChartOptions();
    this.initChartData();
  }

  private initChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#e2e8f0' },
          ticks: { color: '#64748b' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#64748b' }
        }
      }
    };
    this.doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#64748b' }
        }
      }
    };
  }

  private initChartData(): void {
    this.salesChartData = {
      labels: [],
      datasets: [{
        label: 'Ventas',
        data: [],
        fill: true,
        borderColor: this.configService.colores().primario,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    };
    this.categoryChartData = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          this.configService.colores().primario,
          this.configService.colores().secundario,
          this.configService.colores().acento,
          '#10b981',
          '#8b5cf6'
        ]
      }]
    };
  }

  private updateSalesChart(data: { labels: string[]; values: number[] }): void {
    this.salesChartData = {
      ...this.salesChartData,
      labels: data.labels,
      datasets: [{
        ...this.salesChartData.datasets[0],
        data: data.values
      }]
    };
  }

  private updateCategoryChart(data: CategorySalesData[]): void {
    this.categoryChartData = {
      ...this.categoryChartData,
      labels: data.map(c => c.categoria),
      datasets: [{
        ...this.categoryChartData.datasets[0],
        data: data.map(c => c.ventas)
      }]
    };
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getVentasGrowth(): number {
    const stats = this.stats();
    if (!stats || stats.ventasMesAnterior === 0) return 0;
    return ((stats.ventasMes - stats.ventasMesAnterior) / stats.ventasMesAnterior) * 100;
  }

  getSeverity(estado: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch (estado?.toLowerCase()) {
      case 'completado':
      case 'entregado':
        return 'success';
      case 'pendiente':
      case 'procesando':
        return 'warn';
      case 'cancelado':
      case 'rechazado':
        return 'danger';
      default:
        return 'info';
    }
  }
}