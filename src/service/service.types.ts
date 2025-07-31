// src/service/types/api.types.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  password: string;
  password_confirmation: string;
  role?: 'admin' | 'user';
  country?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

export interface User {
  id: number;
  name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  country?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  role: 'admin' | 'user';
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface IProduct {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  category_id: number;
  brand_id: number;
  color: string;
  size: string;
  image: string | null;
  price: string;
  stock: number;
  category: CategoryProps;
  brand: BrandProps;
  tags: TagProps[];
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category_id: number;
  brand_id: number;
  images?: File[];
  tags?: number[];
}

export type CategoryProps = {
  id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
};
export type BrandProps = {
  id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
};

export type TagProps = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  pivot: {
    product_id: number;
    tag_id: number;
  };
};

export interface Order {
  id: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: string;
  created_at: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
}

export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: string;
  total: string | null;
}

export interface Comment {
  id: number;
  content: string;
  user_id: number;
  product_id: number;
  status: 'pending' | 'approved' | 'rejected';
  user: User;
  created_at: string;
  updated_at: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface Favorite {
  id: number;
  user_id: number;
  product_id: number;
  product: IProduct;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  recent_orders: Order[];
  popular_products: IProduct[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ShippingAddress {
  id: number;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}
