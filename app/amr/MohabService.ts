// src/services/MohabApi.ts
  import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
  
  export interface Mohab {
    id: string;
    // Add your Mohab properties here
  }
  
  export interface ApiError {
    status: number;
    data: { message?: string };
  }
  
  export const MohabApi = createApi({
    reducerPath: 'MohabApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['Mohab'],
    endpoints: (builder) => ({
      getMohabs: builder.query<Mohab[], void>({
        query: () => '/Mohab',
        providesTags: ['Mohab']
      }),
      getMohab: builder.query<Mohab, string>({
        query: (id) => `/Mohab/${id}`,
        providesTags: (result, error, id) => [{ type: 'Mohab' as const, id }]
      }),
      createMohab: builder.mutation<Mohab, Omit<Mohab, 'id'>>({
        query: (body) => ({
          url: '/Mohab',
          method: 'POST',
          body
        }),
        invalidatesTags: ['Mohab']
      }),
      updateMohab: builder.mutation<Mohab, Partial<Mohab & { id: string }>>({
        query: ({ id, ...body }) => ({
          url: `/Mohab/${id}`,
          method: 'PUT',
          body
        }),
        invalidatesTags: (result, error, { id }) => [{ type: 'Mohab' as const, id }]
      }),
      deleteMohab: builder.mutation<void, string>({
        query: (id) => ({
          url: `/Mohab/${id}`,
          method: 'DELETE'
        }),
        invalidatesTags: (result, error, id) => [{ type: 'Mohab' as const, id }]
      })
    })
  });
  
  export const {
    useGetMohabsQuery,
    useGetMohabQuery,
    useCreateMohabMutation,
    useUpdateMohabMutation,
    useDeleteMohabMutation
  } = MohabApi;
  