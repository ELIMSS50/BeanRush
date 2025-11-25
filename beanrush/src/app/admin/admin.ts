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

  // Productos (cliente)
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: string = 'all';
  cart: any[] = [];
  total: number = 0;

  // Órdenes (empleado)
  orders: Order[] = [];

  // Variables para el modal de nueva orden
  showCreateOrderModal: boolean = false;
  newOrder: any = {
    table: '',
    items: [],
    status: 'pending'
  };
  selectedProductId: string = '';

  // Variables para el modal de nuevo producto
  showAddProductModal: boolean = false;
  newProduct: any = {
    name: '',
    price: 0,
    category: ''
  };

  // Variables para el modal de editar orden
  showEditOrderModal: boolean = false;
  editingOrder: Order | null = null;
  originalOrder: Order | null = null;
  showCompletedOrders: boolean = false;

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

  // Métodos para el modal de nuevo producto
  openAddProductModal() {
    this.newProduct = {
      name: '',
      price: 0,
      category: ''
    };
    this.showAddProductModal = true;
  }

  closeAddProductModal() {
    this.showAddProductModal = false;
  }

  addNewProduct() {
    if (this.newProduct.name && this.newProduct.price > 0 && this.newProduct.category) {
      // Generar un ID único
      const newId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
      
      // Crear el producto con la propiedad qty
      const productToAdd: Product = {
        id: newId,
        name: this.newProduct.name,
        price: parseFloat(this.newProduct.price),
        category: this.newProduct.category,
        qty: 0
      };

      console.log('Enviando producto:', productToAdd);

      // Llamar al servicio para agregar el producto a MongoDB
      this.productService.addProduct(productToAdd).subscribe({
        next: (response) => {
          console.log('Producto agregado:', response);
          
          // Agregar el producto localmente
          this.products.push(productToAdd);
          this.filterProducts(this.selectedCategory);
          
          // Cerrar el modal
          this.closeAddProductModal();
          
          alert('Producto agregado exitosamente');
        },
        error: (error) => {
          console.error('Error completo al agregar producto:', error);
          console.error('Status:', error.status);
          console.error('Mensaje:', error.message);
          console.error('Error body:', error.error);
          alert('Error al agregar el producto: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  // Métodos para el modal de editar orden
  openEditOrderModal(order: Order) {
    this.originalOrder = order;
    
    this.editingOrder = {
      id: order.id,
      table: order.table,
      status: order.status,
      items: order.items.map(item => ({ ...item })) // Solo copiamos los items
    };
    
    this.showEditOrderModal = true;
  }

  closeEditOrderModal() {
    this.showEditOrderModal = false;
    this.editingOrder = null;
    this.originalOrder = null;
  }

  updateOrder() {
    if (this.editingOrder && this.originalOrder) {
      // Crear objeto sin total para enviar al backend
      const orderToUpdate: any = {
        id: this.editingOrder.id,
        table: this.editingOrder.table,
        status: this.editingOrder.status,
        items: this.editingOrder.items.map(item => ({ ...item }))
      };

      this.ordersService.updateOrder(orderToUpdate).subscribe({
        next: (response) => {
          console.log('Orden actualizada:', response);
          
          // Actualizar la orden original con los nuevos valores
          this.originalOrder!.table = this.editingOrder!.table;
          this.originalOrder!.status = this.editingOrder!.status;
          this.originalOrder!.items = this.editingOrder!.items.map(item => ({ ...item }));
          
          // Si la orden se marcó como completada, quitarla de la vista
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
          console.error('Error al actualizar orden:', error);
          alert('Error al actualizar la orden');
        }
      });
    }
  }

  // Métodos para manipular items en la orden
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

  filterProducts(category: string) {
    this.selectedCategory = category;
    this.filteredProducts = category === 'all'
    ? this.products
    : this.products.filter(p => p.category === category);
  }

  getItemsString(order: Order): string {
    return order.items.map(item => `${item.name} x${item.qty}`).join(', ');
  }

  getPendingOrders(): Order[] {
    return this.orders.filter(order => order.status === 'pending');
  }

  getPreparingOrders(): Order[] {
    return this.orders.filter(order => order.status === 'preparing');
  }

  changeOrderStatus(order: Order, newStatus: 'canceled' | 'pending' | 'preparing' | 'completed') {
    if (newStatus === 'canceled') {
      if (confirm('¿Estás seguro de que quieres cancelar y eliminar esta orden?')) {
        this.ordersService.deleteOrder(order.id).subscribe({
          next: (deleteResponse) => {
            console.log('Orden eliminada:', deleteResponse);
            // Eliminar del array local
            const index = this.orders.findIndex(o => o.id === order.id);
            if (index !== -1) {
              this.orders.splice(index, 1);
            }
            alert('Orden eliminada correctamente');
          },
          error: (deleteError) => {
            console.error('Error al eliminar orden:', deleteError);
            alert('Error al eliminar la orden');
          }
        });
      }
    } else {
      // Para otros estados (pending, preparing, completed)
      const previousStatus = order.status;
      
      // Actualizar el estado local primero
      order.status = newStatus;
      
      // Actualizar en la base de datos
      this.ordersService.updateOrderStatus(order.id, newStatus).subscribe({
        next: (response) => {
          console.log('Estado de orden actualizado:', response);
          
          // Para órdenes completadas, quitarlas de la vista local pero mantener en BD
          if (newStatus === 'completed') {
            const index = this.orders.findIndex(o => o.id === order.id);
            if (index !== -1) {
              this.orders.splice(index, 1);
            }
            alert('Orden marcada como lista y completada');
          }
        },
        error: (error) => {
          console.error('Error al actualizar estado de orden:', error);
          alert('Error al actualizar el estado de la orden');
          // Revertir el cambio local
          order.status = previousStatus;
        }
      });
    }
  }

  getOrderTotal(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  modifyProduct(product: Product) {
    const newName = prompt('Nuevo nombre del producto:', product.name);
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
          console.log('Producto actualizado:', response);
          // Actualizar localmente
          const index = this.products.findIndex(p => p.id === product.id);
          if (index !== -1) {
            this.products[index] = updatedProduct;
            this.filterProducts(this.selectedCategory);
          }
        },
        error: (error) => {
          console.error('Error al actualizar producto:', error);
          alert('Error al actualizar el producto');
        }
      });
    }
  }

  eraseProduct(product: Product) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productService.deleteProduct(product.id).subscribe({
        next: (response) => {
          console.log('Producto eliminado:', response);
          const index = this.products.findIndex(p => p.id === product.id);
          if (index !== -1) {
            this.products.splice(index, 1);
            this.filterProducts(this.selectedCategory);
          }
        },
        error: (error) => {
          console.error('Error al eliminar producto:', error);
          alert('Error al eliminar el producto');
        }
      });
    }
  }

  // Métodos para el modal de nueva orden
  openCreateOrderModal() {
    this.newOrder = {
      table: '',
      items: [],
      status: 'pending'
    };
    this.selectedProductId = '';
    this.showCreateOrderModal = true;
  }

  closeCreateOrderModal() {
    this.showCreateOrderModal = false;
  }

  onProductSelect() {
    if (this.selectedProductId) {
      const productId = parseInt(this.selectedProductId);
      const product = this.products.find(p => p.id === productId);
      
      if (product) {
        // Verificar si el producto ya está en la orden
        const existingItem = this.newOrder.items.find((item: any) => item.id === product.id);
        
        if (existingItem) {
          existingItem.qty += 1;
        } else {
          // Agregar nuevo item a la orden
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
      // Generar ID único para la nueva orden
      const newOrderId = this.orders.length > 0 ? Math.max(...this.orders.map(o => o.id)) + 1 : 1;
      
      // Crear orden sin total - el backend lo calculará automáticamente
      const orderToCreate: any = {
        id: newOrderId,
        table: this.newOrder.table,
        items: this.newOrder.items.map((item: any) => ({
          ...item
        })),
        status: 'pending' as OrderStatus
        // NO incluir total - el backend lo calculará automáticamente
      };

      console.log('Creando nueva orden:', orderToCreate);

      // Llamar al servicio para crear la orden en MongoDB
      this.ordersService.createOrder(orderToCreate).subscribe({
        next: (response) => {
          console.log('Orden creada:', response);
          
          // Agregar la orden localmente (usar la respuesta del backend que incluye el total calculado)
          this.orders.push(response);
          
          // Cerrar el modal
          this.closeCreateOrderModal();
          
          alert('Orden creada exitosamente');
        },
        error: (error) => {
          console.error('Error al crear orden:', error);
          alert('Error al crear la orden: ' + (error.error?.message || error.message));
        }
      });
    } else {
      alert('Por favor completa la mesa y agrega al menos un producto');
    }
  }

  getCompletedOrders(): Order[] {
    return this.orders.filter(order => order.status === 'completed');
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}