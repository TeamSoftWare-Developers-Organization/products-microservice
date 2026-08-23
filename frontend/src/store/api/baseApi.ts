import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { getApiUrl } from '@/lib/config';

const getBaseApiUrl = () => {
  const url = getApiUrl().replace(/\/+$/, '');
  return url.endsWith('/api') ? url : `${url}/api`;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseApiUrl(),
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token || 
        (typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : null);

      headers.set('Bypass-Tunnel-Reminder', 'true');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Products', 'Cart', 'Orders', 'Warehouse', 'Finance', 'Permissions'],
  endpoints: () => ({}),
});
