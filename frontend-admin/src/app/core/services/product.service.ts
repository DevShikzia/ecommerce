import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, CreateProductDto, UpdateProductDto } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = environment.apiUrl;

  private productsSignal = signal<Product[]>([]);
  private loadingSignal = signal<boolean>(false);

  readonly products = this.productsSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();

  constructor(private http: HttpClient) {}

  loadProducts(): Observable<Product[]> {
    this.loadingSignal.set(true);
    return this.http.get<{ success: boolean; data: Product[] }>(`${this.apiUrl}/products`).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.productsSignal.set(response.data);
          }
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false)
      }),
      map(response => response.data)
    );
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<{ success: boolean; data: Product }>(`${this.apiUrl}/products/${id}`).pipe(
      map(response => response.data)
    );
  }

  createProduct(product: CreateProductDto): Observable<Product> {
    return this.http.post<{ success: boolean; data: Product }>(`${this.apiUrl}/products`, product).pipe(
      tap(response => {
        if (response.success) {
          this.productsSignal.update(products => [...products, response.data]);
        }
      }),
      map(response => response.data)
    );
  }

  updateProduct(id: string, product: UpdateProductDto): Observable<Product> {
    return this.http.put<{ success: boolean; data: Product }>(`${this.apiUrl}/products/${id}`, product).pipe(
      tap(response => {
        if (response.success) {
          this.productsSignal.update(products =>
            products.map(p => p._id === id ? response.data : p)
          );
        }
      }),
      map(response => response.data)
    );
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/products/${id}`).pipe(
      tap(() => {
        this.productsSignal.update(products => products.filter(p => p._id !== id));
      }),
      map(() => undefined)
    );
  }

  uploadImage(file: File): Observable<{ success: boolean; url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ success: boolean; url: string }>(`${this.apiUrl}/upload/cloudinary`, formData);
  }
}