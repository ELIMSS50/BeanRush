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
  total?: number;
  status: 'pending' | 'preparing' | 'done' | 'completed';
  createdAt?: string;
}
