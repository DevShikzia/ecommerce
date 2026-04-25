# Reglas de Frontend Cliente (Angular)

## Contexto del Frontend Cliente
Aplicación Angular (Standalone Components) para clientes del e-commerce, orientada a mobile first. Usa Tailwind CSS + daisyUI para diseño, Signals para estado global y RxJS solo para peticiones HTTP. Todas las respuestas de IA y comentarios en castellano, código fuente en inglés.

## Idioma
- Código fuente (variables, funciones, clases): Inglés.
- Comentarios de código: Castellano.
- Respuestas de IA: Castellano.

## Convenciones de Código
- No usar `any` en TypeScript: Todo tipado con interfaces en `src/app/shared/models/`.
- Componentes: `PascalCase`, Standalone (sin NgModules), en `src/app/features/` o `src/app/shared/components/`.
- Servicios: `camelCase`, en `src/app/core/services/`.
- Nombres de archivos: `kebab-case` (ej: `product-card.component.ts`, `cart.service.ts`).

## Gestión de Estado y HTTP
- Estado global (usuario, carrito, auth): Signals (ej: `cartSignal = signal<Cart>(initialCart)`).
- Peticiones HTTP: RxJS solo en servicios, por componente. No mezclar Signals y RxJS en el mismo componente.
- Ejemplo correcto de servicio:
  ```typescript
  // src/app/core/services/product.service.ts
  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import { Product } from '../shared/models/product.model';

  @Injectable({ providedIn: 'root' })
  export class ProductService {
    constructor(private http: HttpClient) {}

    getProducts(): Observable<Product[]> {
      return this.http.get<Product[]>('/api/v1/products');
    }
  }
  ```

## Diseño y Tema
- Librería UI: Tailwind CSS + daisyUI (temas sobrios, mobile first).
- Temas configurables: El admin define colores, nombre del e-commerce y logo en la colección `Configuracion` de MongoDB. El frontend lee esta configuración al iniciar (`/api/v1/config`) y aplica los estilos dinámicamente.
- Componentes reutilizables: Crear `ButtonComponent`, `InputComponent`, `ProductCardComponent` en `src/app/shared/components/` para evitar duplicación.
- Mobile First: Todas las clases de Tailwind deben priorizar diseño móvil (ej: `sm:`, `md:` para pantallas grandes).

## Reglas de Reutilización
- Antes de crear un componente nuevo, verificar si existe uno reutilizable en `shared/components/`.
- Interfaces de modelos en `src/app/shared/models/` (ej: `product.model.ts`, `user.model.ts`).

## Logs
- Usar `ngx-logger` para logging estructurado: niveles (error, warn, info), enviar logs de error al backend en producción.

## Ejemplos de Código (Correcto / Incorrecto)
### Correcto (Componente Standalone con Signal)
```typescript
// src/app/features/cart/cart.component.ts
import { Component, inject } from '@angular/core';
import { CartService } from '../../core/services/cart.service';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div>
      @for (item of cartService.cartItems(); track item.id) {
        <p>{{ item.name }} - {{ item.quantity }}</p>
      }
      <app-button label="Finalizar Compra" (click)="checkout()" />
    </div>
  `
})
export class CartComponent {
  cartService = inject(CartService);

  checkout() {
    // Lógica de checkout
  }
}
```

### Incorrecto (Uso de any y NgModules)
```typescript
// No usar any ni NgModules
import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  template: `<div>{{ items }}</div>` // Sin standalone
})
export class CartComponent {
  items: any; // Uso de any incorrecto

  constructor(private cartService: CartService) {
    this.items = this.cartService.getItems(); // Sin tipar
  }
}
```
