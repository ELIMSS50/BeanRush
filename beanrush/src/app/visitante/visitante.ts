import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../services/products.service';

@Component({
  selector: 'app-visitante',
  standalone: true,
  templateUrl: './visitante.html',
  styleUrl: './visitante.css',
  imports: [CommonModule, FormsModule]
})
export class Visitante implements OnInit {

  products: any[] = [];
  filteredProducts: any[] = [];
  selectedCategory: string = 'all';

  constructor(
    private router: Router,
    private productService: ProductsService
  ) {}

  ngOnInit() {
    console.log('🔍 Visitante component initialized');
    
    // Si ya hay un usuario logueado, redirigir según su rol
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('👤 User found:', user);
      if (user.role === 'cliente') {
        this.router.navigate(['/customer']);
      } else if (user.role === 'admin') {
        this.router.navigate(['/admin']);
      } else if (user.role === 'empleado') {
        this.router.navigate(['/employee']);
      }
      return;
    }

    this.loadProducts();
  }

  loadProducts() {
    console.log('🔄 Loading products from service...');
    
    this.productService.getProducts().subscribe({
      next: (data) => {
        console.log('✅ Products received:', data);
        console.log('📦 Number of products:', data?.length);
        
        if (data && data.length > 0) {
          this.products = data;
          this.filteredProducts = this.products.filter(p => 
            p.category !== 'combos' && p.category !== 'promociones'
          );
          console.log('🛍️ Filtered products:', this.filteredProducts.length);
          console.log('🔄 Combos:', this.getCombos().length);
          console.log('🎯 Promotions:', this.getPromotions().length);
        } else {
          console.warn('⚠️ No products received from service');
          // Si no hay datos, intenta cargar datos de prueba
          this.loadMockProducts();
        }
      },
      error: (error) => {
        console.error('❌ Error loading products:', error);
        console.log('🔄 Loading mock products due to error');
        this.loadMockProducts();
      }
    });
  }

  // Datos de prueba como fallback
  loadMockProducts() {
    console.log('🔄 Loading mock products...');
    this.products = [
      { id: 1, name: 'Café Americano', price: 25, category: 'bebidas', qty: 0 },
      { id: 2, name: 'Café Latte', price: 35, category: 'bebidas', qty: 0 },
      { id: 3, name: 'Sandwich de Jamón', price: 45, category: 'comida', qty: 0 },
      { id: 4, name: 'Pastel de Chocolate', price: 30, category: 'postres', qty: 0 },
      { 
        id: 5, 
        name: 'Combo Desayuno', 
        price: 80, 
        category: 'combos',
        qty: 0,
        includedProducts: [
          { id: 1, name: 'Café Americano', price: 25, qty: 1 },
          { id: 3, name: 'Sandwich de Jamón', price: 45, qty: 1 }
        ]
      },
      { 
        id: 6, 
        name: 'Promo 2x1 Café', 
        price: 25, 
        category: 'promociones',
        qty: 0,
        includedProducts: [
          { id: 1, name: 'Café Americano', price: 25, qty: 2 }
        ]
      }
    ];
    
    this.filteredProducts = this.products.filter(p => 
      p.category !== 'combos' && p.category !== 'promociones'
    );
    
    console.log('✅ Mock products loaded');
    console.log('📦 Total products:', this.products.length);
    console.log('🛍️ Filtered products:', this.filteredProducts.length);
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
    alert('Para agregar productos al carrito, necesitas iniciar sesión como cliente.');
    this.goToLogin();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/registro']);
  }
}