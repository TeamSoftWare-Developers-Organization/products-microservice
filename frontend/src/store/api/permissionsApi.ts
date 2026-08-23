import { baseApi } from './baseApi';

export const permissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRolePermissions: builder.query<Record<string, string[]>, void>({
      query: () => '/auth/roles/permissions',
      providesTags: ['Permissions'],
    }),

    updateRolePermissions: builder.mutation<void, { roleId: string; permissions: string[] }>({
      query: (body) => ({
        url: '/auth/roles/permissions',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Permissions'],
    }),
  }),
});

export const { useGetRolePermissionsQuery, useUpdateRolePermissionsMutation } = permissionsApi;
