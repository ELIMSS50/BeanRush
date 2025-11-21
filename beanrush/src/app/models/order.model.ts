// order.model.ts
export type OrderStatus = 'pending' | 'preparing' | 'done' | 'completed' | 'canceled';

export interface Product {
  id: number;
  name: string;
  price: number;
  qty: number;
  category: string;
}

export interface Order {
  id: number;
  table: string;
  items: Product[];
  status: OrderStatus;
  qty?: number;
}
