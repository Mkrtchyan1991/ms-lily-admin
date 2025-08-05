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

export interface PriceRange {
  min_price: number;
  max_price: number;
}

export interface FilterOptions {
  categories: CategoryProps[];
  brands: BrandProps[];
  tags: TagProps[];
  price_range: PriceRange;
  colors: string[];
  sizes: string[];
}

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

// Main filter parameters interface for getAllProducts
export interface ProductFilterParams {
  // Category & Brand filtering
  category?: number;
  brand?: number;

  // Tag filtering
  tag?: number; // Single tag ID
  tags?: string; // Multiple tag IDs (comma-separated: "1,2,3")

  // Price range filtering
  price_min?: number;
  price_max?: number;

  // Product attributes
  color?: string; // Partial match
  size?: string; // Exact match

  // Search & stock
  search?: string; // Search in name and description
  in_stock?: boolean; // Filter products with stock > 0

  // Sorting options
  sort_by?: 'name' | 'price' | 'created_at' | 'stock';
  sort_order?: 'asc' | 'desc';

  // Pagination
  per_page?: number; // 1-50, default: 10
  page?: number; // Current page number
}
// Add these types to your service.types.ts file

export interface ProductComment {
  id: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  user: User;
  product?: {
    id: number;
    name: string;
  };
  product_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Additional types for the admin functionality
export interface CommentFilters {
  page?: number;
  per_page?: number;
  status?: ProductComment['status'] | 'all';
  search?: string;
  sort_by?: 'created_at' | 'updated_at' | 'id';
  sort_order?: 'asc' | 'desc';
}

export interface BatchUpdateRequest {
  ids: number[];
  action: 'approve' | 'reject' | 'delete';
}
