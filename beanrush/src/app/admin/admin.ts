import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../services/products.service';
import { OrdersService } from '../services/orders.service';
import { Order, Product, OrderStatus } from '../models/order.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class Admin implements OnInit {
  // Usuario
  user: any;

  // Productos
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: string = 'all';

  // Órdenes
  orders: Order[] = [];

  // Variables para modales
  showCreateOrderModal: boolean = false;
  showAddProductModal: boolean = false;
  showAddComboPromModal: boolean = false;
  showEditComboPromModal: boolean = false;
  showEditOrderModal: boolean = false;
  showCompletedOrders: boolean = false;

  // Nueva orden
  newOrder: any = {
    table: '',
    items: [],
    status: 'pending'
  };
  selectedProductId: string = '';

  // Nuevo producto
  newProduct: any = {
    name: '',
    price: 0,
    category: ''
  };

  // Combos/Promociones
  selectedComboProducts: any[] = [];
  selectedProductForCombo: string = '';
  comboPromData: any = {
    name: '',
    price: 0,
    category: '',
    description: '',
    includedProducts: []
  };

  // Edición
  editingProduct: any = null;
  editingOrder: Order | null = null;
  originalOrder: Order | null = null;

  constructor(
    private router: Router,
    private productService: ProductsService,
    private ordersService: OrdersService
  ) {}

  ngOnInit() {
    const userData = localStorage.getItem('currentUser');
    this.user = userData ? JSON.parse(userData) : null;

    this.loadProducts();
    this.loadOrders();
  }

  // ========== MÉTODOS DE CARGA ==========
  private loadProducts() {
    this.productService.getProducts().subscribe(data => {  
      this.products = data;  
      this.filteredProducts = data;
      console.log('📦 Productos cargados:', this.products.length);
    });  
  }

  private loadOrders() {
    this.ordersService.getOrders().subscribe(data => {  
      this.orders = data;  
    });  
  }

  // ========== MÉTODOS DE FILTRADO ==========
  getRegularProducts(): Product[] {
    return this.products.filter(product => 
      product.category !== 'combos' && 
      product.category !== 'promociones'
    );
  }

  getCombos(): Product[] {
    return this.products.filter(product => 
      product.category === 'combos'
    );
  }

  getPromotions(): Product[] {
    return this.products.filter(product => 
      product.category === 'promociones'
    );
  }

  isCombo(product: Product): boolean {
    return product.category === 'combos' || product.category === 'promociones';
  }

  filterProducts(category: string) {
    this.selectedCategory = category;
    this.filteredProducts = category === 'all'
      ? this.products.filter(p => 
          p.category !== 'combos' && p.category !== 'promociones'
        )
      : this.products.filter(p => p.category === category);
  }

  // ========== MÉTODOS DE PRODUCTOS ==========
  openAddProductModal() {
    this.newProduct = { name: '', price: 0, category: '' };
    this.showAddProductModal = true;
  }

  closeAddProductModal() {
    this.showAddProductModal = false;
  }

  addNewProduct() {
    if (this.newProduct.name && this.newProduct.price > 0 && this.newProduct.category) {
      const newId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
      
      const productToAdd: Product = {
        id: newId,
        name: this.newProduct.name,
        price: parseFloat(this.newProduct.price),
        category: this.newProduct.category,
        qty: 0
      };

      this.productService.addProduct(productToAdd).subscribe({
        next: (response) => {
          this.products.push(response);
          this.filterProducts(this.selectedCategory);
          this.closeAddProductModal();
          alert('Producto agregado exitosamente');
        },
        error: (error) => {
          alert('Error al agregar el producto: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  modifyProduct(product: Product) {
    if (this.isCombo(product)) {
      this.openEditComboPromModal(product);
    } else {
      const newName = prompt('Nuevo nombre:', product.name);
      const newPrice = prompt('Nuevo precio:', product.price.toString());
      const newCategory = prompt('Nueva categoría (bebidas/comida/postres):', product.category || '');

      if (newName && newPrice && newCategory) {
        const updatedProduct = {
          ...product,
          name: newName,
          price: parseFloat(newPrice),
          category: newCategory
        };

        this.productService.updateProduct(updatedProduct).subscribe({
          next: (response) => {
            const index = this.products.findIndex(p => p.id === product.id);
            if (index !== -1) {
              this.products[index] = response;
              this.filterProducts(this.selectedCategory);
            }
          },
          error: (error) => {
            alert('Error al actualizar el producto');
          }
        });
      }
    }
  }

  eraseProduct(product: Product) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productService.deleteProduct(product.id).subscribe({
        next: (response) => {
          const index = this.products.findIndex(p => p.id === product.id);
          if (index !== -1) {
            this.products.splice(index, 1);
            this.filterProducts(this.selectedCategory);
          }
        },
        error: (error) => {
          alert('Error al eliminar el producto');
        }
      });
    }
  }

  // ========== MÉTODOS DE COMBOS/PROMOCIONES ==========
  openAddComboPromModal() {
    this.comboPromData = {
      name: '',
      price: 0,
      category: '',
      description: '',
      includedProducts: []
    };
    this.selectedComboProducts = [];
    this.selectedProductForCombo = '';
    this.showAddComboPromModal = true;
  }

  closeAddComboPromModal() {
    this.showAddComboPromModal = false;
  }

  openEditComboPromModal(product: any) {
    this.editingProduct = { ...product };
    this.comboPromData = {
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || '',
      includedProducts: product.includedProducts || []
    };
    this.selectedComboProducts = product.includedProducts?.map((item: any) => ({
      ...item,
      comboQty: item.qty || 1
    })) || [];
    
    this.showEditComboPromModal = true;
  }

  closeEditComboPromModal() {
    this.showEditComboPromModal = false;
    this.editingProduct = null;
  }

  addNewComboProm() {
    if (this.comboPromData.name && this.comboPromData.price > 0 && 
        this.comboPromData.category && this.selectedComboProducts.length > 0) {
      
      const newId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
      
      // CORREGIR: Asegurar que includedProducts tenga la estructura correcta
      const includedProducts = this.selectedComboProducts.map(product => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        qty: Number(product.comboQty) || 1,
        category: product.category
      }));

      const comboToAdd = {
        id: newId,
        name: this.comboPromData.name.trim(),
        price: Number(this.comboPromData.price),
        category: this.comboPromData.category,
        qty: 0,
        description: this.comboPromData.description?.trim() || '',
        includedProducts: includedProducts, // ← Esto debe enviarse correctamente
        isCombo: true
      };

      console.log('🚀 ENVIANDO COMBO AL BACKEND:', comboToAdd);

      this.productService.addProduct(comboToAdd).subscribe({
        next: (response) => {
          console.log('✅ COMBO CREADO:', response);
          // VERIFICAR que la respuesta incluya includedProducts
          if (!response.includedProducts || response.includedProducts.length === 0) {
            console.warn('⚠️ El combo se creó pero includedProducts está vacío');
          }
          this.products.push(response);
          this.filterProducts(this.selectedCategory);
          this.closeAddComboPromModal();
          alert('Combo o Promoción agregado exitosamente');
        },
        error: (error) => {
          console.error('❌ ERROR:', error);
          alert('Error: ' + (error.error?.message || error.message));
        }
      });
    } else {
      alert('Por favor completa todos los campos y agrega al menos un producto al combo');
    }
  }

  updateComboProm() {
  if (this.comboPromData.name && this.comboPromData.price > 0 && 
      this.comboPromData.category && this.selectedComboProducts.length > 0 && this.editingProduct) {
    
    // CORREGIR: Actualizar includedProducts con los productos seleccionados
    const includedProducts = this.selectedComboProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      qty: Number(product.comboQty) || 1,
      category: product.category
    }));

    const updatedCombo = {
      ...this.editingProduct,
      name: this.comboPromData.name,
      price: parseFloat(this.comboPromData.price),
      category: this.comboPromData.category,
      description: this.comboPromData.description,
      includedProducts: includedProducts, // ← Asegurar que se envíe
      isCombo: true
    };

    console.log('🔄 ACTUALIZANDO COMBO:', updatedCombo);

    this.productService.updateProduct(updatedCombo).subscribe({
      next: (response) => {
        console.log('✅ COMBO ACTUALIZADO:', response);
        const index = this.products.findIndex(p => p.id === this.editingProduct.id);
        if (index !== -1) {
          this.products[index] = response;
          this.filterProducts(this.selectedCategory);
        }
        this.closeEditComboPromModal();
        alert('Combo o Promoción actualizado exitosamente');
      },
      error: (error) => {
        console.error('❌ ERROR ACTUALIZANDO:', error);
        alert('Error al actualizar el combo o promoción: ' + (error.error?.message || error.message));
      }
    });
  }
}

  // ========== MÉTODOS DE COMBOS ==========
  addProductToCombo() {
  if (this.selectedProductForCombo) {
    const productId = parseInt(this.selectedProductForCombo);
    const product = this.products.find(p => p.id === productId);
    
    if (product) {
      const existingProduct = this.selectedComboProducts.find(p => p.id === product.id);
      
      if (!existingProduct) {
        // Agregar a la lista visual
        this.selectedComboProducts.push({
          ...product,
          comboQty: 1
        });
        
        // AGREGAR TAMBIÉN a includedProducts del comboPromData
        this.comboPromData.includedProducts.push({
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          category: product.category
        });
        
        this.calculateComboPrice();
      }
      
      this.selectedProductForCombo = '';
    }
  }
}

  removeProductFromCombo(index: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto del combo?')) {
      this.selectedComboProducts.splice(index, 1);
      this.comboPromData.includedProducts.splice(index, 1);
      this.calculateComboPrice();
    }
  }

  increaseComboProductQuantity(index: number) {
    this.selectedComboProducts[index].comboQty += 1;
    this.comboPromData.includedProducts[index].qty += 1;
    this.calculateComboPrice();
  }

  decreaseComboProductQuantity(index: number) {
    if (this.selectedComboProducts[index].comboQty > 1) {
      this.selectedComboProducts[index].comboQty -= 1;
      this.comboPromData.includedProducts[index].qty -= 1;
      this.calculateComboPrice();
    }
  }

  calculateComboPrice(): number {
    const calculatedPrice = this.selectedComboProducts.reduce((total, product) => {
      return total + (product.price * product.comboQty);
    }, 0);
    
    if (this.comboPromData.price === 0 || this.comboPromData.price === calculatedPrice) {
      this.comboPromData.price = calculatedPrice;
    }
    
    if (this.comboPromData.category === 'promociones' && this.selectedComboProducts.length > 1) {
      this.comboPromData.price = calculatedPrice * 0.9;
    }
    
    return calculatedPrice;
  }

  isProductInCombo(productId: number): boolean {
    return this.selectedComboProducts?.some(p => p.id === productId) || false;
  }

  getComboProductsTotal(): number {
    return this.selectedComboProducts.reduce((total, product) => {
      return total + (product.price * product.comboQty);
    }, 0);
  }

  // ========== MÉTODOS DE CÁLCULO ==========
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

  // ========== MÉTODOS DE ÓRDENES ==========
  openCreateOrderModal() {
    this.newOrder = { table: '', items: [], status: 'pending' };
    this.selectedProductId = '';
    this.showCreateOrderModal = true;
  }

  closeCreateOrderModal() {
    this.showCreateOrderModal = false;
  }

  openEditOrderModal(order: Order) {
    this.originalOrder = order;
    this.editingOrder = {
      id: order.id,
      table: order.table,
      status: order.status,
      items: order.items.map(item => ({ ...item }))
    };
    this.showEditOrderModal = true;
  }

  closeEditOrderModal() {
    this.showEditOrderModal = false;
    this.editingOrder = null;
    this.originalOrder = null;
  }

  onProductSelect() {
    if (this.selectedProductId) {
      const productId = parseInt(this.selectedProductId);
      const product = this.products.find(p => p.id === productId);
      
      if (product) {
        const existingItem = this.newOrder.items.find((item: any) => item.id === product.id);
        
        if (existingItem) {
          existingItem.qty += 1;
        } else {
          this.newOrder.items.push({
            id: product.id,
            name: product.name,
            price: product.price,
            qty: 1,
            category: product.category
          });
        }
      }
    }
  }

  clearProductSelection() {
    this.selectedProductId = '';
  }

  increaseNewItemQuantity(index: number) {
    this.newOrder.items[index].qty += 1;
  }

  decreaseNewItemQuantity(index: number) {
    if (this.newOrder.items[index].qty > 1) {
      this.newOrder.items[index].qty -= 1;
    }
  }

  removeItemFromNewOrder(index: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este item de la orden?')) {
      this.newOrder.items.splice(index, 1);
    }
  }

  getNewOrderTotal(): number {
    return this.newOrder.items.reduce((sum: number, item: any) => sum + item.price * item.qty, 0);
  }

  createNewOrder() {
    if (this.newOrder.table && this.newOrder.items.length > 0) {
      const newOrderId = this.orders.length > 0 ? Math.max(...this.orders.map(o => o.id)) + 1 : 1;
      
      const orderToCreate: any = {
        id: newOrderId,
        table: this.newOrder.table,
        items: this.newOrder.items.map((item: any) => ({ ...item })),
        status: 'pending' as OrderStatus
      };

      this.ordersService.createOrder(orderToCreate).subscribe({
        next: (response) => {
          this.orders.push(response);
          this.closeCreateOrderModal();
          alert('Orden creada exitosamente');
        },
        error: (error) => {
          alert('Error al crear la orden: ' + (error.error?.message || error.message));
        }
      });
    } else {
      alert('Por favor completa la mesa y agrega al menos un producto');
    }
  }

  updateOrder() {
    if (this.editingOrder && this.originalOrder) {
      const orderToUpdate: any = {
        id: this.editingOrder.id,
        table: this.editingOrder.table,
        status: this.editingOrder.status,
        items: this.editingOrder.items.map(item => ({ ...item }))
      };

      this.ordersService.updateOrder(orderToUpdate).subscribe({
        next: (response) => {
          this.originalOrder!.table = this.editingOrder!.table;
          this.originalOrder!.status = this.editingOrder!.status;
          this.originalOrder!.items = this.editingOrder!.items.map(item => ({ ...item }));
          
          if (this.editingOrder!.status === 'completed') {
            const index = this.orders.findIndex(o => o.id === this.editingOrder!.id);
            if (index !== -1) {
              this.orders.splice(index, 1);
            }
          }
          
          this.closeEditOrderModal();
          alert('Orden actualizada exitosamente');
        },
        error: (error) => {
          alert('Error al actualizar la orden');
        }
      });
    }
  }

  // ========== MÉTODOS DE GESTIÓN DE ÓRDENES ==========
  getPendingOrders(): Order[] {
    return this.orders.filter(order => order.status === 'pending');
  }

  getPreparingOrders(): Order[] {
    return this.orders.filter(order => order.status === 'preparing');
  }

  getCompletedOrders(): Order[] {
    return this.orders.filter(order => order.status === 'completed');
  }

  getItemsString(order: Order): string {
    return order.items.map(item => `${item.name} x${item.qty}`).join(', ');
  }

  getOrderTotal(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  changeOrderStatus(order: Order, newStatus: 'canceled' | 'pending' | 'preparing' | 'completed') {
    if (newStatus === 'canceled') {
      if (confirm('¿Estás seguro de que quieres cancelar y eliminar esta orden?')) {
        this.ordersService.deleteOrder(order.id).subscribe({
          next: (deleteResponse) => {
            const index = this.orders.findIndex(o => o.id === order.id);
            if (index !== -1) {
              this.orders.splice(index, 1);
            }
            alert('Orden eliminada correctamente');
          },
          error: (deleteError) => {
            alert('Error al eliminar la orden');
          }
        });
      }
    } else {
      const previousStatus = order.status;
      order.status = newStatus;
      
      this.ordersService.updateOrderStatus(order.id, newStatus).subscribe({
        next: (response) => {
          if (newStatus === 'completed') {
            const index = this.orders.findIndex(o => o.id === order.id);
            if (index !== -1) {
              this.orders.splice(index, 1);
            }
            alert('Orden marcada como lista y completada');
          }
        },
        error: (error) => {
          alert('Error al actualizar el estado de la orden');
          order.status = previousStatus;
        }
      });
    }
  }

  // ========== MÉTODOS DE INTERFAZ ==========
  increaseItemQuantity(index: number) {
    if (this.editingOrder) {
      this.editingOrder.items[index].qty += 1;
    }
  }

  decreaseItemQuantity(index: number) {
    if (this.editingOrder && this.editingOrder.items[index].qty > 1) {
      this.editingOrder.items[index].qty -= 1;
    }
  }

  removeItemFromOrder(index: number) {
    if (this.editingOrder && confirm('¿Estás seguro de que quieres eliminar este item de la orden?')) {
      this.editingOrder.items.splice(index, 1);
    }
  }

  getEditingOrderTotal(): number {
    if (!this.editingOrder) return 0;
    return this.editingOrder.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  onPriceChange() {
    // El usuario puede modificar manualmente el precio
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}