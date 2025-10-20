import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-simulator',
  templateUrl: './pagos.html',
  styleUrls: ['./pagos.css']
  ,imports: [CommonModule, FormsModule]
})
export class Pagos {
  currentOrder = {
    number: '001',
    total: 120,
    items: [
      { name: 'Café Americano', price: 25, quantity: 2 },
      { name: 'Sandwich', price: 50, quantity: 1 }
    ]
  };

  paymentMethods = ['EFECTIVO', 'TARJETA', 'QR'];
  selectedMethod: string = 'EFECTIVO';
  cashReceived: number = 0;
  change: number = 0;
  
  paymentStatus: string = '';
  paymentLogs: string[] = [];

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

  processPayment() {
    if (this.selectedMethod === 'EFECTIVO' && this.cashReceived < this.currentOrder.total) {
      this.paymentStatus = 'ERROR: Efectivo insuficiente';
      this.addLog('Pago fallido: Efectivo insuficiente');
      return;
    }

    this.paymentStatus = 'PROCESANDO...';
    this.addLog(`Iniciando pago con ${this.selectedMethod}`);

    // Simular procesamiento
    setTimeout(() => {
      this.paymentStatus = 'PAGO EXITOSO';
      this.addLog('✅ Pago completado exitosamente');
      this.resetForm();
    }, 2000);
  }

  simulatePaymentSuccess() {
    this.paymentStatus = 'PROCESANDO...';
    this.addLog('Simulando pago exitoso...');

    setTimeout(() => {
      this.paymentStatus = 'PAGO EXITOSO';
      this.addLog('✅ Pago simulado exitosamente');
      this.resetForm();
    }, 1500);
  }

  simulatePaymentFailure() {
    this.paymentStatus = 'PROCESANDO...';
    this.addLog('Simulando pago fallido...');

    setTimeout(() => {
      this.paymentStatus = 'PAGO RECHAZADO';
      this.addLog('❌ Pago simulado rechazado');
      this.resetForm();
    }, 1500);
  }

  private resetForm() {
    this.cashReceived = 0;
    this.change = 0;
    this.selectedMethod = 'EFECTIVO';
    
    // Generar nueva orden de prueba
    this.currentOrder.number = '00' + (Math.floor(Math.random() * 9) + 1);
    this.currentOrder.total = Math.floor(Math.random() * 200) + 50;
  }

  private addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.paymentLogs.unshift(`[${timestamp}] ${message}`);
    
    // Mantener solo los últimos 10 logs
    if (this.paymentLogs.length > 10) {
      this.paymentLogs.pop();
    }
  }
}