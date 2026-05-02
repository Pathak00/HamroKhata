import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, DashboardData } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="container py-4">

        <div class="mb-4">
          <h2 class="fw-bold mb-0">Welcome back, {{ shopName }} 👋</h2>
          <p class="text-muted small">Here's your business overview</p>
        </div>

        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <div *ngIf="!loading" class="row g-3">
          <!-- Total Customers -->
          <div class="col-6">
            <div class="stat-card card h-100 text-center p-3">
              <div class="stat-icon">👥</div>
              <div class="stat-value">{{ data?.totalCustomers ?? 0 }}</div>
              <div class="stat-label">Total Customers</div>
            </div>
          </div>

          <!-- Total Receivable -->
          <div class="col-6">
            <div class="stat-card card h-100 text-center p-3"
                 [class.receivable-positive]="(data?.totalReceivable ?? 0) > 0">
              <div class="stat-icon">💰</div>
              <div class="stat-value">Rs. {{ (data?.totalReceivable ?? 0) | number:'1.0-2' }}</div>
              <div class="stat-label">Total Receivable</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="mt-4">
          <h5 class="fw-semibold mb-3">Quick Actions</h5>
          <div class="d-grid gap-2">
            <a routerLink="/customers" class="btn btn-primary btn-lg">
              📋 View All Customers
            </a>
            <a routerLink="/customers" [queryParams]="{add: true}" class="btn btn-outline-primary btn-lg">
              ➕ Add New Customer
            </a>
          </div>
        </div>

      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  data?: DashboardData;
  loading = true;
  shopName = '';

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.shopName = this.auth.getCurrentUser()?.name ?? 'there';
    this.api.getDashboard().subscribe({
      next: d => { this.data = d; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }
}
