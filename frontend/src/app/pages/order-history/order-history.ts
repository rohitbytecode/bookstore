import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order';
import { Order } from '../../models/order';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="container">
      <h1>My Order History</h1>
      <div *ngIf="orders.length > 0; else noOrders" class="orders-list">
        <div *ngFor="let order of orders" class="card order-card">
          <div class="order-header">
            <span><strong>Order ID:</strong> {{ order._id }}</span>
            <span class="status-badge" [attr.data-status]="order.status">{{ order.status }}</span>
          </div>
          <div class="order-details">
            <p><strong>Date:</strong> {{ order.createdAt | date:'medium' }}</p>
            <div class="address-block">
  <strong>Address:</strong>
  <div>{{ order.address.flat }}, {{ order.address.street }}</div>
  <div>{{ order.address.city }}, {{ order.address.district }}</div>
  <div>{{ order.address.state }} - {{ order.address.pincode }}</div>
</div>
            <div class="order-items">
              <div *ngFor="let item of order.books" class="order-item">
                <span>{{ item.bookId.title }} x {{ item.quantity }}</span>
                <span>{{ (item.price * item.quantity) | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>
            </div>
            <div class="order-footer">
              <strong>Total Amount: {{ order.totalPrice | currency:'INR':'symbol':'1.0-0' }}</strong>
            </div>
          </div>
        </div>
      </div>
      <ng-template #noOrders>
        <p>You haven't placed any orders yet.</p>
      </ng-template>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    .order-card { margin-bottom: 20px; padding: 25px; }
    .order-header { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px; }
    .status-badge { padding: 5px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; background: #eee; }
    .status-badge[data-status="Pending"] { background: #fff3cd; color: #856404; }
    .status-badge[data-status="Delivered"] { background: #d4edda; color: #155724; }
    .order-item { display: flex; justify-content: space-between; margin-bottom: 5px; color: var(--text-muted); }
    .order-footer { text-align: right; margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px; font-size: 1.1rem; }
    .address-block{
  margin-top:6px;
  line-height:1.5;
  color:#555;
}
    `]
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orderService.getOrders().subscribe(orders => {
      this.orders = orders;
    });
  }
}
