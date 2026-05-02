import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService, PublicLedger } from '../../core/api.service';

@Component({
  selector: 'app-public-ledger',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="public-bg min-vh-100">
      <div class="container py-4" style="max-width:600px">

        <!-- Header -->
        <div class="text-center mb-4 pt-3">
          <div class="brand-icon">📒</div>
          <h1 class="brand-title mt-1">Hamro Khata</h1>
          <p class="text-muted small">Customer Ledger</p>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <!-- Not found -->
        <div *ngIf="!loading && !ledger" class="text-center py-5">
          <div class="fs-1">🚫</div>
          <h4 class="mt-2">Ledger not found</h4>
          <p class="text-muted small">This link may be invalid or expired.</p>
        </div>

        <!-- Ledger -->
        <div *ngIf="!loading && ledger">

          <!-- Shop + Customer Info -->
          <div class="card p-3 mb-3">
            <div class="text-muted small">SHOP</div>
            <div class="fw-bold fs-5">{{ ledger.shopName }}</div>
            <hr class="my-2">
            <div class="text-muted small">CUSTOMER</div>
            <div class="fw-bold">{{ ledger.customerName }}</div>
            <div class="text-muted small">{{ ledger.customerPhone }}</div>
          </div>

          <!-- Balance -->
          <div class="balance-banner card mb-4 p-3 text-center"
               [class.banner-owed]="ledger.balance > 0"
               [class.banner-clear]="ledger.balance <= 0">
            <div class="banner-label">
              {{ ledger.balance > 0 ? 'You Owe' : (ledger.balance < 0 ? 'Shop Owes You' : 'All Clear') }}
            </div>
            <div class="banner-amount">
              Rs. {{ (ledger.balance < 0 ? -ledger.balance : ledger.balance) | number:'1.0-2' }}
            </div>
          </div>

          <!-- Transactions -->
          <h6 class="fw-bold mb-3">Transaction History</h6>

          <div *ngIf="ledger.transactions.length === 0" class="text-center text-muted py-3">
            No transactions recorded.
          </div>

          <div *ngFor="let t of ledger.transactions"
               class="tx-row card mb-2 p-3"
               [class.tx-credit]="t.type === 'Credit'"
               [class.tx-payment]="t.type === 'Payment'">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="tx-type-badge me-2">{{ t.type === 'Credit' ? '📈 Credit' : '💵 Payment' }}</span>
                <span *ngIf="t.note" class="text-muted small">{{ t.note }}</span>
              </div>
              <div class="tx-amount fw-bold"
                   [class.text-danger]="t.type === 'Credit'"
                   [class.text-success]="t.type === 'Payment'">
                {{ t.type === 'Credit' ? '+' : '-' }}Rs. {{ t.amount | number:'1.0-2' }}
              </div>
            </div>
            <div class="tx-date text-muted small mt-1">{{ t.createdAt | date:'dd MMM yyyy, h:mm a' }}</div>
          </div>

        </div>

        <!-- Footer -->
        <div class="text-center text-muted small mt-5 pb-4">
          Powered by <strong>Hamro Khata</strong> · Simple Bookkeeping for Nepal
        </div>

      </div>
    </div>
  `
})
export class PublicLedgerComponent implements OnInit {
  ledger?: PublicLedger;
  loading = true;

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const publicId = this.route.snapshot.paramMap.get('publicId')!;
    this.api.getPublicLedger(publicId).subscribe({
      next: data => { this.ledger = data; this.loading = false; },
      error: ()   => { this.loading = false; }
    });
  }
}
