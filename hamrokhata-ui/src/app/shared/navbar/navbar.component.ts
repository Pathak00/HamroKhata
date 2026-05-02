import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg hk-navbar">
      <div class="container">
        <a class="navbar-brand fw-bold" routerLink="/dashboard">
          📒 Hamro Khata
        </a>
        <div class="d-flex gap-2 align-items-center">
          <a routerLink="/dashboard" class="btn btn-sm btn-nav-link">🏠</a>
          <a routerLink="/customers" class="btn btn-sm btn-nav-link">👥 Customers</a>
          <a *ngIf="isAdmin" routerLink="/admin" class="btn btn-sm btn-nav-link admin-link">🛡️ Admin</a>
          <button class="btn btn-sm btn-outline-light" (click)="logout()" id="btnLogout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  isAdmin: boolean;
  constructor(private auth: AuthService) {
    this.isAdmin = auth.isAdmin();
  }
  logout(): void { this.auth.logout(); }
}
