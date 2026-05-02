import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-bg d-flex align-items-center justify-content-center min-vh-100">
      <div class="auth-card card shadow-lg p-4">
        <div class="text-center mb-4">
          <div class="brand-icon mb-2">📒</div>
          <h1 class="brand-title">Hamro Khata</h1>
          <p class="text-muted small">Simple Bookkeeping for Small Businesses</p>
        </div>

        <div *ngIf="error" class="alert alert-danger py-2 small">{{ error }}</div>

        <form (ngSubmit)="onLogin()" #f="ngForm">
          <div class="mb-3">
            <label class="form-label fw-semibold">Phone Number</label>
            <input type="tel" class="form-control form-control-lg" id="phone"
                   [(ngModel)]="phone" name="phone" required
                   placeholder="98XXXXXXXX" autocomplete="username">
          </div>
          <div class="mb-4">
            <label class="form-label fw-semibold">Password</label>
            <input type="password" class="form-control form-control-lg" id="password"
                   [(ngModel)]="password" name="password" required
                   placeholder="••••••••" autocomplete="current-password">
          </div>
          <button type="submit" class="btn btn-primary btn-lg w-100" [disabled]="loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <hr class="my-3">
        <p class="text-center small mb-0">
          New here? <a routerLink="/register" class="fw-semibold text-decoration-none">Register your shop</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  phone = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin(): void {
    if (!this.phone || !this.password) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.phone, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err?.error?.message || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
