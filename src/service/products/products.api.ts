import axios from '@/configs/axios.config';

import {
  ApiResponse,
  BrandProps,
  CategoryProps,
  CreateProductRequest,
  IProduct,
  PaginatedResponse,
  ProductFilterParams,
  TagProps,
} from '../service.types';

// New interface for filter options response
export interface FilterOptionsResponse {
  categories: CategoryProps[];
  brands: BrandProps[];
  tags: TagProps[];
}

export const productsApi = {
  getProduct: (id: number): Promise<ApiResponse<IProduct>> => axios.get(`/products/${id}`),

  getFilterOptions: (category?: string): Promise<ApiResponse<FilterOptionsResponse>> =>
    axios.get('/products/filter-options', { params: { category } }),

  // Enhanced getAllProducts to handle filtering
  getAllProducts: (params: ProductFilterParams): Promise<ApiResponse<PaginatedResponse<IProduct>>> =>
    axios.get('/products/allProducts', { params }),

  // Comments
  getProductComments: (productId: number): Promise<ApiResponse<PaginatedResponse<Comment>>> =>
    axios.get(`/products/${productId}/comments`),

  createComment: (productId: number, data: { content: string }): Promise<ApiResponse<Comment>> =>
    axios.post(`/products/${productId}/comments`, data),

  // Admin product management
  admin: {
    getProducts: (params?: { page?: number; per_page?: number }): Promise<ApiResponse<PaginatedResponse<IProduct>>> =>
      axios.get('/admin/products', { params }),

    getProduct: (id: number): Promise<ApiResponse<IProduct>> => axios.get(`/admin/products/${id}`),

    // Fixed: Changed endpoint from '/admin/products' to '/admin/products/store'
    createProduct: (data: FormData): Promise<ApiResponse<IProduct>> =>
      axios.post('/admin/products/store', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),

    // For update, you might need to use POST with _method=PATCH for FormData
    updateProduct: (id: number, data: FormData): Promise<ApiResponse<IProduct>> => {
      // Laravel doesn't handle PATCH with FormData well, so we use POST with method spoofing
      data.append('_method', 'PATCH');
      return axios.post(`/admin/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },

    deleteProduct: (id: number): Promise<ApiResponse<null>> => axios.delete(`/admin/products/${id}`),
  },
};
