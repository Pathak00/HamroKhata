import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-bg d-flex align-items-center justify-content-center min-vh-100">
      <div class="auth-card card shadow-lg p-4">
        <div class="text-center mb-4">
          <div class="brand-icon mb-2">📒</div>
          <h1 class="brand-title">Create Your Shop</h1>
          <p class="text-muted small">Register to start tracking your customers</p>
        </div>

        <div *ngIf="error" class="alert alert-danger py-2 small">{{ error }}</div>
        <div *ngIf="success" class="alert alert-success py-2 small">{{ success }}</div>

        <form (ngSubmit)="onRegister()" #f="ngForm">
          <div class="mb-3">
            <label class="form-label fw-semibold">Your Name / Shop Name</label>
            <input type="text" class="form-control form-control-lg" id="name"
                   [(ngModel)]="name" name="name" required maxlength="150"
                   placeholder="e.g. Ram ko Pasal">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Phone Number</label>
            <input type="tel" class="form-control form-control-lg" id="phone"
                   [(ngModel)]="phone" name="phone" required
                   placeholder="98XXXXXXXX" autocomplete="username">
          </div>
          <div class="mb-4">
            <label class="form-label fw-semibold">Password</label>
            <input type="password" class="form-control form-control-lg" id="password"
                   [(ngModel)]="password" name="password" required minlength="6"
                   placeholder="At least 6 characters" autocomplete="new-password">
          </div>
          <button type="submit" class="btn btn-primary btn-lg w-100" [disabled]="loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Registering...' : 'Register' }}
          </button>
        </form>

        <hr class="my-3">
        <p class="text-center small mb-0">
          Already registered? <a routerLink="/login" class="fw-semibold text-decoration-none">Login here</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  name = '';
  phone = '';
  password = '';
  error = '';
  success = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onRegister(): void {
    if (!this.name || !this.phone || !this.password) return;
    this.loading = true;
    this.error = '';
    this.auth.register(this.name, this.phone, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err?.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
