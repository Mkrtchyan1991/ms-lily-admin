import axios from 'axios';

import { ApiResponse, Comment, CreateCommentRequest, PaginatedResponse } from '../service.types';

export const commentsApi = {
  // Public comment endpoints
  getProductComments: (productId: number): Promise<ApiResponse<PaginatedResponse<Comment>>> =>
    axios.get(`/api/products/${productId}/comments`),

  createComment: (productId: number, data: CreateCommentRequest): Promise<ApiResponse<Comment>> =>
    axios.post(`/api/products/${productId}/comments`, data),

  // Admin comment management
  admin: {
    getPendingComments: (params?: {
      page?: number;
      per_page?: number;
    }): Promise<ApiResponse<PaginatedResponse<Comment>>> => axios.get('/api/admin/comments/pending', { params }),

    getAllComments: (params?: {
      page?: number;
      per_page?: number;
      status?: Comment['status'];
    }): Promise<ApiResponse<PaginatedResponse<Comment>>> => axios.get('/api/admin/comments', { params }),

    getComment: (id: number): Promise<ApiResponse<Comment>> => axios.get(`/api/admin/comments/${id}`),

    approveComment: (id: number): Promise<ApiResponse<Comment>> => axios.patch(`/api/admin/comments/${id}/approve`),

    rejectComment: (id: number): Promise<ApiResponse<Comment>> => axios.patch(`/api/admin/comments/${id}/reject`),

    deleteComment: (id: number): Promise<ApiResponse<null>> => axios.delete(`/api/admin/comments/${id}`),
  },
};
