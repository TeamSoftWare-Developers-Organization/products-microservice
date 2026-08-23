import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  username: string;
  role: string;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const getInitialToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || localStorage.getItem('accessToken');
  }
  return null;
};

const initialState: AuthState = {
  user: null,
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('accessToken', action.payload.token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
