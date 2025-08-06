import axios, { AxiosRequestConfig } from 'axios';

import { ApiResponse, Order, PaginatedResponse, ShippingAddress } from '../service.types';

interface CreateOrderRequest {
  items: { product_id: number; quantity: number }[];
  shipping_address: Omit<ShippingAddress, 'id'>;
}

interface UpdateOrderRequest {
  shipping_address?: Omit<ShippingAddress, 'id'>;
  items?: { product_id: number; quantity: number }[];
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
    }): Promise<
      ApiResponse<{
        data: Order[];
        summary: {
          total_orders: number;
          pending: number;
          processing: number;
          shipped: number;
          delivered: number;
          total_revenue: string;
        };
      }>
    > => axios.get('/admin/orders', { params }),

    getOrder: (id: number): Promise<ApiResponse<Order>> => axios.get(`/admin/orders/${id}`),

    updateOrderStatus: (id: number, status: Order['status']): Promise<ApiResponse<Order>> =>
      axios.patch(`/admin/orders/${id}/status`, { status }),

    updateOrder: (id: number, data: UpdateOrderRequest): Promise<ApiResponse<{ data: Order }>> =>
      axios.patch(`/admin/orders/${id}`, data),

    deleteOrder: (id: number): Promise<ApiResponse<null>> => axios.delete(`/admin/orders/${id}`),
  },
};
