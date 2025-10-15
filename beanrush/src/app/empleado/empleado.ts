import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee',
  templateUrl: './empleado.html'
  ,imports: [CommonModule]
})
export class Empleado implements OnInit {
  user: any;
  orders = [
    { id: 1, number: '001', table: 'Mesa 2', items: 'Café Americano x2, Sandwich de... x1', total: 120, status: 'pending' },
    { id: 2, number: '002', table: 'Llevar', items: 'Capuchino x1', total: 30, status: 'pending' },
    { id: 3, number: '003', table: 'Mesa 5', items: 'Té Verde x1, Galleta de Chocolate x2', total: 45, status: 'preparing' }
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

  constructor(private router: Router) {}
  logout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
  }
}