export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

export interface Subscription {
  id: number;
  name: string;
  duration_days: number;
  price_per_liter: number;
  total_price: number;
  category: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}
