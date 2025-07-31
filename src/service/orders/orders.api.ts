import axios, { AxiosRequestConfig } from 'axios';

import { ApiResponse, Order, PaginatedResponse } from '../service.types';

export const ordersApi = {
  // User orders
  getUserOrders: (config?: AxiosRequestConfig): Promise<ApiResponse<PaginatedResponse<Order>>> =>
    axios.get('/api/orders', config),

  createOrder: (items: { product_id: number; quantity: number }[]): Promise<ApiResponse<Order>> =>
    axios.post('/api/orders', { items }),

  // Admin order management
  admin: {
    getAllOrders: (): Promise<ApiResponse<PaginatedResponse<Order>>> => axios.get('/api/admin/orders'),

    updateOrderStatus: (id: number, status: Order['status']): Promise<ApiResponse<Order>> =>
      axios.patch(`/api/admin/orders/${id}/status`, { status }),

    getOrder: (id: number): Promise<ApiResponse<Order>> => axios.get(`/api/admin/orders/${id}`),
  },
};
