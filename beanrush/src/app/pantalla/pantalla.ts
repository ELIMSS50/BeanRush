import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-display',
  templateUrl: './pantalla.html',
  styleUrls: ['./pantalla.css']
  ,imports: [CommonModule]
})
export class Pantalla implements OnInit, OnDestroy {
  orders = [
    { 
      number: '001', 
      table: 'Mesa 3', 
      items: 'Café x2, Sandwich', 
      total: 120, 
      status: 'preparing',
      time: 5,
      createdAt: new Date()
    },
    { 
      number: '002', 
      table: 'Llevar', 
      items: 'Capuchino, Galleta', 
      total: 80, 
      status: 'pending',
      time: 2,
      createdAt: new Date()
    },
    { 
      number: '003', 
      table: 'Mesa 1', 
      items: 'Té, Postre x2', 
      total: 150, 
      status: 'preparing',
      time: 8,
      createdAt: new Date()
    }
  ];

  currentTime = new Date();
  private refreshInterval: any;

  ngOnInit() {
    // Actualizar hora cada segundo
    this.refreshInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

    // Simular actualización de órdenes cada 10 segundos
    setInterval(() => {
      this.simulateOrderUpdates();
    }, 10000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  simulateOrderUpdates() {
    // En una app real, aquí harías una petición HTTP
    this.orders.forEach(order => {
      if (order.status === 'preparing' && order.time > 0) {
        order.time--;
        if (order.time <= 0) {
          order.status = 'ready';
        }
      }
    });
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'preparing': return 'status-preparing';
      case 'ready': return 'status-ready';
      default: return 'status-pending';
    }
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'pending': return 'PENDIENTE';
      case 'preparing': return 'PREPARANDO';
      case 'ready': return 'LISTO';
      default: return 'PENDIENTE';
    }
  }
}
