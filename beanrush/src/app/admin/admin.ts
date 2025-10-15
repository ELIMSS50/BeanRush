import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  imports: [CommonModule],
  styleUrls: ['./admin.css']
})
export class Admin implements OnInit {
  user: any;
  products = [
    { id: 8, name: 'Agua Mineral', price: 25, category: 'bebidas' },
    { id: 10, name: 'Bagel con Queso Crema', price: 45, category: 'comida' },
    { id: 17, name: 'Brownie', price: 35, category: 'postres' },
    { id: 2, name: 'Capuchino', price: 60, category: 'bebidas' },
    { id: 18, name: 'Cheesecake', price: 55, category: 'postres' },
    { id: 6, name: 'Chocolate Caliente', price: 55, category: 'bebidas' },
    { id: 11, name: 'Croissant de Jamón', price: 40, category: 'comida' },
    { id: 12, name: 'Ensalada César', price: 75, category: 'comida' },
    { id: 19, name: 'Flan', price: 40, category: 'postres' },
    { id: 14, name: 'Galleta de Chocolate', price: 15, category: 'postres' },
    { id: 20, name: 'Helado de Vainilla', price: 35, category: 'postres' },
    { id: 7, name: 'Jugo de Naranja Natural', price: 40, category: 'bebidas' },
    { id: 1, name: 'Café Americano', price: 55, category: 'bebidas' },
    { id: 3, name: 'Latte', price: 65, category: 'bebidas' },
    { id: 4, name: 'Mocha', price: 70, category: 'bebidas' },
    { id: 15, name: 'Muffin de Arándanos', price: 30, category: 'postres' },
    { id: 16, name: 'Pastel de Zanahoria', price: 45, category: 'postres' },
    { id: 13, name: 'Quiche de Espinacas', price: 60, category: 'comida' },
    { id: 9, name: 'Sandwich de Jamón y Queso', price: 50, category: 'comida' },
    { id: 5, name: 'Té Verde', price: 45, category: 'bebidas' }
  ];

  orders = [
    { id: 1, number: '001', table: 'Mesa 2', items: 'Café Americano x2, Sandwich de... x1', total: 120, status: 'pending' },
    { id: 2, number: '002', table: 'Llevar', items: 'Capuchino x1', total: 30, status: 'pending' },
    { id: 3, number: '003', table: 'Mesa 5', items: 'Té Verde x1, Galleta de Chocolate x2', total: 45, status: 'preparing' }
  ];

  filteredProducts: any[] = [];
  selectedCategory: string = 'all';

  filteredOrder: any[] = [];
  selectedStatusOrder: string = 'all';

  cart: any[] = [];
  total: number = 0;

  ngOnInit() {
    const userData = localStorage.getItem('currentUser');
    this.user = userData ? JSON.parse(userData) : null;
    this.filteredProducts = this.products;
    this.filteredOrder = this.orders;
  }

  filterProducts(category: string) {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product => product.category === category);
    }
  }

  filterOrder(status: string) {
    this.selectedStatusOrder = status;
    if (status === 'all') {
      this.filteredOrder = this.orders;
    } else {
      this.filteredOrder = this.orders.filter(order => order.status === status);
    }
  }

  addToCart(product: any) {
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        ...product,
        quantity: 1
      });
    }
  }

  changeOrderStatus(order: any, newStatus: string) {
    order.status = newStatus;
    this.filterOrder(this.selectedStatusOrder);
  }

  cancelOrder(order: any, newStatus: string) {
    order.status = newStatus;
    this.filterOrder(this.selectedStatusOrder);
  }

  eraseProduct(product: any) {
    const index = this.products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      this.products.splice(index, 1);
      this.filterProducts(this.selectedCategory);
    }
  }

  modifyProduct(product: any, action: string) {
    const newName = prompt('Nuevo nombre del producto:', product.name);
    const newPrice = prompt('Nuevo precio:', product.price.toString());
    const newCategory = prompt('Nueva categoría (bebidas/comida/postres):', product.category);

    if (newName && newPrice && newCategory) {
      product.name = newName;
      product.price = parseInt(newPrice);
      product.category = newCategory;
    }
  }

  getPendingOrders() {
    return this.orders.filter(order => order.status === 'pending');
  }

  getPreparingOrders() {
    return this.orders.filter(order => order.status === 'preparing');
  }

  logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  }
}