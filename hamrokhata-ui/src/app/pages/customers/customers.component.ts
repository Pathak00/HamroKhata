import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, Customer } from '../../core/api.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="container py-4">

        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="fw-bold mb-0">Customers</h2>
          <button class="btn btn-primary" (click)="openAddModal()">
            ➕ Add Customer
          </button>
        </div>

        <!-- Search -->
        <div class="mb-3">
          <input type="search" class="form-control" id="customerSearch"
                 [(ngModel)]="searchTerm" placeholder="🔍  Search by name or phone..."
                 (input)="onSearch()">
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <!-- Empty state -->
        <div *ngIf="!loading && filtered.length === 0" class="empty-state text-center py-5">
          <div class="fs-1">📭</div>
          <p class="mt-2 text-muted">No customers yet. Add your first one!</p>
        </div>

        <!-- Customer List -->
        <div *ngIf="!loading && filtered.length > 0" class="customer-list">
          <div *ngFor="let c of filtered" class="customer-card card mb-2 p-3">
            <div class="d-flex justify-content-between align-items-start">
              <div (click)="goToLedger(c)" class="flex-grow-1" style="cursor:pointer">
                <div class="fw-semibold fs-6">{{ c.name }}</div>
                <div class="text-muted small">📞 {{ c.phone }}</div>
                <div class="mt-1">
                  <span class="balance-badge"
                        [class.balance-owed]="c.balance > 0"
                        [class.balance-clear]="c.balance <= 0">
                    {{ c.balance > 0 ? 'Owes Rs. ' + (c.balance | number:'1.0-2') : 'Cleared ✔' }}
                  </span>
                </div>
              </div>
              <div class="d-flex gap-2 ms-2 flex-shrink-0">
                <button class="btn btn-sm btn-outline-secondary" (click)="copyLink(c)" title="Share ledger link">🔗</button>
                <button class="btn btn-sm btn-outline-primary" (click)="openEditModal(c)">✏️</button>
                <button class="btn btn-sm btn-outline-danger" (click)="confirmDelete(c)">🗑️</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Copy toast -->
        <div *ngIf="copied" class="toast-msg">Link copied! 📋</div>

      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
      <div class="modal-box card p-4" (click)="$event.stopPropagation()">
        <h5 class="fw-bold mb-3">{{ editMode ? 'Edit Customer' : 'Add Customer' }}</h5>
        <div *ngIf="modalError" class="alert alert-danger py-2 small">{{ modalError }}</div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Name</label>
          <input type="text" class="form-control" id="modalName"
                 [(ngModel)]="form.name" placeholder="Customer name" maxlength="150">
        </div>
        <div class="mb-4">
          <label class="form-label fw-semibold">Phone</label>
          <input type="tel" class="form-control" id="modalPhone"
                 [(ngModel)]="form.phone" placeholder="98XXXXXXXX">
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary flex-grow-1" (click)="saveCustomer()" [disabled]="saving">
            <span *ngIf="saving" class="spinner-border spinner-border-sm me-1"></span>
            {{ saving ? 'Saving...' : (editMode ? 'Update' : 'Add Customer') }}
          </button>
          <button class="btn btn-outline-secondary" (click)="closeModal()">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div *ngIf="showDeleteConfirm" class="modal-overlay" (click)="showDeleteConfirm=false">
      <div class="modal-box card p-4" (click)="$event.stopPropagation()">
        <h5 class="fw-bold mb-2">Delete Customer?</h5>
        <p class="text-muted small mb-3">This will also delete all transactions for <strong>{{ selectedCustomer?.name }}</strong>. This cannot be undone.</p>
        <div class="d-flex gap-2">
          <button class="btn btn-danger flex-grow-1" (click)="deleteCustomer()" [disabled]="saving">
            {{ saving ? 'Deleting...' : 'Yes, Delete' }}
          </button>
          <button class="btn btn-outline-secondary" (click)="showDeleteConfirm=false">Cancel</button>
        </div>
      </div>
    </div>
  `
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filtered: Customer[] = [];
  loading = true;
  searchTerm = '';

  showModal = false;
  editMode = false;
  saving = false;
  modalError = '';
  form = { name: '', phone: '' };
  selectedCustomer?: Customer;

  showDeleteConfirm = false;
  copied = false;

  constructor(private api: ApiService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.api.getCustomers().subscribe({
      next: data => {
        this.customers = data;
        this.onSearch();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  onSearch(): void {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.customers.filter(c =>
      c.name.toLowerCase().includes(t) || c.phone.includes(t));
  }

  goToLedger(c: Customer): void {
    this.router.navigate(['/customers', c.id, 'ledger']);
  }

  openAddModal(): void {
    this.editMode = false;
    this.form = { name: '', phone: '' };
    this.modalError = '';
    this.showModal = true;
  }

  openEditModal(c: Customer): void {
    this.editMode = true;
    this.selectedCustomer = c;
    this.form = { name: c.name, phone: c.phone };
    this.modalError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveCustomer(): void {
    if (!this.form.name.trim() || !this.form.phone.trim()) {
      this.modalError = 'Name and phone are required.';
      return;
    }
    this.saving = true;
    this.modalError = '';

    const onSuccess = () => {
      this.saving = false;
      this.showModal = false;
      this.cdr.markForCheck();
      this.loadCustomers();
    };
    const onError = (err: any) => {
      this.modalError = err?.error?.message || 'Failed to save.';
      this.saving = false;
      this.cdr.markForCheck();
    };

    if (this.editMode) {
      this.api.updateCustomer(this.selectedCustomer!.id, this.form.name, this.form.phone)
        .subscribe({ next: onSuccess, error: onError });
    } else {
      this.api.createCustomer(this.form.name, this.form.phone)
        .subscribe({ next: onSuccess, error: onError });
    }
  }

  confirmDelete(c: Customer): void {
    this.selectedCustomer = c;
    this.showDeleteConfirm = true;
  }

  deleteCustomer(): void {
    this.saving = true;
    this.api.deleteCustomer(this.selectedCustomer!.id).subscribe({
      next: () => { this.saving = false; this.showDeleteConfirm = false; this.loadCustomers(); },
      error: () => { this.saving = false; this.showDeleteConfirm = false; }
    });
  }

  copyLink(c: Customer): void {
    const url = `${window.location.origin}/public/${c.publicId}`;
    navigator.clipboard.writeText(url).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2500);
    });
  }
}
