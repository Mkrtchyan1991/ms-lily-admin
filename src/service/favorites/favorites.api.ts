import axios from 'axios';

import { ApiResponse, Favorite, PaginatedResponse } from '../service.types';

export const favoritesApi = {
  getFavorites: (category?: string): Promise<ApiResponse<PaginatedResponse<Favorite>>> =>
    axios.get('/favorites', { params: { category } }),

  toggleFavorite: (productId: number, category?: string): Promise<ApiResponse<{ is_favorited: boolean }>> =>
    axios.post(`/favorites/${productId}/toggle`, { product_id: productId }, { params: { category } }),

  removeFavorite: (productId: number, category?: string): Promise<ApiResponse<null>> =>
    axios.delete(`/favorites/${productId}`, { params: { category } }),
};
