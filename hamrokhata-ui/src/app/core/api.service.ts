import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  publicId: string;
  balance: number;
  createdAt: string;
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'Credit' | 'Payment';
  note?: string;
  createdAt: string;
}

export interface DashboardData {
  totalCustomers: number;
  totalReceivable: number;
}

export interface PublicLedger {
  customerName: string;
  customerPhone: string;
  shopName: string;
  balance: number;
  transactions: Transaction[];
}

export interface AdminUser {
  id: number;
  name: string;
  phone: string;
  createdAt: string;
  totalCustomers: number;
  totalReceivable: number;
  lastLoginAt: string | null;
  totalLogins: number;
}

export interface LoginLog {
  id: number;
  loggedInAt: string;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${environment.apiUrl}/dashboard`);
  }

  // Customers
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${environment.apiUrl}/customers`);
  }

  createCustomer(name: string, phone: string): Observable<Customer> {
    return this.http.post<Customer>(`${environment.apiUrl}/customers`, { name, phone });
  }

  updateCustomer(id: number, name: string, phone: string): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/customers/${id}`, { name, phone });
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/customers/${id}`);
  }

  // Transactions
  getTransactions(customerId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${environment.apiUrl}/customers/${customerId}/transactions`);
  }

  createTransaction(customerId: number, amount: number, type: string, note?: string): Observable<Transaction> {
    return this.http.post<Transaction>(`${environment.apiUrl}/customers/${customerId}/transactions`, { amount, type, note });
  }

  // Public ledger (no auth)
  getPublicLedger(publicId: string): Observable<PublicLedger> {
    return this.http.get<PublicLedger>(`${environment.publicApiUrl}/${publicId}`);
  }

  // Admin
  getAdminUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${environment.apiUrl}/admin/users`);
  }

  getAdminUserLoginHistory(userId: number): Observable<LoginLog[]> {
    return this.http.get<LoginLog[]>(`${environment.apiUrl}/admin/users/${userId}/logins`);
  }
}
