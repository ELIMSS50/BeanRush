import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer',
  templateUrl: './cliente.html',
  imports: [CommonModule]
})
export class Cliente implements OnInit {
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
  
  filteredProducts: any[] = [];
  selectedCategory: string = 'all';
  cart: any[] = [];
  total: number = 0;

  ngOnInit() {
    const userData = localStorage.getItem('currentUser');
    this.user = userData ? JSON.parse(userData) : null;
    this.filteredProducts = this.products;
  }

  filterProducts(category: string) {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product => product.category === category);
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
    this.total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  constructor(private router: Router) {}
  logout() {
    localStorage.removeItem('currentUser');
    window.location.href='login';
  }
}