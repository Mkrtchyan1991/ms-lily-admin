import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../rootReducer';

const selectAuth = (state: RootState) => state.auth;

export const selectIsAuthenticated = createSelector([selectAuth], (auth) => auth.isAuthenticated);

export const selectAuthToken = createSelector([selectAuth], (auth) => auth.token);

export const selectAuthUser = createSelector([selectAuth], (auth) => auth.user);

export const selectAuthLoading = createSelector([selectAuth], (auth) => auth.loading);

export const selectAuthError = createSelector([selectAuth], (auth) => auth.error);
