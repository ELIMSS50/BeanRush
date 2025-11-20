import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../services/products.service';
import { OrdersService } from '../services/orders.service';
import { Order, Product, OrderStatus } from '../models/order.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  standalone: true,
  imports: [CommonModule],
})
export class Admin implements OnInit {
  // Usuario
  user: any;

  // Productos (cliente)
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: string = 'all';
  cart: any[] = [];
  total: number = 0;

  // Órdenes (empleado)
  orders: Order[] = [];

  constructor(
    private router: Router,
    private productService: ProductsService,
    private ordersService: OrdersService
  ) {}

  ngOnInit() {
    const userData = localStorage.getItem('currentUser');
    this.user = userData ? JSON.parse(userData) : null;

    // Traer productos  
    this.productService.getProducts().subscribe(data => {  
      this.products = data;  
      this.filteredProducts = data;  
    });  

    // Traer órdenes  
    this.ordersService.getOrders().subscribe(data => {  
      this.orders = data;  
    });  
  }

  filterProducts(category: string) {
    this.selectedCategory = category;
    this.filteredProducts = category === 'all'
    ? this.products
    : this.products.filter(p => p.category === category);
  }

  addToCart(product: Product) {
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

  getItemsString(order: Order): string {
    return order.items.map(item => `${item.name} x${item.qty} ($${item.price})`).join(', ');
  }

  getPendingOrders(): Order[] {
    return this.orders.filter(order => order.status === 'pending');
  }

  getPreparingOrders(): Order[] {
    return this.orders.filter(order => order.status === 'preparing');
  }

  changeOrderStatus(order: Order, newStatus: 'canceled' | 'pending' | 'preparing' | 'completed') {
    order.status = newStatus;
    this.ordersService.updateOrderStatus(order.id, newStatus).subscribe();
  }

  cancelOrder(order: Order, newStatus?: OrderStatus) {
    if (newStatus) {
      order.status = newStatus;
      this.ordersService.updateOrderStatus(order.id, newStatus).subscribe();
    }
    const index = this.orders.findIndex(o => o.id === order.id);
    if (index !== -1) this.orders.splice(index, 1);
  }

  getOrderTotal(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  modifyProduct(product: Product) {
    const newName = prompt('Nuevo nombre del producto:', product.name);
    const newPrice = prompt('Nuevo precio:', product.price.toString());
    const newCategory = prompt('Nueva categoría (bebidas/comida/postres):', product.category || '');

    if (newName && newPrice && newCategory) {
      product.name = newName;
      product.price = parseFloat(newPrice);
      product.category = newCategory;
      this.filterProducts(this.selectedCategory);
    }
  }

  eraseProduct(product: Product) {
    const index = this.products.findIndex(p => p.id === product.id);
    if (index !== -1) {
    this.products.splice(index, 1);
    this.filterProducts(this.selectedCategory);
    }
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}