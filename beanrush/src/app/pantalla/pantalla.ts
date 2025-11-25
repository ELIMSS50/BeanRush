import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrdersService } from '../services/orders.service';

@Component({
  selector: 'app-display',
  templateUrl: './pantalla.html',
  styleUrls: ['./pantalla.css'],
  imports: [CommonModule]
})
export class Pantalla implements OnInit, OnDestroy {
  orders: any[] = [];
  currentTime = new Date();
  private refreshInterval: any;
  private ordersInterval: any;
  private orderStartTimes: Map<number, { startTime: number, totalTime: number }> = new Map();

  constructor(
    private ordersService: OrdersService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadOrders();
    
    // Actualizar hora y tiempos cada segundo
    this.refreshInterval = setInterval(() => {
      this.currentTime = new Date();
      this.updateRemainingTimes();
    }, 1000);

    // Actualizar órdenes cada 10 segundos
    this.ordersInterval = setInterval(() => {
      this.loadOrders();
    }, 10000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    if (this.ordersInterval) clearInterval(this.ordersInterval);
  }

  loadOrders() {
    this.ordersService.getOrders().subscribe({
      next: (orders) => {
        const currentOrders = orders.filter(order => 
          order.status === 'pending' || order.status === 'preparing'
        );

        // Para cada orden nueva, establecer tiempo de inicio y duración aleatoria
        currentOrders.forEach(order => {
          if (!this.orderStartTimes.has(order.id)) {
            const totalTime = this.getRandomTime(); // Tiempo aleatorio entre 3-7 minutos
            this.orderStartTimes.set(order.id, {
              startTime: Date.now(),
              totalTime: totalTime
            });
          }
        });

        // Actualizar las órdenes con sus tiempos calculados
        this.orders = currentOrders.map(order => ({
          ...order,
          calculatedTotal: this.getOrderTotal(order),
          remainingTime: this.calculateRemainingTime(order.id),
          totalTime: this.orderStartTimes.get(order.id)?.totalTime || 300
        }));
      },
      error: (error) => {
        console.error('Error al cargar órdenes:', error);
      }
    });
  }

  // Generar tiempo aleatorio entre 3 y 7 minutos (180-420 segundos)
  getRandomTime(): number {
    return Math.floor(Math.random() * (420 - 180 + 1)) + 180;
  }

  updateRemainingTimes() {
    this.orders.forEach(order => {
      order.remainingTime = this.calculateRemainingTime(order.id);
    });
  }

  calculateRemainingTime(orderId: number): number {
    const orderTime = this.orderStartTimes.get(orderId);
    if (!orderTime) return 300;

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - orderTime.startTime) / 1000);
    const remaining = Math.max(0, orderTime.totalTime - elapsedSeconds);
    
    return remaining;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getTimeColor(seconds: number, totalTime: number): string {
    const percentage = (seconds / totalTime) * 100;
    
    if (percentage > 50) return 'time-ok'; // Más del 50% del tiempo - VERDE
    if (percentage > 25) return 'time-warning'; // Entre 25-50% - NARANJA
    return 'time-critical'; // Menos del 25% - ROJO
  }

  getTimeProgress(seconds: number, totalTime: number): number {
    return Math.max(0, ((totalTime - seconds) / totalTime) * 100);
  }

  getTimeLabel(totalTime: number): string {
    const minutes = Math.floor(totalTime / 60);
    return `${minutes} min`;
  }

  getOrderTotal(order: any): number {
    return order.items.reduce((total: number, item: any) => total + (item.price * item.qty), 0);
  }

  getStatusColor(status: string): string {
    return status === 'preparing' ? 'status-preparing' : 'status-pending';
  }

  getStatusText(status: string): string {
    return status === 'preparing' ? 'PREPARANDO' : 'PENDIENTE';
  }

  getItemsString(order: any): string {
    return order.items.map((item: any) => `${item.name} x${item.qty}`).join(', ');
  }

  goToEmployeeView() {
    this.router.navigate(['/employee']);
  }
}