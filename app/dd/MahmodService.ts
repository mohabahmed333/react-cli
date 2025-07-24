// src/services/MahmodApi.ts
  import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
  
  export interface Mahmod {
    id: string;
    // Add your Mahmod properties here
  }
  
  export interface ApiError {
    status: number;
    data: { message?: string };
  }
  
  export const MahmodApi = createApi({
    reducerPath: 'MahmodApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['Mahmod'],
    endpoints: (builder) => ({
      getMahmods: builder.query<Mahmod[], void>({
        query: () => '/Mahmod',
        providesTags: ['Mahmod']
      }),
      getMahmod: builder.query<Mahmod, string>({
        query: (id) => `/Mahmod/${id}`,
        providesTags: (result, error, id) => [{ type: 'Mahmod' as const, id }]
      }),
      createMahmod: builder.mutation<Mahmod, Omit<Mahmod, 'id'>>({
        query: (body) => ({
          url: '/Mahmod',
          method: 'POST',
          body
        }),
        invalidatesTags: ['Mahmod']
      }),
      updateMahmod: builder.mutation<Mahmod, Partial<Mahmod & { id: string }>>({
        query: ({ id, ...body }) => ({
          url: `/Mahmod/${id}`,
          method: 'PUT',
          body
        }),
        invalidatesTags: (result, error, { id }) => [{ type: 'Mahmod' as const, id }]
      }),
      deleteMahmod: builder.mutation<void, string>({
        query: (id) => ({
          url: `/Mahmod/${id}`,
          method: 'DELETE'
        }),
        invalidatesTags: (result, error, id) => [{ type: 'Mahmod' as const, id }]
      })
    })
  });
  
  export const {
    useGetMahmodsQuery,
    useGetMahmodQuery,
    useCreateMahmodMutation,
    useUpdateMahmodMutation,
    useDeleteMahmodMutation
  } = MahmodApi;
  