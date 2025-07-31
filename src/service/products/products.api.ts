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
  getProducts: (params?: {
    category?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<IProduct>>> => axios.get('/api/admin/products', { params }),

  getProduct: (id: number): Promise<ApiResponse<IProduct>> => axios.get(`/api/admin/products/${id}`),

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
    axios.get('/api/products/filter/tag', { params: { tag: tagId, category } }),

  // Admin product management
  createProduct: (data: CreateProductRequest): Promise<ApiResponse<IProduct>> => {
    const formData = new FormData();

    // Add basic fields
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('category_id', data.category_id.toString());
    formData.append('brand_id', data.brand_id.toString());

    // Add optional fields
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach((tag) => formData.append('tags[]', tag.toString()));
    }

    if (data.images && data.images.length > 0) {
      data.images.forEach((file) => formData.append('images[]', file));
    }

    return axios.post('/api/admin/products/store', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateProduct: (id: number, data: Partial<CreateProductRequest>): Promise<ApiResponse<IProduct>> => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file: any) => formData.append('images[]', file));
      } else if (key === 'tags' && Array.isArray(value)) {
        value.forEach((tag) => formData.append('tags[]', tag.toString()));
      } else if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return axios.patch(`/api/admin/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteProduct: (id: number): Promise<ApiResponse<null>> => axios.delete(`/api/admin/products/${id}`),
};
