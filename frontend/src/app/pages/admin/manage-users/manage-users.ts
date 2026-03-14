import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../services/user';
import { User } from '../../../models/user';
import { NavbarComponent } from '../../../components/navbar/navbar';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="container admin-container">
      <div class="admin-sidebar card">
        <h3>Admin Menu</h3>
        <ul>
          <li><a routerLink="/admin/dashboard">Dashboard</a></li>
          <li><a routerLink="/admin/books">Manage Books</a></li>
          <li><a routerLink="/admin/orders">Manage Orders</a></li>
          <li><a routerLink="/admin/users" class="active">Manage Users</a></li>
        </ul>
      </div>

      <div class="admin-content">
        <h1>Manage Users</h1>

        <div class="card table-card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="role-badge" [attr.data-role]="user.role === 'user' ? 'customer' : user.role">{{ user.role === 'user' ? 'CUSTOMER' : user.role.toUpperCase() }}</span>
                </td>
                <td>
                  <button class="action-btn" (click)="toggleRole(user)" [title]="user.role === 'admin' ? 'Demote to Customer' : 'Promote to Admin'">
                    {{ user.role === 'admin' ? '👤 Set Customer' : '🛡️ Set Admin' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .admin-container { display: flex; gap: 30px; margin-top: 30px; }
    .admin-sidebar { width: 250px; height: fit-content; }
    .admin-sidebar ul { list-style: none; padding: 0; }
    .admin-sidebar li { margin-bottom: 10px; }
    .admin-sidebar a { text-decoration: none; color: var(--text-dark); display: block; padding: 10px; border-radius: 5px; }
    .admin-sidebar a.active { background: var(--bg-light); color: var(--primary-blue); font-weight: bold; }
    .admin-content { flex: 1; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 15px; text-align: left; border-bottom: 1px solid #eee; }
    .role-badge { padding: 4px 10px; border-radius: 4px; font-size: 13px; font-weight: 500; text-transform: uppercase; }
    .role-badge[data-role="admin"] { background: #e0f2fe; color: #0369a1; }
    .role-badge[data-role="customer"] { background: #f3f4f6; color: #4b5563; }
    .action-btn { background: none; border: 1px solid #ddd; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; transition: 0.2s; }
    .action-btn:hover { background: #f0f0f0; border-color: #bbb; }
  `]
})
export class ManageUsersComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe(users => this.users = users);
  }

  toggleRole(user: User) {
    if (!user._id) return;
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    if (confirm(`Are you sure you want to change ${user.name}'s role to ${newRole}?`)) {
      this.userService.updateRole(user._id, newRole).subscribe({
        next: () => {
          alert('Role updated successfully');
          this.loadUsers();
        },
        error: (err) => alert(err.error?.error || 'Failed to update role')
      });
    }
  }
}
