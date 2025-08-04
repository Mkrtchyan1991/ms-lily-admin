import axios from 'axios';

import { ApiResponse, CreateCommentRequest, PaginatedResponse, ProductComment } from '../service.types';

export const commentsApi = {
  // Public comment endpoints
  getProductComments: (productId: number): Promise<ApiResponse<PaginatedResponse<ProductComment>>> =>
    axios.get(`/products/${productId}/comments`),

  createComment: (productId: number, data: CreateCommentRequest): Promise<ApiResponse<ProductComment>> =>
    axios.post(`/products/${productId}/comments`, data),

  // Admin comment management
  admin: {
    // Updated: Remove getPendingComments and use getAllComments with status filter
    getAllComments: (params?: {
      page?: number;
      per_page?: number;
      status?: ProductComment['status'] | 'all';
      search?: string;
      sort_by?: 'created_at' | 'updated_at' | 'id';
      sort_order?: 'asc' | 'desc';
    }): Promise<ApiResponse<PaginatedResponse<ProductComment>>> => {
      // Filter out 'all' status as it shouldn't be sent to the API
      const { status, ...otherParams } = params || {};
      const apiParams = {
        ...otherParams,
        ...(status && status !== 'all' ? { status } : {}),
      };

      return axios.get('/admin/comments', { params: apiParams });
    },

    getComment: (id: number): Promise<ApiResponse<ProductComment>> => axios.get(`/admin/comments/${id}`),

    // Direct status update method (similar to orders)
    updateCommentStatus: (id: number, status: ProductComment['status']): Promise<ApiResponse<ProductComment>> =>
      axios.patch(`/admin/comments/${id}/status`, { status }),

    // Existing specific approval/rejection methods (kept for backward compatibility)
    approveComment: (id: number): Promise<ApiResponse<ProductComment>> => axios.patch(`/admin/comments/${id}/approve`),

    rejectComment: (id: number): Promise<ApiResponse<ProductComment>> => axios.patch(`/admin/comments/${id}/reject`),

    deleteComment: (id: number): Promise<ApiResponse<null>> => axios.delete(`/admin/comments/${id}`),

    // Additional utility method for batch operations
    batchUpdateComments: (ids: number[], action: 'approve' | 'reject' | 'delete'): Promise<ApiResponse<null>> =>
      axios.patch('/admin/comments/batch', { ids, action }),
  },
};
