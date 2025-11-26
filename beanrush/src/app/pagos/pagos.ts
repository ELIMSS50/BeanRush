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
      const savedOrder = await this.saveOrderToDatabase();
      
      this.paymentStatus = 'PAGO EXITOSO - ORDEN CREADA';
      this.addLog('✅ Pago completado y orden guardada en sistema');
      
      // NUEVO: Mostrar notificación WhatsApp si es pedido para llevar
      this.handlePostPaymentActions(savedOrder);
      
    } catch (error) {
      this.paymentStatus = 'ERROR EN EL PAGO';
      this.addLog('❌ Error al procesar el pago');
      this.isProcessing = false;
    }
  }

  // NUEVO: Manejar acciones después del pago
  private handlePostPaymentActions(savedOrder: any) {
    const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}');
    const customerInfo = currentOrder.customerInfo;
    
    // Verificar si es pedido para llevar y tiene teléfono
    if (customerInfo && customerInfo.type === 'name' && customerInfo.customerPhone) {
      this.addLog('📱 Preparando notificación WhatsApp para pedido para llevar');
      
      // Guardar información para mostrar en el modal
      localStorage.setItem('whatsappNotification', JSON.stringify({
        show: true,
        customerName: customerInfo.customerName,
        customerPhone: customerInfo.customerPhone,
        orderId: savedOrder.id || savedOrder._id,
        total: this.currentOrder.total
      }));
      
      // Redirigir a cliente para mostrar el modal
      setTimeout(() => {
        this.cleanupAndRedirect();
      }, 1500);
      
    } else {
      // Para pedidos de mesa, redirigir normalmente
      setTimeout(() => {
        this.cleanupAndRedirect();
      }, 2000);
    }
  }

  // MODIFICAR: El método cleanupAndRedirect para no resetear todo inmediatamente
  private cleanupAndRedirect() {
    // Limpiar solo lo necesario, mantener la info para el modal
    this.isProcessing = false;
    this.selectedMethod = '';
    this.cashReceived = 0;
    
    // No limpiar currentOrder todavía, se necesita en cliente
    this.router.navigate(['/customer']);
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