import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

// Import your reducers here
// Example: import authReducer from './slices/authSlice';

const rootReducer = combineReducers({
  // Add your reducers here
  // Example: auth: authReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'] // Only persist auth
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export default store;
