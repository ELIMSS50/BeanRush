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
    this.ordersService.updateOrder(this.editingOrder).subscribe({
      next: (response) => {
        console.log('Orden actualizada:', response);
        
        // Actualizar la orden original con los nuevos valores
        this.originalOrder!.table = this.editingOrder!.table;
        this.originalOrder!.status = this.editingOrder!.status;
        this.originalOrder!.items = this.editingOrder!.items.map(item => ({ ...item }));
        
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

  // Resto de los métodos existentes...
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
    // Actualizar el estado local primero
    order.status = newStatus;
    
    // Actualizar en la base de datos
    this.ordersService.updateOrderStatus(order.id, newStatus).subscribe({
      next: (response) => {
        console.log('Estado de orden actualizado:', response);
        
        // Si la orden está cancelada o completada, la eliminamos del array local después de un tiempo
        if (newStatus === 'canceled' || newStatus === 'completed') {
          setTimeout(() => {
            const index = this.orders.findIndex(o => o.id === order.id);
            if (index !== -1) {
              this.orders.splice(index, 1);
            }
          }, 1000); // Esperar 1 segundo antes de eliminar localmente
        }
      },
      error: (error) => {
        console.error('Error al actualizar estado de orden:', error);
        alert('Error al actualizar el estado de la orden');
        // Revertir el cambio local si hay error
        order.status = this.getPreviousStatus(order, newStatus);
      }
    });
  }

  private getPreviousStatus(order: Order, newStatus: string): OrderStatus {
    // Lógica simple para revertir al estado anterior
    if (newStatus === 'preparing') return 'pending';
    if (newStatus === 'completed') return 'preparing';
    if (newStatus === 'canceled') return order.status; // Mantener el estado actual si no se puede cancelar
    return 'pending';
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

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}