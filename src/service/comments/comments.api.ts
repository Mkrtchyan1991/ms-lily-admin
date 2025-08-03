import axios from 'axios';

import { ApiResponse, Comment, CreateCommentRequest, PaginatedResponse } from '../service.types';

export const commentsApi = {
  // Public comment endpoints
  getProductComments: (productId: number): Promise<ApiResponse<PaginatedResponse<Comment>>> =>
    axios.get(`/products/${productId}/comments`),

  createComment: (productId: number, data: CreateCommentRequest): Promise<ApiResponse<Comment>> =>
    axios.post(`/products/${productId}/comments`, data),

  // Admin comment management
  admin: {
    getPendingComments: (params?: {
      page?: number;
      per_page?: number;
    }): Promise<ApiResponse<PaginatedResponse<Comment>>> => axios.get('/admin/comments/pending', { params }),

    getAllComments: (params?: {
      page?: number;
      per_page?: number;
      status?: Comment['status'];
    }): Promise<ApiResponse<PaginatedResponse<Comment>>> => axios.get('/admin/comments', { params }),

    getComment: (id: number): Promise<ApiResponse<Comment>> => axios.get(`/admin/comments/${id}`),

    approveComment: (id: number): Promise<ApiResponse<Comment>> => axios.patch(`/admin/comments/${id}/approve`),

    rejectComment: (id: number): Promise<ApiResponse<Comment>> => axios.patch(`/admin/comments/${id}/reject`),

    deleteComment: (id: number): Promise<ApiResponse<null>> => axios.delete(`/admin/comments/${id}`),
  },
};
