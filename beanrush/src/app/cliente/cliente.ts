import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer',
  templateUrl: './cliente.html'
  ,imports: [CommonModule]
})
export class Cliente implements OnInit {
  user: any;
  products = [
    { id: 1, name: 'Café Americano', price: 25, category: 'bebidas' },
    { id: 2, name: 'Capuchino', price: 30, category: 'bebidas' },
    { id: 3, name: 'Sandwich', price: 50, category: 'comida' },
    { id: 4, name: 'Galleta', price: 15, category: 'postres' }
  ];
  
  cart: any[] = [];
  total: number = 0;

  ngOnInit() {
    const userData = localStorage.getItem('currentUser');
    this.user = userData ? JSON.parse(userData) : null;
  }

  addToCart(product: any) {
    this.cart.push(product);
    this.calculateTotal();
  }

  calculateTotal() {
    this.total = this.cart.reduce((sum, item) => sum + item.price, 0);
  }

  logout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
  }
}