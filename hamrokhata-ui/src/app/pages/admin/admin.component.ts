import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, AdminUser, LoginLog } from '../../core/api.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="container py-4">

        <!-- Header -->
        <div class="admin-header mb-4">
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="admin-badge">🛡️ ADMIN</span>
          </div>
          <h2 class="fw-bold mb-0">User Management</h2>
          <p class="text-muted small">View all registered shop owners and their login activity</p>
        </div>

        <!-- Stats Row -->
        <div *ngIf="!loading" class="row g-3 mb-4">
          <div class="col-4">
            <div class="admin-stat-card text-center p-3">
              <div class="admin-stat-icon">👥</div>
              <div class="admin-stat-value">{{ users.length }}</div>
              <div class="admin-stat-label">Total Users</div>
            </div>
          </div>
          <div class="col-4">
            <div class="admin-stat-card text-center p-3">
              <div class="admin-stat-icon">🔑</div>
              <div class="admin-stat-value">{{ totalLogins }}</div>
              <div class="admin-stat-label">Total Logins</div>
            </div>
          </div>
          <div class="col-4">
            <div class="admin-stat-card text-center p-3">
              <div class="admin-stat-icon">💰</div>
              <div class="admin-stat-value">Rs. {{ totalReceivable | number:'1.0-0' }}</div>
              <div class="admin-stat-label">Platform Receivable</div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
          <p class="text-muted small mt-2">Loading users...</p>
        </div>

        <!-- User Cards -->
        <div *ngIf="!loading">
          <h6 class="fw-semibold text-muted mb-3 text-uppercase" style="font-size:0.75rem;letter-spacing:.08em;">
            Registered Shop Owners ({{ users.length }})
          </h6>

          <div *ngIf="users.length === 0" class="text-center text-muted py-5">
            No users registered yet.
          </div>

          <div *ngFor="let user of users" class="user-card card mb-3 p-0">
            <div class="user-card-body p-3">
              <!-- User Info Row -->
              <div class="d-flex justify-content-between align-items-start">
                <div class="d-flex gap-3 align-items-center">
                  <div class="user-avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
                  <div>
                    <div class="fw-bold">{{ user.name }}</div>
                    <div class="text-muted small">📞 {{ user.phone }}</div>
                    <div class="text-muted small">🗓️ Joined {{ user.createdAt | date:'dd MMM yyyy' }}</div>
                  </div>
                </div>
                <div class="text-end">
                  <div class="user-receivable" [class.positive]="user.totalReceivable > 0">
                    Rs. {{ user.totalReceivable | number:'1.0-2' }}
                  </div>
                  <div class="text-muted small">Total Receivable</div>
                </div>
              </div>

              <!-- Stats Pills -->
              <div class="d-flex gap-2 flex-wrap mt-3">
                <span class="info-pill">👥 {{ user.totalCustomers }} customers</span>
                <span class="info-pill">🔑 {{ user.totalLogins }} logins</span>
                <span class="info-pill" *ngIf="user.lastLoginAt">
                  ⏱️ Last login {{ user.lastLoginAt | date:'dd MMM, h:mm a' }}
                </span>
                <span class="info-pill text-muted" *ngIf="!user.lastLoginAt">
                  ⏱️ Never logged in
                </span>
              </div>

              <!-- Expand Login History Button -->
              <div class="mt-3">
                <button class="btn btn-sm btn-login-history w-100"
                        (click)="toggleLoginHistory(user)"
                        [id]="'btnLoginHistory_' + user.id">
                  <span *ngIf="expandedUserId !== user.id">
                    🔍 View Login History ({{ user.totalLogins }})
                  </span>
                  <span *ngIf="expandedUserId === user.id">
                    ▲ Hide Login History
                  </span>
                </button>
              </div>

              <!-- Login History Panel -->
              <div *ngIf="expandedUserId === user.id" class="login-history-panel mt-3">
                <div *ngIf="loginLogsLoading" class="text-center py-3">
                  <div class="spinner-border spinner-border-sm text-primary"></div>
                  <span class="text-muted small ms-2">Loading login history...</span>
                </div>

                <div *ngIf="!loginLogsLoading && loginLogs.length === 0" class="text-center text-muted py-3 small">
                  No login records found for this user.
                </div>

                <div *ngIf="!loginLogsLoading && loginLogs.length > 0">
                  <div class="login-history-header mb-2">
                    <span class="fw-semibold small">Login History</span>
                    <span class="badge bg-primary ms-2">{{ loginLogs.length }} records</span>
                  </div>
                  <div class="login-log-scroll">
                    <div *ngFor="let log of loginLogs; let i = index"
                         class="login-log-row"
                         [class.latest]="i === 0">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <div class="d-flex align-items-center gap-2">
                            <span class="login-number">#{{ loginLogs.length - i }}</span>
                            <span class="fw-semibold small">{{ log.loggedInAt | date:'dd MMM yyyy, h:mm:ss a' }}</span>
                            <span *ngIf="i === 0" class="badge bg-success" style="font-size:0.65rem;">Latest</span>
                          </div>
                          <div class="text-muted" style="font-size:0.75rem; margin-top: 2px;">
                            <span *ngIf="log.ipAddress">🌐 {{ log.ipAddress }}</span>
                            <span *ngIf="!log.ipAddress">🌐 IP not recorded</span>
                          </div>
                          <div *ngIf="log.userAgent" class="user-agent-text mt-1">
                            💻 {{ parseDevice(log.userAgent) }}
                          </div>
                        </div>
                        <div class="login-time-ago text-muted small">
                          {{ timeAgo(log.loggedInAt) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>

    <style>
      .page-container {
        min-height: calc(100vh - 56px);
        background: #f8f9fa;
        padding-bottom: 2rem;
      }

      .admin-header {
        border-left: 4px solid #6f42c1;
        padding-left: 1rem;
      }

      .admin-badge {
        background: linear-gradient(135deg, #6f42c1, #e83e8c);
        color: white;
        font-size: 0.7rem;
        font-weight: 700;
        padding: 0.2rem 0.6rem;
        border-radius: 20px;
        letter-spacing: 0.08em;
      }

      .admin-stat-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        border: 1px solid #e9ecef;
      }

      .admin-stat-icon {
        font-size: 1.5rem;
        margin-bottom: 0.25rem;
      }

      .admin-stat-value {
        font-size: 1.1rem;
        font-weight: 700;
        color: #212529;
        line-height: 1.2;
      }

      .admin-stat-label {
        font-size: 0.7rem;
        color: #6c757d;
        margin-top: 0.1rem;
      }

      .user-card {
        border: 1px solid #e9ecef;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        transition: box-shadow 0.2s;
        overflow: hidden;
      }

      .user-card:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      }

      .user-avatar {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #6f42c1, #e83e8c);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        font-weight: 700;
        flex-shrink: 0;
      }

      .user-receivable {
        font-size: 1rem;
        font-weight: 700;
        color: #6c757d;
      }

      .user-receivable.positive {
        color: #198754;
      }

      .info-pill {
        background: #f0f0f0;
        color: #495057;
        font-size: 0.75rem;
        padding: 0.25rem 0.65rem;
        border-radius: 20px;
        display: inline-flex;
        align-items: center;
      }

      .btn-login-history {
        background: #f8f0ff;
        color: #6f42c1;
        border: 1px solid #d4bbf5;
        font-size: 0.8rem;
        border-radius: 8px;
        padding: 0.45rem;
        transition: all 0.2s;
      }

      .btn-login-history:hover {
        background: #6f42c1;
        color: white;
        border-color: #6f42c1;
      }

      .login-history-panel {
        border-top: 1px solid #e9ecef;
        padding-top: 0.75rem;
      }

      .login-history-header {
        display: flex;
        align-items: center;
      }

      .login-log-scroll {
        max-height: 320px;
        overflow-y: auto;
        padding-right: 0.25rem;
      }

      .login-log-scroll::-webkit-scrollbar {
        width: 4px;
      }

      .login-log-scroll::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }

      .login-log-scroll::-webkit-scrollbar-thumb {
        background: #c4b5fd;
        border-radius: 4px;
      }

      .login-log-row {
        padding: 0.6rem 0.75rem;
        border-radius: 8px;
        margin-bottom: 0.4rem;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        transition: background 0.15s;
      }

      .login-log-row:hover {
        background: #f0f0ff;
        border-color: #d4bbf5;
      }

      .login-log-row.latest {
        background: #f0fff4;
        border-color: #b2dfdb;
      }

      .login-number {
        font-size: 0.65rem;
        font-weight: 700;
        color: #6f42c1;
        background: #f0e8ff;
        padding: 0.1rem 0.4rem;
        border-radius: 4px;
      }

      .user-agent-text {
        font-size: 0.72rem;
        color: #6c757d;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 260px;
      }

      .login-time-ago {
        white-space: nowrap;
        font-size: 0.72rem;
        flex-shrink: 0;
        margin-left: 0.5rem;
      }
    </style>
  `
})
export class AdminComponent implements OnInit {
  users: AdminUser[] = [];
  loading = true;

  expandedUserId: number | null = null;
  loginLogs: LoginLog[] = [];
  loginLogsLoading = false;

  get totalLogins(): number {
    return this.users.reduce((s, u) => s + u.totalLogins, 0);
  }

  get totalReceivable(): number {
    return this.users.reduce((s, u) => s + u.totalReceivable, 0);
  }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getAdminUsers().subscribe({
      next: users => { this.users = users; this.loading = false; },
      error: ()   => { this.loading = false; }
    });
  }

  toggleLoginHistory(user: AdminUser): void {
    if (this.expandedUserId === user.id) {
      this.expandedUserId = null;
      this.loginLogs = [];
      return;
    }
    this.expandedUserId = user.id;
    this.loginLogs = [];
    this.loginLogsLoading = true;

    this.api.getAdminUserLoginHistory(user.id).subscribe({
      next: logs => { this.loginLogs = logs; this.loginLogsLoading = false; },
      error: ()  => { this.loginLogsLoading = false; }
    });
  }

  parseDevice(userAgent: string): string {
    if (!userAgent) return 'Unknown device';
    // Try to extract a human-readable summary
    const ua = userAgent;
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';

    if (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
    else if (/Windows NT 6/.test(ua)) os = 'Windows 7/8';
    else if (/Mac OS X/.test(ua)) os = 'macOS';
    else if (/Android/.test(ua)) os = 'Android';
    else if (/iPhone|iPad/.test(ua)) os = 'iOS';
    else if (/Linux/.test(ua)) os = 'Linux';

    if (/Edg\//.test(ua)) browser = 'Edge';
    else if (/Chrome\//.test(ua)) browser = 'Chrome';
    else if (/Firefox\//.test(ua)) browser = 'Firefox';
    else if (/Safari\//.test(ua)) browser = 'Safari';
    else if (/OPR\//.test(ua)) browser = 'Opera';

    return `${browser} on ${os}`;
  }

  timeAgo(isoDate: string): string {
    const now = Date.now();
    const then = new Date(isoDate).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    const diffMo = Math.floor(diffDay / 30);
    return `${diffMo}mo ago`;
  }
}
