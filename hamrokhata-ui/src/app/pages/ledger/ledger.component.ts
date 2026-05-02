import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Customer, Transaction } from '../../core/api.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="container py-4">

        <!-- Back -->
        <button class="btn btn-link ps-0 mb-2 text-decoration-none text-muted"
                (click)="goBack()">← Back to Customers</button>

        <!-- Customer Info -->
        <div *ngIf="customer" class="mb-3">
          <h2 class="fw-bold mb-0">{{ customer.name }}</h2>
          <p class="text-muted small mb-0">📞 {{ customer.phone }}</p>
        </div>

        <!-- Balance Banner -->
        <div class="balance-banner card mb-4 p-3 text-center"
             [class.banner-owed]="balance > 0"
             [class.banner-clear]="balance <= 0">
          <div class="banner-label">{{ balance > 0 ? 'Customer Owes' : (balance < 0 ? 'You Owe Customer' : 'All Clear') }}</div>
          <div class="banner-amount">Rs. {{ (balance < 0 ? -balance : balance) | number:'1.0-2' }}</div>
          <div *ngIf="balance === 0" class="banner-label">No outstanding balance ✔</div>
        </div>

        <!-- Add Transaction Form -->
        <div class="card p-3 mb-4">
          <h6 class="fw-bold mb-3">Add Transaction</h6>

          <!-- Type Toggle -->
          <div class="type-toggle d-flex mb-3 gap-2">
            <button class="btn flex-grow-1"
                    [class.btn-danger]="form.type === 'Credit'"
                    [class.btn-outline-secondary]="form.type !== 'Credit'"
                    (click)="form.type = 'Credit'" id="btnCredit">
              📈 Customer Owes (Credit)
            </button>
            <button class="btn flex-grow-1"
                    [class.btn-success]="form.type === 'Payment'"
                    [class.btn-outline-secondary]="form.type !== 'Payment'"
                    (click)="form.type = 'Payment'" id="btnPayment">
              💵 Customer Paid
            </button>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Amount (Rs.)</label>
            <input type="number" class="form-control form-control-lg" id="txAmount"
                   [(ngModel)]="form.amount" placeholder="0.00" min="0.01" step="0.01">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Note <span class="text-muted fw-normal">(optional)</span></label>
            <input type="text" class="form-control" id="txNote"
                   [(ngModel)]="form.note" placeholder="e.g. Monthly groceries" maxlength="500">
          </div>

          <div *ngIf="txError" class="alert alert-danger py-2 small mb-2">{{ txError }}</div>

          <button class="btn btn-primary btn-lg w-100" (click)="addTransaction()" [disabled]="saving">
            <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
            {{ saving ? 'Saving...' : 'Save Transaction' }}
          </button>
        </div>

        <!-- Transaction History -->
        <h6 class="fw-bold mb-3">Transaction History</h6>

        <div *ngIf="txLoading" class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-primary"></div>
        </div>

        <div *ngIf="!txLoading && transactions.length === 0" class="text-center text-muted py-3">
          No transactions yet.
        </div>

        <div *ngIf="!txLoading && transactions.length > 0" class="tx-list">
          <div *ngFor="let t of transactions"
               class="tx-row card mb-2 p-3"
               [class.tx-credit]="t.type === 'Credit'"
               [class.tx-payment]="t.type === 'Payment'">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="tx-type-badge me-2">{{ t.type === 'Credit' ? '📈 Credit' : '💵 Payment' }}</span>
                <span *ngIf="t.note" class="text-muted small">{{ t.note }}</span>
              </div>
              <div class="tx-amount" [class.text-danger]="t.type === 'Credit'" [class.text-success]="t.type === 'Payment'">
                {{ t.type === 'Credit' ? '+' : '-' }}Rs. {{ t.amount | number:'1.0-2' }}
              </div>
            </div>
            <div class="tx-date text-muted small mt-1">{{ t.createdAt | date:'dd MMM yyyy, h:mm a' }}</div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class LedgerComponent implements OnInit {
  customer?: Customer;
  transactions: Transaction[] = [];
  balance = 0;
  txLoading = true;
  saving = false;
  txError = '';

  form = { amount: null as number | null, type: 'Credit', note: '' };

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getCustomers().subscribe(cs => {
      this.customer = cs.find(c => c.id === id);
      if (this.customer) this.balance = this.customer.balance;
    });
    this.loadTransactions(id);
  }

  private get customerId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  loadTransactions(id?: number): void {
    this.txLoading = true;
    this.api.getTransactions(id ?? this.customerId).subscribe({
      next: data => {
        this.transactions = data;
        this.recalcBalance();
        this.txLoading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.txLoading = false; this.cdr.markForCheck(); }
    });
  }

  recalcBalance(): void {
    this.balance = this.transactions.reduce((sum, t) =>
      t.type === 'Credit' ? sum + t.amount : sum - t.amount, 0);
  }

  addTransaction(): void {
    if (!this.form.amount || this.form.amount <= 0) {
      this.txError = 'Please enter a valid amount.';
      return;
    }
    this.saving = true;
    this.txError = '';
    this.api.createTransaction(this.customerId, this.form.amount, this.form.type, this.form.note || undefined).subscribe({
      next: () => {
        this.form.amount = null;
        this.form.note = '';
        this.saving = false;
        this.cdr.markForCheck();
        this.loadTransactions();
      },
      error: (err) => {
        this.txError = err?.error?.message || 'Failed to add transaction.';
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }
}
