import axios from '@/configs/axios.config';

import {
  ApiResponse,
  BrandProps,
  CategoryProps,
  CreateProductRequest,
  IProduct,
  PaginatedResponse,
  TagProps,
} from '../service.types';

export const productsApi = {
  // Public product endpoints
  getAllProducts: (params?: {
    category?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<IProduct>>> => axios.get('/api/products/allProducts', { params }),

  getProduct: (id: number): Promise<ApiResponse<IProduct>> => axios.get(`/api/products/${id}`),

  // Filter endpoints
  getCategories: (category?: string): Promise<ApiResponse<CategoryProps[]>> =>
    axios.get('/api/products/categories', { params: { category } }),

  getBrands: (category?: string): Promise<ApiResponse<BrandProps[]>> =>
    axios.get('/api/products/brands', { params: { category } }),

  getTags: (category?: string): Promise<ApiResponse<TagProps[]>> =>
    axios.get('/api/products/tags', { params: { category } }),

  // Filter products
  filterByCategory: (categoryId: number, category?: string): Promise<ApiResponse<PaginatedResponse<IProduct>>> =>
    axios.get('/api/products/filter/category', { params: { category_id: categoryId, category } }),

  filterByBrand: (brandId: number, category?: string): Promise<ApiResponse<PaginatedResponse<IProduct>>> =>
    axios.get('/api/products/filter/brand', { params: { brand: brandId, category } }),

  filterByTag: (tagId: number, category?: string): Promise<ApiResponse<PaginatedResponse<IProduct>>> =>
    axios.get('/api/products/filter/tag', { params: { tag_id: tagId, category } }),

  // Comments
  getProductComments: (productId: number): Promise<ApiResponse<PaginatedResponse<Comment>>> =>
    axios.get(`/api/products/${productId}/comments`),

  createComment: (productId: number, data: { content: string }): Promise<ApiResponse<Comment>> =>
    axios.post(`/api/products/${productId}/comments`, data),

  // Admin product management
  admin: {
    getProducts: (params?: { page?: number; per_page?: number }): Promise<ApiResponse<PaginatedResponse<IProduct>>> =>
      axios.get('/api/admin/products', { params }),

    getProduct: (id: number): Promise<ApiResponse<IProduct>> => axios.get(`/api/admin/products/${id}`),

    createProduct: (data: CreateProductRequest): Promise<ApiResponse<IProduct>> =>
      axios.post('/api/admin/products', data, {
        // headers: { 'Content-Type': 'multipart/form-data' },
      }),

    updateProduct: (id: number, data: FormData): Promise<ApiResponse<IProduct>> =>
      axios.patch(`/api/admin/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),

    deleteProduct: (id: number): Promise<ApiResponse<null>> => axios.delete(`/api/admin/products/${id}`),
  },
};
