import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <nav class="navbar">
      <div class="container nav-content">
        <a routerLink="/" class="logo">📚 BookStore</a>
        <div class="nav-links">
          <button class="theme-toggle" (click)="themeService.toggleTheme()" [attr.aria-label]="themeToggleAriaLabel()">
            {{ themeService.currentTheme() === 'dark' ? '🌞 Light' : '🌙 Dark' }}
          </button>

          <ng-container *ngIf="!authService.isAdmin()">
            <a routerLink="/books">Browse</a>
            <a routerLink="/cart" class="cart-link">
              🛒 Cart
              <span class="badge" *ngIf="cartService.cartCount() > 0">{{ cartService.cartCount() }}</span>
            </a>
          </ng-container>
          <ng-container *ngIf="!authService.isLoggedIn()">
            <a routerLink="/login" class="nav-btn">Login</a>
            <a routerLink="/register" class="nav-btn nav-btn-primary">Register</a>
          </ng-container>
          <ng-container *ngIf="authService.isLoggedIn()">
            <div class="dropdown">
              <button class="dropdown-trigger">
                👤 {{ authService.currentUser()?.name }} ▾
              </button>
              <div class="dropdown-content">
                <a routerLink="/profile">My Profile</a>
                <a routerLink="/orders">My Orders</a>
                <div class="dropdown-divider" *ngIf="authService.isAdmin()"></div>
                <a *ngIf="authService.isAdmin()" routerLink="/admin/dashboard" class="admin-link">⚙️ Admin Panel</a>
                <div class="dropdown-divider"></div>
                <a (click)="authService.logout()" class="logout-link">🚪 Logout</a>
              </div>
            </div>
          </ng-container>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: var(--surface-1);
      border-bottom: 1px solid var(--border-color);
      padding: 0;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: var(--shadow);
    }
    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 65px;
    }
    .logo {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--primary-blue);
      text-decoration: none;
    }
    .nav-links {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .theme-toggle {
      border: 1px solid var(--border-color);
      color: var(--text-dark);
      background: var(--surface-1);
      border-radius: 6px;
      padding: 8px 12px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.2s;
    }
    .theme-toggle:hover {
      background: var(--surface-2);
      border-color: var(--primary-blue);
      color: var(--primary-blue);
    }
    .nav-links > a {
      text-decoration: none;
      color: var(--text-dark);
      font-weight: 500;
      padding: 8px 14px;
      border-radius: 6px;
      transition: 0.2s;
    }
    .nav-links > a:hover { background: var(--surface-2); color: var(--primary-blue); }
    .cart-link { position: relative; }
    .badge {
      background: var(--primary-blue);
      color: var(--white);
      padding: 2px 7px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      margin-left: 4px;
    }
    .nav-btn { border: 1px solid var(--border-color); }
    .nav-btn-primary { background: var(--primary-blue) !important; color: var(--white) !important; }
    .nav-btn-primary:hover { background: var(--secondary-blue) !important; }
    .dropdown { position: relative; }
    .dropdown-trigger {
      background: var(--surface-1);
      border: 1px solid var(--border-color);
      padding: 8px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-dark);
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .dropdown-trigger:hover { background: var(--surface-2); border-color: var(--primary-blue); }
    .dropdown-content {
      display: none;
      position: absolute;
      right: 0;
      top: 100%;
      background: var(--surface-1);
      min-width: 200px;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 8px;
      box-shadow: var(--shadow-lg);
      animation: fadeIn 0.2s ease;
      border-top: 10px solid transparent;
      margin-top: -10px;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    .dropdown:hover .dropdown-content { display: block; }
    .dropdown-content a {
      color: var(--text-dark);
      padding: 9px 12px;
      display: block;
      border-radius: 6px;
      text-decoration: none;
      font-size: 14px;
      cursor: pointer;
    }
    .dropdown-content a:hover { background: var(--surface-2); color: var(--primary-blue); }
    .dropdown-divider { border-top: 1px solid var(--border-color); margin: 5px 0; }
    .admin-link { color: #7c3aed !important; font-weight: 600; }
    .logout-link { color: var(--error) !important; }
  `]
})
export class NavbarComponent {
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  public themeService = inject(ThemeService);

  themeToggleAriaLabel(): string {
    return this.themeService.currentTheme() === 'dark'
      ? 'Switch to light mode'
      : 'Switch to dark mode';
  }
}
