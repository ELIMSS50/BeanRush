import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee',
  templateUrl: './empleado.html'
  ,imports: [CommonModule]
})
export class Empleado implements OnInit {
  user: any;
  orders = [
    { id: 1, number: '001', table: 'Mesa 2', items: 'Café x2, Sandwich', total: 120, status: 'pending' },
    { id: 2, number: '002', table: 'Llevar', items: 'Capuchino x1', total: 30, status: 'pending' },
    { id: 3, number: '003', table: 'Mesa 5', items: 'Té x1, Galleta x2', total: 45, status: 'preparing' }
  ];

  ngOnInit() {
    const userData = localStorage.getItem('currentUser');
    this.user = userData ? JSON.parse(userData) : null;
  }

  changeOrderStatus(order: any, newStatus: string) {
    order.status = newStatus;
  }

  getPendingOrders() {
    return this.orders.filter(order => order.status === 'pending');
  }

  getPreparingOrders() {
    return this.orders.filter(order => order.status === 'preparing');
  }

  logout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
  }
}