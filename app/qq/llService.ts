// src/services/llApi.ts
  import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
  
  export interface Ll {
    id: string;
    // Add your ll properties here
  }
  
  export interface ApiError {
    status: number;
    data: { message?: string };
  }
  
  export const llApi = createApi({
    reducerPath: 'llApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['Ll'],
    endpoints: (builder) => ({
      getLls: builder.query<Ll[], void>({
        query: () => '/ll',
        providesTags: ['Ll']
      }),
      getLl: builder.query<Ll, string>({
        query: (id) => `/ll/${id}`,
        providesTags: (result, error, id) => [{ type: 'Ll' as const, id }]
      }),
      createLl: builder.mutation<Ll, Omit<Ll, 'id'>>({
        query: (body) => ({
          url: '/ll',
          method: 'POST',
          body
        }),
        invalidatesTags: ['Ll']
      }),
      updateLl: builder.mutation<Ll, Partial<Ll & { id: string }>>({
        query: ({ id, ...body }) => ({
          url: `/ll/${id}`,
          method: 'PUT',
          body
        }),
        invalidatesTags: (result, error, { id }) => [{ type: 'Ll' as const, id }]
      }),
      deleteLl: builder.mutation<void, string>({
        query: (id) => ({
          url: `/ll/${id}`,
          method: 'DELETE'
        }),
        invalidatesTags: (result, error, id) => [{ type: 'Ll' as const, id }]
      })
    })
  });
  
  export const {
    useGetLlsQuery,
    useGetLlQuery,
    useCreateLlMutation,
    useUpdateLlMutation,
    useDeleteLlMutation
  } = llApi;
  