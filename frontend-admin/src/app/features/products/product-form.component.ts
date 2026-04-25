import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ProductService } from '../../core/services/product.service';
import { Product, CreateProductDto } from '../../shared/models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    ButtonModule,
    SelectModule,
    FileUploadModule,
    TagModule,
    CardModule
  ],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="mb-6">
        <button 
          (click)="goBack()"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4">
          <i class="pi pi-arrow-left"></i>
          Volver a productos
        </button>
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isEdit() ? 'Editar Producto' : 'Nuevo Producto' }}
        </h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <p-card>
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                  <input 
                    pInputText 
                    [(ngModel)]="formData.name"
                    placeholder="Nombre del producto"
                    class="w-full">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                  <input 
                    pInputText 
                    [(ngModel)]="formData.slug"
                    placeholder="url-slug-producto"
                    class="w-full">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
                <textarea 
                  pInputTextarea 
                  [(ngModel)]="formData.description"
                  placeholder="Descripción del producto"
                  rows="4"
                  class="w-full">
                </textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Precio (ARS) *</label>
                  <p-inputNumber 
                    [(ngModel)]="formData.price"
                    mode="currency" 
                    currency="ARS"
                    locale="es-AR"
                    class="w-full">
                  </p-inputNumber>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                  <p-inputNumber 
                    [(ngModel)]="formData.stock"
                    [min]="0"
                    class="w-full">
                  </p-inputNumber>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                  <input 
                    pInputText 
                    [(ngModel)]="formData.category"
                    placeholder="Categoría"
                    class="w-full">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Etiquetas</label>
                <div class="flex flex-wrap gap-2 mb-2">
                  @for (tag of formData.tags; track tag) {
                    <p-tag 
                      [value]="tag" 
                      severity="info">
                    </p-tag>
                  }
                </div>
                <div class="flex gap-2">
                  <input 
                    pInputText 
                    [(ngModel)]="newTag"
                    (keyup.enter)="addTag()"
                    placeholder="Agregar etiqueta"
                    class="flex-1">
                  <button 
                    (click)="addTag()"
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300">
                    Agregar
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Activo</label>
                <div class="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="formData.isActive"
                    class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                  <span class="text-sm text-gray-600">Producto activo en la tienda</span>
                </div>
              </div>
            </div>
          </p-card>
        </div>

        <div>
          <p-card header="Imágenes">
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                @for (img of formData.images; track img; let i = $index) {
                  <div class="relative group">
                    <img 
                      [src]="img" 
                      alt="Product image"
                      class="w-full h-32 object-cover rounded-lg">
                    <button 
                      (click)="removeImage(i)"
                      class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <i class="pi pi-times text-xs"></i>
                    </button>
                  </div>
                }
              </div>

              <p-fileUpload
                mode="basic"
                [maxFileSize]="5000000"
                accept="image/*"
                chooseLabel="Subir imagen"
                (onSelect)="onImageSelect($event)"
                [auto]="true">
              </p-fileUpload>

              <p class="text-xs text-gray-500">
                Formatos: JPG, PNG, WebP. Máximo 5MB.
              </p>
            </div>
          </p-card>

          <p-card header="Tipo de Producto" class="mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <p-select 
                [(ngModel)]="formData.productType"
                [options]="productTypes()"
                optionLabel="name"
                optionValue="_id"
                placeholder="Seleccionar tipo"
                class="w-full">
              </p-select>
            </div>
          </p-card>
        </div>
      </div>

      <div class="flex justify-end gap-4 mt-6">
        <button 
          (click)="goBack()"
          class="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300">
          Cancelar
        </button>
        <button 
          (click)="saveProduct()"
          [disabled]="isSaving()"
          class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
          {{ isSaving() ? 'Guardando...' : 'Guardar Producto' }}
        </button>
      </div>
    </div>
  `
})
export class ProductFormComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  productId = signal<string | null>(null);
  isEdit = signal(false);
  isSaving = signal(false);
  newTag = '';
  productTypes = signal<{ _id: string; name: string }[]>([]);

  formData = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    tags: [] as string[],
    images: [] as string[],
    slug: '',
    isActive: true,
    productType: ''
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productId.set(id);
      this.isEdit.set(true);
      this.loadProduct(id);
    }
  }

  loadProduct(id: string): void {
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.formData = {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          tags: product.tags || [],
          images: product.images || [],
          slug: product.slug,
          isActive: product.isActive,
          productType: typeof product.productType === 'object' && product.productType !== null 
            ? product.productType._id 
            : (typeof product.productType === 'string' ? product.productType : '') || ''
        };
      }
    });
  }

  addTag(): void {
    if (this.newTag.trim() && !this.formData.tags.includes(this.newTag.trim())) {
      this.formData.tags.push(this.newTag.trim());
      this.newTag = '';
    }
  }

  removeTag(tag: string): void {
    this.formData.tags = this.formData.tags.filter(t => t !== tag);
  }

  onImageSelect(event: { currentFiles: File[] }): void {
    const file = event.currentFiles[0];
    if (file) {
      this.uploadImage(file);
    }
  }

  uploadImage(file: File): void {
    this.productService.uploadImage(file).subscribe({
      next: (response) => {
        if (response.success && response.url) {
          this.formData.images.push(response.url);
        }
      }
    });
  }

  removeImage(index: number): void {
    this.formData.images.splice(index, 1);
  }

  saveProduct(): void {
    if (!this.formData.name || !this.formData.slug || !this.formData.price) {
      return;
    }

    this.isSaving.set(true);

    if (this.isEdit() && this.productId()) {
      this.productService.updateProduct(this.productId()!, this.formData).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/productos']);
        },
        error: () => this.isSaving.set(false)
      });
    } else {
      this.productService.createProduct(this.formData as CreateProductDto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/productos']);
        },
        error: () => this.isSaving.set(false)
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/productos']);
  }
}