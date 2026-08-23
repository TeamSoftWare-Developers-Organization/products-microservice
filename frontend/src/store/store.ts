import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './api/baseApi';
import cartReducer from './cartSlice';
import authReducer from './slices/authSlice';
import permissionsReducer from './slices/permissionsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    permissions: permissionsReducer,
    ui: uiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
