import axios from '@/configs/axios.config';

import { ApiResponse, LoginRequest, RegisterRequest, User } from '../service.types';

// Updated response type to match backend response
interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authApi = {
  // Authentication
  login: (body: LoginRequest): Promise<{ data: AuthResponse }> => axios.post('/api/login', body),

  register: (body: RegisterRequest): Promise<{ data: AuthResponse }> => axios.post('/api/register', body),

  logout: (): Promise<ApiResponse<null>> => axios.post('/api/logout'),

  // User management
  getUser: (): Promise<ApiResponse<User>> => axios.get('/api/user'),

  getProfile: (): Promise<ApiResponse<User>> => axios.get('/api/profile'),

  updateProfile: (body: Partial<RegisterRequest>): Promise<ApiResponse<User>> => axios.patch('/api/profile', body),

  // Email verification
  verifyEmail: (id: string, hash: string, expires: string, signature: string): Promise<ApiResponse<null>> =>
    axios.get(`/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`),
};
