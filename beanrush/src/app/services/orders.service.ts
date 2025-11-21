import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = 'http://localhost:4000/api/orders';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${orderId}/status`, { status });
  }

  updateOrder(order: Order): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${order.id}`, order);
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  // Método para eliminar orden - AGREGAR ESTE MÉTODO
  deleteOrder(orderId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${orderId}`);
  }
}