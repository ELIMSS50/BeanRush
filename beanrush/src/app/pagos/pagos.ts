import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrdersService } from '../services/orders.service';

@Component({
  selector: 'app-payment-simulator',
  templateUrl: './pagos.html',
  styleUrls: ['./pagos.css'],
  imports: [CommonModule, FormsModule]
})
export class Pagos implements OnInit {
  currentOrder: any = {
    number: '001',
    total: 0,
    items: []
  };

  paymentMethods = ['EFECTIVO', 'TARJETA', 'QR'];
  selectedMethod: string = 'EFECTIVO';
  cashReceived: number = 0;
  change: number = 0;
  
  paymentStatus: string = '';
  paymentLogs: string[] = [];
  isProcessing: boolean = false;

  constructor(
    private ordersService: OrdersService,
    private router: Router
  ) {}

  ngOnInit() {
    // Cargar la orden del localStorage
    const savedOrder = localStorage.getItem('currentOrder');
    if (savedOrder) {
      const orderData = JSON.parse(savedOrder);
      this.currentOrder = {
        number: this.generateOrderNumber(),
        total: orderData.total,
        items: orderData.cart,
        customerInfo: orderData.customerInfo,
        table: orderData.orderData.table
      };
    }
  }

  generateOrderNumber(): string {
    return 'ORD' + Date.now().toString().slice(-6);
  }

  selectMethod(method: string) {
    this.selectedMethod = method;
    this.addLog(`Método seleccionado: ${method}`);
  }

  calculateChange() {
    if (this.selectedMethod === 'EFECTIVO' && this.cashReceived > 0) {
      this.change = this.cashReceived - this.currentOrder.total;
    } else {
      this.change = 0;
    }
  }

  async processPayment() {
    if (this.isProcessing) return;

    if (this.selectedMethod === 'EFECTIVO' && this.cashReceived < this.currentOrder.total) {
      this.paymentStatus = 'ERROR: Efectivo insuficiente';
      this.addLog('Pago fallido: Efectivo insuficiente');
      return;
    }

    this.isProcessing = true;
    this.paymentStatus = 'PROCESANDO PAGO...';
    this.addLog(`Iniciando pago con ${this.selectedMethod}`);

    try {
      // Simular procesamiento de pago
      await this.simulatePaymentProcessing();
      
      // Guardar la orden en la base de datos
      await this.saveOrderToDatabase();
      
      this.paymentStatus = 'PAGO EXITOSO - ORDEN CREADA';
      this.addLog('✅ Pago completado y orden guardada en sistema');
      
      // Limpiar y redirigir después de éxito
      setTimeout(() => {
        this.cleanupAndRedirect();
      }, 2000);
      
    } catch (error) {
      this.paymentStatus = 'ERROR EN EL PAGO';
      this.addLog('❌ Error al procesar el pago');
      this.isProcessing = false;
    }
  }

  private simulatePaymentProcessing(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }

  private async saveOrderToDatabase() {
    const savedOrder = localStorage.getItem('currentOrder');
    if (!savedOrder) throw new Error('No hay orden para guardar');

    const orderData = JSON.parse(savedOrder);
    
    const orderToSave = {
      id: Date.now(),
      table: orderData.orderData.table, // Usa la mesa/cliente
      items: orderData.orderData.items,
      status: 'pending' as const,
      total: this.currentOrder.total,
      paymentMethod: this.selectedMethod,
      customerType: orderData.customerInfo.type,
      originalTable: orderData.customerInfo.tableNumber,
      originalName: orderData.customerInfo.customerName
    };

    return this.ordersService.createOrder(orderToSave).toPromise();
  }

  simulatePaymentSuccess() {
    this.processPayment();
  }

  simulatePaymentFailure() {
    this.paymentStatus = 'PROCESANDO...';
    this.addLog('Simulando pago fallido...');

    setTimeout(() => {
      this.paymentStatus = 'PAGO RECHAZADO';
      this.addLog('❌ Pago simulado rechazado');
      this.isProcessing = false;
    }, 1500);
  }

  private cleanupAndRedirect() {
    // Limpiar localStorage
    localStorage.removeItem('currentOrder');
    
    // Redirigir al menú principal
    setTimeout(() => {
      this.router.navigate(['/customer']);
    }, 1000);
  }

  cancelPayment() {
    if (confirm('¿Estás seguro de que quieres cancelar el pago?')) {
      this.router.navigate(['/customer']);
    }
  }

  private addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.paymentLogs.unshift(`[${timestamp}] ${message}`);
    
    if (this.paymentLogs.length > 10) {
      this.paymentLogs.pop();
    }
  }
}