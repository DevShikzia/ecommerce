import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../shared/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    DialogModule
  ],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Productos</h1>
          <p class="text-gray-500 mt-1">Gestión del catálogo de productos</p>
        </div>
        <button 
          (click)="navigateToCreate()"
          class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 transition-colors">
          <i class="pi pi-plus"></i>
          Nuevo Producto
        </button>
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
              placeholder="Buscar productos..." 
              class="w-full md:w-64 px-4 py-3 pl-10 border border-gray-300 rounded-xl">
          </span>
        </div>

        <p-table 
          [value]="filteredProducts()" 
          [rows]="10" 
          [paginator]="true"
          [rowsPerPageOptions]="[10, 25, 50]"
          [loading]="isLoading()"
          styleClass="p-datatable-sm"
          [globalFilterFields]="['name', 'category', 'slug']">
          <ng-template pTemplate="header">
            <tr class="bg-gray-50">
              <th class="text-xs font-semibold text-gray-600 uppercase">Producto</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Precio</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Stock</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Categoría</th>
              <th class="text-xs font-semibold text-gray-600 uppercase">Estado</th>
              <th class="text-xs font-semibold text-gray-600 uppercase text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-product>
            <tr class="hover:bg-gray-50">
              <td>
                <div class="flex items-center gap-3">
                  <img 
                    [src]="product.images[0] || '/assets/placeholder.png'" 
                    [alt]="product.name"
                    class="w-12 h-12 rounded-lg object-cover">
                  <div>
                    <p class="font-medium text-gray-800">{{ product.name }}</p>
                    <p class="text-xs text-gray-500">{{ product.slug }}</p>
                  </div>
                </div>
              </td>
              <td class="font-semibold text-gray-800">
                {{ product.price | currency:'ARS':'symbol':'1.0-0' }}
              </td>
              <td>
                <span [class]="product.stock < 10 ? 'text-red-600 font-medium' : 'text-gray-700'">
                  {{ product.stock }}
                </span>
              </td>
              <td>
                <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                  {{ product.category }}
                </span>
              </td>
              <td>
                <p-tag 
                  [value]="product.isActive ? 'Activo' : 'Inactivo'"
                  [severity]="product.isActive ? 'success' : 'secondary'">
                </p-tag>
              </td>
              <td>
                <div class="flex items-center justify-center gap-2">
                  <button 
                    (click)="navigateToEdit(product._id)"
                    class="p-button p-button-sm p-button-text p-button-rounded">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button 
                    (click)="confirmDelete(product)"
                    class="p-button p-button-sm p-button-text p-button-rounded p-button-danger">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-12">
                <i class="pi pi-box text-4xl text-gray-300 mb-3 block"></i>
                <p class="text-gray-500">No hay productos registrados</p>
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
        <p>¿Estás seguro de eliminar el producto "{{ productToDelete()?.name }}"?</p>
        <div class="flex justify-end gap-2 mt-4">
          <button 
            (click)="deleteDialogVisible = false"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300">
            Cancelar
          </button>
          <button 
            (click)="deleteProduct()"
            class="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">
            Eliminar
          </button>
        </div>
      </p-dialog>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  products = this.productService.products;
  isLoading = this.productService.isLoading;
  searchTerm = '';
  deleteDialogVisible = false;
  productToDelete = signal<Product | null>(null);

  filteredProducts = signal<Product[]>([]);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.loadProducts().subscribe({
      next: () => {
        this.updateFilteredProducts();
      }
    });
  }

  onSearch(): void {
    this.updateFilteredProducts();
  }

  private updateFilteredProducts(): void {
    const term = this.searchTerm.toLowerCase();
    const prods = this.products();
    if (!term) {
      this.filteredProducts.set(prods);
    } else {
      this.filteredProducts.set(
        prods.filter(p => 
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.slug.toLowerCase().includes(term)
        )
      );
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/productos/nuevo']);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/productos/editar', id]);
  }

  confirmDelete(product: Product): void {
    this.productToDelete.set(product);
    this.deleteDialogVisible = true;
  }

  deleteProduct(): void {
    const product = this.productToDelete();
    if (product) {
      this.productService.deleteProduct(product._id).subscribe({
        next: () => {
          this.deleteDialogVisible = false;
          this.productToDelete.set(null);
          this.updateFilteredProducts();
        }
      });
    }
  }
}