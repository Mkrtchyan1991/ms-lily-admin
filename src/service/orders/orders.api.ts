import axios, { AxiosRequestConfig } from 'axios';

import { ApiResponse, Order, PaginatedResponse, ShippingAddress } from '../service.types';

interface CreateOrderRequest {
  items: { product_id: number; quantity: number }[];
  shipping_address: Omit<ShippingAddress, 'id'>;
}

export const ordersApi = {
  // User orders
  getUserOrders: (config?: AxiosRequestConfig): Promise<ApiResponse<PaginatedResponse<Order>>> =>
    axios.get('/orders', config),

  getOrder: (id: number): Promise<ApiResponse<Order>> => axios.get(`/orders/${id}`),

  createOrder: (data: CreateOrderRequest): Promise<ApiResponse<Order>> => axios.post('/orders', data),

  updateOrderStatus: (id: number, status: Order['status']): Promise<ApiResponse<Order>> =>
    axios.patch(`/orders/${id}/status`, { status }),

  // Admin order management
  admin: {
    getAllOrders: (params?: {
      page?: number;
      per_page?: number;
      status?: Order['status'];
    }): Promise<ApiResponse<PaginatedResponse<Order>>> => axios.get('/admin/orders', { params }),

    getOrder: (id: number): Promise<ApiResponse<Order>> => axios.get(`/admin/orders/${id}`),

    updateOrderStatus: (id: number, status: Order['status']): Promise<ApiResponse<Order>> =>
      axios.patch(`/admin/orders/${id}/status`, { status }),

    deleteOrder: (id: number): Promise<ApiResponse<null>> => axios.delete(`/admin/orders/${id}`),
  },
};
