import { productsApi } from '@/service/products/products.api';
import { BrandProps, CategoryProps, FilterOptions, PriceRange, TagProps } from '@/service/service.types';
import { catchErrorMessage } from '@/service/service.utils';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CommonState {
  categories: CategoryProps[];
  brands: BrandProps[];
  tags: TagProps[];
  priceRange: PriceRange | null;
  colors: string[];
  sizes: string[];
  loading: boolean;
  error: string | null;
}

const initialState: CommonState = {
  categories: [],
  brands: [],
  tags: [],
  priceRange: null,
  colors: [],
  sizes: [],
  loading: false,
  error: null,
};

export const fetchFilterOptions = createAsyncThunk('common/fetchFilterOptions', async (_, { rejectWithValue }) => {
  try {
    const response = await productsApi.getFilterOptions();
    return response.data;
  } catch (error) {
    return rejectWithValue(catchErrorMessage(error) || 'Failed to load filter options');
  }
});

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilterOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilterOptions.fulfilled, (state, action: PayloadAction<FilterOptions>) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.brands = action.payload.brands;
        state.tags = action.payload.tags;
        state.priceRange = action.payload.price_range;
        state.colors = action.payload.colors;
        state.sizes = action.payload.sizes;
      })
      .addCase(fetchFilterOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

const commonReducer = commonSlice.reducer;
export default commonReducer;
