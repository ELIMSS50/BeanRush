import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../services/products.service';
import { OrdersService } from '../services/orders.service';

@Component({
  selector: 'app-customer',
  standalone: true,
  templateUrl: './cliente.html',
  imports: [CommonModule, FormsModule]
})
export class Cliente implements OnInit {

  user: any;
  products: any[] = [];
  filteredProducts: any[] = [];
  selectedCategory: string = 'all';
  cart: any[] = [];
  total: number = 0;
  
  // Nuevas propiedades para mesa/cliente
  customerInfo: any = {
    type: 'table',
    tableNumber: '',
    customerName: '',
    customerPhone: ''
  };

  showCustomerModal: boolean = false;
  showWhatsAppModal: boolean = false;
  lastOrderId: number = 0;

  constructor(
    private router: Router,
    private productService: ProductsService,
    private ordersService: OrdersService
  ) {}

  ngOnInit() {
    const userData = localStorage.getItem('currentUser');
    this.user = userData ? JSON.parse(userData) : null;

    // Si no hay usuario, redirigir al visitante
    if (!this.user) {
      this.router.navigate(['/visitante']);
      return;
    }

    this.loadProducts();
    
    // Verificar si hay notificación WhatsApp pendiente
    this.checkWhatsAppNotification();
  }

  loadProducts() {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      this.filteredProducts = this.products.filter(p => 
        p.category !== 'combos' && p.category !== 'promociones'
      );
    });
  }

  // NUEVO: Verificar notificación WhatsApp después del pago
  checkWhatsAppNotification() {
    const whatsappNotification = localStorage.getItem('whatsappNotification');
    
    if (whatsappNotification) {
      const notification = JSON.parse(whatsappNotification);
      
      if (notification.show) {
        // Cargar información del pedido actual
        const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}');
        
        this.customerInfo = currentOrder.customerInfo || {};
        this.lastOrderId = notification.orderId;
        this.total = notification.total;
        
        // Mostrar modal de WhatsApp
        this.showWhatsAppModal = true;
        
        // Limpiar la notificación
        localStorage.removeItem('whatsappNotification');
        
        // Simular mensaje WhatsApp
        this.simulateWhatsAppMessage();
      }
    }
  }

  // MÉTODOS PARA COMBOS Y PROMOCIONES
  getCombos(): any[] {
    return this.products.filter(product => 
      product.category === 'combos'
    );
  }

  getPromotions(): any[] {
    return this.products.filter(product => 
      product.category === 'promociones'
    );
  }

  isCombo(product: any): boolean {
    return product.category === 'combos' || product.category === 'promociones';
  }

  getComboRealValue(product: any): number {
    if (!product.includedProducts || !Array.isArray(product.includedProducts)) {
      return product.price;
    }
    
    return product.includedProducts.reduce((total: number, item: any) => {
      return total + (item.price * item.qty);
    }, 0);
  }

  getComboExistingSavings(product: any): number {
    const realValue = this.getComboRealValue(product);
    return Math.max(0, realValue - product.price);
  }

  getComboExistingSavingsPercentage(product: any): number {
    const realValue = this.getComboRealValue(product);
    if (realValue === 0) return 0;
    return Math.round((this.getComboExistingSavings(product) / realValue) * 100);
  }

  filterProducts(category: string) {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredProducts = this.products.filter(p => 
        p.category !== 'combos' && p.category !== 'promociones'
      );
    } else {
      this.filteredProducts = this.products.filter(p => p.category === category);
    }
  }

  addToCart(product: any) {
    const existingItem = this.cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }
    this.calculateTotal();
  }

  increaseQuantity(index: number) {
    this.cart[index].quantity += 1;
    this.calculateTotal();
  }

  decreaseQuantity(index: number) {
    if (this.cart[index].quantity > 1) {
      this.cart[index].quantity -= 1;
      this.calculateTotal();
    }
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.total = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  openCustomerModal() {
    if (this.cart.length === 0) {
      alert('Agrega productos al carrito primero');
      return;
    }
    this.showCustomerModal = true;
  }

  closeCustomerModal() {
    this.showCustomerModal = false;
    // Resetear los valores
    this.customerInfo = {
      type: 'table',
      tableNumber: '',
      customerName: '',
      customerPhone: ''
    };
  }

  confirmCustomerInfo() {
    if (this.customerInfo.type === 'table' && !this.customerInfo.tableNumber) {
      alert('Por favor ingresa el número de mesa');
      return;
    }
    
    if (this.customerInfo.type === 'name') {
      if (!this.customerInfo.customerName) {
        alert('Por favor ingresa el nombre del cliente');
        return;
      }
      // Validar teléfono para pedidos para llevar
      if (!this.customerInfo.customerPhone) {
        alert('Por favor ingresa tu número de WhatsApp para recibir notificaciones');
        return;
      }
    }

    this.hacerPago();
  }

  hacerPago() {
    if (this.cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    // Determinar el identificador de la mesa/cliente
    const tableIdentifier = this.customerInfo.type === 'table' 
      ? `Mesa ${this.customerInfo.tableNumber}`
      : this.customerInfo.customerName;

    // Crear la orden para enviar a la BD
    const orderData = {
      table: tableIdentifier,
      items: this.cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.quantity,
        category: item.category
      })),
      status: 'pending',
      total: this.total,
      customerType: this.customerInfo.type,
      originalTable: this.customerInfo.tableNumber,
      originalName: this.customerInfo.customerName,
      customerPhone: this.customerInfo.customerPhone,
      orderDate: new Date().toISOString()
    };

    // Guardar en localStorage para usar en el componente de pagos
    localStorage.setItem('currentOrder', JSON.stringify({
      cart: this.cart,
      total: this.total,
      orderData: orderData,
      customerInfo: this.customerInfo
    }));

    this.closeCustomerModal();
    this.router.navigate(['/pagos']);
  }

  // NUEVO: Simular envío de mensaje WhatsApp (mejorado)
  simulateWhatsAppMessage() {
    const phoneNumber = this.customerInfo.customerPhone;
    const customerName = this.customerInfo.customerName;
    const orderId = this.lastOrderId;
    const total = this.total;
    
    console.log('📱 ENVIANDO MENSAJE WHATSAPP:');
    console.log('──────────────────────────────');
    console.log(`📞 Para: +${phoneNumber}`);
    console.log(`👤 Cliente: ${customerName}`);
    console.log(`📦 Orden #: ${orderId}`);
    console.log(`💵 Total: $${total}`);
    console.log(`⏰ Hora: ${new Date().toLocaleTimeString()}`);
    console.log('📝 Mensaje: "¡Hola! Tu pedido está listo para recoger en la barra. ¡Te esperamos!"');
    console.log('──────────────────────────────');
  }

  // NUEVO: Cerrar modal de WhatsApp y limpiar todo
  closeWhatsAppModal() {
    this.showWhatsAppModal = false;
    this.resetOrder();
  }

  // Resetear orden completamente
  resetOrder() {
    this.cart = [];
    this.total = 0;
    this.customerInfo = {
      type: 'table',
      tableNumber: '',
      customerName: '',
      customerPhone: ''
    };
    // Limpiar todo del localStorage
    localStorage.removeItem('currentOrder');
    localStorage.removeItem('whatsappNotification');
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentOrder');
    localStorage.removeItem('whatsappNotification');
    this.router.navigate(['/login']);
  }
}