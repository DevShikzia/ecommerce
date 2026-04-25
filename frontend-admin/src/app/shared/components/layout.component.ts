import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { NavbarComponent } from './navbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-100">
      <app-sidebar class="w-64 hidden lg:flex flex-col shrink-0" />
      <div class="flex-1 flex flex-col overflow-hidden">
        <app-navbar />
        <main class="flex-1 overflow-y-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {}