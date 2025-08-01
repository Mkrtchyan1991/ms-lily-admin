import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../store';

const selectAuth = (state: RootState) => state.auth;

export const selectIsAuthenticated = createSelector([selectAuth], (auth) => !!auth.token);

export const selectAuthToken = createSelector([selectAuth], (auth) => auth.token);

export const selectAuthUser = createSelector([selectAuth], (auth) => auth.user);

export const selectAuthLoading = createSelector([selectAuth], (auth) => auth.loading);

export const selectAuthError = createSelector([selectAuth], (auth) => auth.error);
