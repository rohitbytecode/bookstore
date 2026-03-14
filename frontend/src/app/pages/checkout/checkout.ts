import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';
import { OrderService } from '../../services/order';
import { Cart } from '../../models/cart';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="container">
      <h1>Checkout</h1>
      <div class="checkout-grid">
        <div class="form-section card">
          <h3>Shipping Information</h3>
          <form (ngSubmit)="placeOrder()" #checkoutForm="ngForm">
<div class= "form-grid">
          <div class="form-group">
  <label>Flat / House No.</label>
  <input type="text"
    [(ngModel)]="address.flat"
    name="flat"
    required
    #flatCtrl="ngModel"
    placeholder="Flat / House No." />

  <div *ngIf="flatCtrl.invalid && flatCtrl.touched" class="validation-error">
    Required
  </div>
</div>

<div class="form-group">
  <label>Street / Area</label>
  <input type="text"
    [(ngModel)]="address.street"
    name="street"
    required
    #streetCtrl="ngModel"
    placeholder="Street, Area, Landmark" />

  <div *ngIf="streetCtrl.invalid && streetCtrl.touched" class="validation-error">
    Required
  </div>
</div>

<div class="form-group">
  <label>City</label>
  <input type="text"
    [(ngModel)]="address.city"
    name="city"
    required readonly
    #cityCtrl="ngModel"/>
</div>

<div class="form-group">
  <label>District</label>
  <input type="text"
    [(ngModel)]="address.district"
    name="district"
    required
    #districtCtrl="ngModel"/>
</div>

<div class="form-group">
  <label>State</label>
  <input
    type="text"
    [(ngModel)]="address.state"
    name="state"
    required
    readonly
  />
</div>

<div class="form-group">
  <label>Pincode</label>
  <input type="text"
    maxlength="6"
    pattern="^[1-9][0-9]{5}$"
    [(ngModel)]="address.pincode"
    name="pincode"
    required
    (blur)="lookupPincode()"
    #pinCtrl="ngModel"
    placeholder="6 digit pincode" />

  <div *ngIf="pinCtrl.invalid && pinCtrl.touched" class="validation-error">
    Enter valid 6 digit pincode
  </div>
</div>
</div>
            
            <div *ngIf="errorMsg" class="error-msg" style="margin-top: 10px;">{{ errorMsg }}</div>
            <button type="submit" class="btn btn-primary w-100 mt-3" [disabled]="checkoutForm.invalid || loading">
              {{ loading ? 'Placing Order...' : 'Place Order' }}
            </button>
          </form>
        </div>
        <div class="summary-section card">
          <h3>Order Summary</h3>
          <div *ngIf="cart">
            <div class="summary-item" *ngFor="let item of cart.items">
              <span>{{ item.bookId.title }} x {{ item.quantity }}</span>
              <span>{{ (item.bookId.price * item.quantity) | currency:'INR':'symbol':'1.0-0' }}</span>
            </div>
            <hr>
            <div class="summary-total">
              <strong>Total</strong>
              <strong>{{ getTotal() | currency:'INR':'symbol':'1.0-0' }}</strong>
            </div>
          </div>
        </div>
      </div>
    </main>
    <app-footer></app-footer>
  `,
  styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit {
  cart: Cart | null = null;
  address = {
  flat: '',
  street: '',
  city: '',
  district: '',
  state: '',
  pincode: ''
};
  loading = false;
  errorMsg = '';
  pincodeState = '';

    states = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal'
  ];

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.getCart().subscribe(cart => {
      this.cart = cart;
      if (!cart || cart.items.length === 0) {
        this.router.navigate(['/cart']);
      }
    });
  }

  lookupPincode() {

  this.errorMsg = '';

  if (this.address.pincode.length !== 6) return;

  fetch(`https://api.postalpincode.in/pincode/${this.address.pincode}`)
  .then(res => res.json())
  .then(data => {

    if (data[0].Status === "Success") {

      const post = data[0].PostOffice[0];

      this.address.city = post.Block;
      this.address.district = post.District;
      this.address.state = post.State;

      this.pincodeState = post.State;

    } else {

      this.errorMsg = "Invalid pincode";

    }

  });

}

  getTotal() {
    return this.cart?.items.reduce((acc, item) => acc + (item.bookId.price * item.quantity), 0) || 0;
  }

  placeOrder() {

  this.errorMsg = '';

  if (
    !this.address.flat ||
    !this.address.street ||
    !this.address.city ||
    !this.address.district ||
    !this.address.state ||
    !this.address.pincode
  ) {
    this.errorMsg = 'Please fill complete shipping address.';
    return;
  }

  if (!/^[1-9][0-9]{5}$/.test(this.address.pincode)) {
    this.errorMsg = 'Invalid pincode.';
    return;
  }

  if (this.address.state !== this.pincodeState) {
    this.errorMsg = 'Selected state does not match the pincode.';
    return;
  }

  this.loading = true;
    const orderData = {
    books: this.cart?.items.map(item => ({
      bookId: item.bookId._id,
      quantity: item.quantity,
      price: item.bookId.price
    })),
    totalPrice: this.getTotal(),
    address: this.address
  };

  this.orderService.placeOrder(orderData).subscribe({
    next: () => {
      this.loading = false;
      alert('Order placed successfully!');
      this.router.navigate(['/orders']);
    },
    error: (err) => {
      this.loading = false;
      this.errorMsg = err.error?.error || 'Failed to place order.';
    }
  });
}
}