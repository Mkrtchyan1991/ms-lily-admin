import axios from 'axios';

import { ApiResponse, Favorite, PaginatedResponse } from '../service.types';

export const favoritesApi = {
  getFavorites: (category?: string): Promise<ApiResponse<PaginatedResponse<Favorite>>> =>
    axios.get('/api/favorites', { params: { category } }),

  toggleFavorite: (productId: number, category?: string): Promise<ApiResponse<{ is_favorited: boolean }>> =>
    axios.post(`/api/favorites/${productId}/toggle`, { product_id: productId }, { params: { category } }),

  removeFavorite: (productId: number, category?: string): Promise<ApiResponse<null>> =>
    axios.delete(`/api/favorites/${productId}`, { params: { category } }),
};
