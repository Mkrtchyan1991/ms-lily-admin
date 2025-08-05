import axios from 'axios';

import { ApiResponse, BrandProps, CategoryProps, TagProps } from '../service.types';

interface NamePayload {
  name: string;
}

// Resource API interface (ID-based operations)
interface ResourceApi {
  getAll: () => Promise<ApiResponse<(CategoryProps | BrandProps | TagProps)[]>>;
  create: (data: NamePayload) => Promise<ApiResponse<CategoryProps | BrandProps | TagProps>>;
  update: (id: number, data: NamePayload) => Promise<ApiResponse<CategoryProps | BrandProps | TagProps>>;
  delete: (id: number) => Promise<ApiResponse<null>>;
}

// Simple API interface (name-based operations)
interface SimpleApi {
  getAll: () => Promise<ApiResponse<string[]>>;
  create: (data: NamePayload) => Promise<ApiResponse<string>>;
  update: (oldName: string, data: NamePayload) => Promise<ApiResponse<string>>;
  delete: (name: string) => Promise<ApiResponse<null>>;
}

const buildResourceApi = (base: string): ResourceApi => ({
  getAll: (): Promise<ApiResponse<(CategoryProps | BrandProps | TagProps)[]>> => axios.get(`/admin/${base}`),
  create: (data: NamePayload): Promise<ApiResponse<CategoryProps | BrandProps | TagProps>> =>
    axios.post(`/admin/${base}`, data),
  update: (id: number, data: NamePayload): Promise<ApiResponse<CategoryProps | BrandProps | TagProps>> =>
    axios.patch(`/admin/${base}/${id}`, data),
  delete: (id: number): Promise<ApiResponse<null>> => axios.delete(`/admin/${base}/${id}`),
});

const buildSimpleApi = (base: string): SimpleApi => ({
  getAll: (): Promise<ApiResponse<string[]>> => axios.get(`/admin/${base}`),
  create: (data: NamePayload): Promise<ApiResponse<string>> => axios.post(`/admin/${base}`, data),
  update: (oldName: string, data: NamePayload): Promise<ApiResponse<string>> =>
    axios.patch(`/admin/${base}/${oldName}`, data),
  delete: (name: string): Promise<ApiResponse<null>> => axios.delete(`/admin/${base}/${name}`),
});

// Properly typed options API
export const optionsApi: {
  categories: ResourceApi;
  brands: ResourceApi;
  tags: ResourceApi;
  colors: SimpleApi;
  sizes: SimpleApi;
} = {
  categories: buildResourceApi('categories'),
  brands: buildResourceApi('brands'),
  tags: buildResourceApi('tags'),
  colors: buildSimpleApi('colors'),
  sizes: buildSimpleApi('sizes'),
};

export type OptionType = keyof typeof optionsApi;

// Type helpers
export const isResourceApiType = (type: OptionType): type is 'categories' | 'brands' | 'tags' => {
  return ['categories', 'brands', 'tags'].includes(type);
};

export const isSimpleApiType = (type: OptionType): type is 'colors' | 'sizes' => {
  return ['colors', 'sizes'].includes(type);
};
