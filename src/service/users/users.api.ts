import axios from 'axios';

import { ApiResponse, PaginatedResponse, RegisterRequest, User } from '../service.types';

export const usersApi = {
  admin: {
    getAllUsers: (params?: {
      page?: number;
      per_page?: number;
      role?: 'admin' | 'user';
    }): Promise<ApiResponse<PaginatedResponse<User>>> => axios.get('/api/admin/users', { params }),

    getUser: (id: number): Promise<ApiResponse<User>> => axios.get(`/api/admin/users/${id}`),

    createUser: (data: RegisterRequest): Promise<ApiResponse<User>> => axios.post('/api/admin/users', data),

    updateUser: (id: number, data: Partial<RegisterRequest>): Promise<ApiResponse<User>> =>
      axios.patch(`/api/admin/users/${id}`, data),

    deleteUser: (id: number): Promise<ApiResponse<null>> => axios.delete(`/api/admin/users/${id}`),
  },
};
