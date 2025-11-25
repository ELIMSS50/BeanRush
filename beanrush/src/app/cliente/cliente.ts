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
    customerName: ''
  };
  showCustomerModal: boolean = false;

  constructor(
    private router: Router,
    private productService: ProductsService,
    private ordersService: OrdersService
  ) {}

  ngOnInit() {
    const userData = localStorage.getItem('currentUser');
    this.user = userData ? JSON.parse(userData) : null;

    this.productService.getProducts().subscribe(data => {
      this.products = data;
      this.filteredProducts = data;
    });
  }

  filterProducts(category: string) {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredProducts = this.products;
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
      customerName: ''
    };
  }

  confirmCustomerInfo() {
    if (this.customerInfo.type === 'table' && !this.customerInfo.tableNumber) {
      alert('Por favor ingresa el número de mesa');
      return;
    }
    
    if (this.customerInfo.type === 'name' && !this.customerInfo.customerName) {
      alert('Por favor ingresa el nombre del cliente');
      return;
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
      originalName: this.customerInfo.customerName
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

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentOrder');
    this.router.navigate(['/login']);
  }
}