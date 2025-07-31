import axios from 'axios';

import { ApiResponse, DashboardStats } from '../service.types';

export const adminApi = {
  getDashboard: (): Promise<ApiResponse<DashboardStats>> => axios.get('/api/admin/dashboard'),
};
