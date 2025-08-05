import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../store';

const selectCommon = (state: RootState) => state.common;

export const selectCategories = createSelector([selectCommon], (common) => common.categories);
export const selectBrands = createSelector([selectCommon], (common) => common.brands);
export const selectTags = createSelector([selectCommon], (common) => common.tags);
export const selectPriceRange = createSelector([selectCommon], (common) => common.priceRange);
export const selectColors = createSelector([selectCommon], (common) => common.colors);
export const selectSizes = createSelector([selectCommon], (common) => common.sizes);
export const selectCommonLoading = createSelector([selectCommon], (common) => common.loading);
export const selectCommonError = createSelector([selectCommon], (common) => common.error);
