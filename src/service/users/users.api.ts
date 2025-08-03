import axios from 'axios';

import { ApiResponse, PaginatedResponse, RegisterRequest, User } from '../service.types';

export const usersApi = {
  admin: {
    getAllUsers: (params?: {
      page?: number;
      per_page?: number;
      role?: 'admin' | 'user';
    }): Promise<ApiResponse<PaginatedResponse<User>>> => axios.get('/admin/users', { params }),

    getUser: (id: number): Promise<ApiResponse<User>> => axios.get(`/admin/users/${id}`),

    createUser: (data: RegisterRequest): Promise<ApiResponse<User>> => axios.post('/admin/users', data),

    updateUser: (id: number, data: Partial<RegisterRequest>): Promise<ApiResponse<User>> =>
      axios.patch(`/admin/users/${id}`, data),

    deleteUser: (id: number): Promise<ApiResponse<null>> => axios.delete(`/admin/users/${id}`),
  },
};
