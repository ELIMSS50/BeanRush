import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../services/orders.service';
import { Order, Product } from '../models/order.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee',
  templateUrl: './empleado.html',
  standalone: true,
  imports: [CommonModule]
})
export class Empleado implements OnInit {
  orders: Order[] = [];
  user: any;

  constructor(
    private ordersService: OrdersService
  ) {}

  ngOnInit() {
    const userData = localStorage.getItem('currentUser');
    this.user = userData ? JSON.parse(userData) : null;

    this.ordersService.getOrders().subscribe((data: Order[]) => {
      this.orders = data;
    });
  }

  changeOrderStatus(order: Order, newStatus: 'pending' | 'preparing' | 'done' | 'completed') {
    order.status = newStatus;
    this.ordersService.updateOrderStatus(order.id, newStatus).subscribe();
  }

  getItemsString(order: Order): string {
    return order.items.map((item: Product) => `${item.name} x${item.qty} ($${item.price})`).join(', ');
  }

  // MÉTODO NUEVO PARA CALCULAR EL TOTAL
  getOrderTotal(order: Order): number {
    return order.items.reduce((total, item) => total + (item.price * item.qty), 0);
  }

  getPendingOrders(): Order[] {
    return this.orders.filter(order => order.status === 'pending');
  }

  getPreparingOrders(): Order[] {
    return this.orders.filter(order => order.status === 'preparing');
  }

  proyectar() {
    localStorage.removeItem('currentUser');
    window.location.href = 'pantalla';
  }

  logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login';
  }
}