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
  login: (body: LoginRequest): Promise<{ data: AuthResponse }> => axios.post('/login', body),

  register: (body: RegisterRequest): Promise<{ data: AuthResponse }> => axios.post('/register', body),

  logout: (): Promise<ApiResponse<null>> => axios.post('/logout'),

  logoutAllDevices: (): Promise<ApiResponse<null>> => axios.post('/logout-all-devices'),

  // User management
  getUser: (): Promise<ApiResponse<{ data: User }>> => axios.get('/user'),

  getProfile: (): Promise<ApiResponse<User>> => axios.get('/profile'),

  updateProfile: (body: Partial<RegisterRequest>): Promise<ApiResponse<{ data: User }>> =>
    axios.patch('/profile', body),

  // Email verification
  verifyEmail: (id: string, hash: string, expires: string, signature: string): Promise<ApiResponse<null>> =>
    axios.get(`/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`),
};
