// src/app/rootReducer.ts
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './auth/auth.slice';

// Persist config for auth slice with loading blacklisted
const authPersistConfig = {
  key: 'auth',
  storage,
  blacklist: ['loading'], // Don't persist loading state
};

// Create persisted auth reducer
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// Root reducer
const rootReducer = { auth: persistedAuthReducer };

export default rootReducer;
