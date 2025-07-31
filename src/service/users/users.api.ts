import axios from '@/configs/axios.config';

import { ApiResponse, PaginatedResponse, User } from '../service.types';

export interface UserListParams {
  search?: string;
  role?: 'admin' | 'user';
  status?: 'active' | 'suspended';
  verified?: boolean;
  page?: number;
  per_page?: number;
}

export interface CreateUserRequest {
  name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  password: string;
  password_confirmation: string;
  role?: 'admin' | 'user';
  country?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

export interface UpdateUserRequest {
  name?: string;
  last_name?: string;
  email?: string;
  mobile_number?: string;
  role?: 'admin' | 'user';
  country?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

export interface UserStatistics {
  total_users: number;
  active_users: number;
  suspended_users: number;
  verified_users: number;
  unverified_users: number;
  admin_users: number;
  regular_users: number;
}

export const usersApi = {
  // GET /api/admin/users - List all users with search/filter
  getUsers: (params?: UserListParams): Promise<ApiResponse<PaginatedResponse<User>>> =>
    axios.get('/api/admin/users', { params }),

  // GET /api/admin/users/{id} - Show specific user
  getUser: (id: number): Promise<ApiResponse<User>> => axios.get(`/api/admin/users/${id}`),

  // POST /api/admin/users - Create new user
  createUser: (body: CreateUserRequest): Promise<ApiResponse<User>> => axios.post('/api/admin/users', body),

  // PUT /api/admin/users/{id} - Update user
  updateUser: (id: number, body: UpdateUserRequest): Promise<ApiResponse<User>> =>
    axios.put(`/api/admin/users/${id}`, body),

  // DELETE /api/admin/users/{id} - Delete user
  deleteUser: (id: number): Promise<ApiResponse<null>> => axios.delete(`/api/admin/users/${id}`),

  // PATCH /api/admin/users/{id}/toggle-role
  toggleRole: (id: number): Promise<ApiResponse<User>> => axios.patch(`/api/admin/users/${id}/toggle-role`),

  // PATCH /api/admin/users/{id}/verify-email
  verifyEmail: (id: number): Promise<ApiResponse<User>> => axios.patch(`/api/admin/users/${id}/verify-email`),

  // PATCH /api/admin/users/{id}/toggle-suspension
  toggleSuspension: (id: number): Promise<ApiResponse<User>> => axios.patch(`/api/admin/users/${id}/toggle-suspension`),

  // GET /api/admin/users/stats/overview
  getStatistics: (): Promise<ApiResponse<UserStatistics>> => axios.get('/api/admin/users/stats/overview'),
};
