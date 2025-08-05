import axios from 'axios';

import { ApiResponse, BrandProps, CategoryProps, TagProps } from '../service.types';

interface NamePayload {
  name: string;
}

const buildResourceApi = (base: string) => ({
  getAll: (): Promise<ApiResponse<(CategoryProps | BrandProps | TagProps)[]>> => axios.get(`/admin/${base}`),
  create: (data: NamePayload): Promise<ApiResponse<CategoryProps | BrandProps | TagProps>> =>
    axios.post(`/admin/${base}`, data),
  update: (id: number, data: NamePayload): Promise<ApiResponse<CategoryProps | BrandProps | TagProps>> =>
    axios.patch(`/admin/${base}/${id}`, data),
  delete: (id: number): Promise<ApiResponse<null>> => axios.delete(`/admin/${base}/${id}`),
});

const buildSimpleApi = (base: string) => ({
  getAll: (): Promise<ApiResponse<string[]>> => axios.get(`/admin/${base}`),
  create: (data: NamePayload): Promise<ApiResponse<string>> => axios.post(`/admin/${base}`, data),
  update: (oldName: string, data: NamePayload): Promise<ApiResponse<string>> =>
    axios.patch(`/admin/${base}/${oldName}`, data),
  delete: (name: string): Promise<ApiResponse<null>> => axios.delete(`/admin/${base}/${name}`),
});

export const optionsApi = {
  categories: buildResourceApi('categories'),
  brands: buildResourceApi('brands'),
  tags: buildResourceApi('tags'),
  colors: buildSimpleApi('colors'),
  sizes: buildSimpleApi('sizes'),
};

export type OptionType = keyof typeof optionsApi;
