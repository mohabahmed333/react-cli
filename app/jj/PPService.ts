// src/services/PPApi.ts
  import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
  
  export interface PP {
    id: string;
    // Add your PP properties here
  }
  
  export interface ApiError {
    status: number;
    data: { message?: string };
  }
  
  export const PPApi = createApi({
    reducerPath: 'PPApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['PP'],
    endpoints: (builder) => ({
      getPPs: builder.query<PP[], void>({
        query: () => '/PP',
        providesTags: ['PP']
      }),
      getPP: builder.query<PP, string>({
        query: (id) => `/PP/${id}`,
        providesTags: (result, error, id) => [{ type: 'PP' as const, id }]
      }),
      createPP: builder.mutation<PP, Omit<PP, 'id'>>({
        query: (body) => ({
          url: '/PP',
          method: 'POST',
          body
        }),
        invalidatesTags: ['PP']
      }),
      updatePP: builder.mutation<PP, Partial<PP & { id: string }>>({
        query: ({ id, ...body }) => ({
          url: `/PP/${id}`,
          method: 'PUT',
          body
        }),
        invalidatesTags: (result, error, { id }) => [{ type: 'PP' as const, id }]
      }),
      deletePP: builder.mutation<void, string>({
        query: (id) => ({
          url: `/PP/${id}`,
          method: 'DELETE'
        }),
        invalidatesTags: (result, error, id) => [{ type: 'PP' as const, id }]
      })
    })
  });
  
  export const {
    useGetPPsQuery,
    useGetPPQuery,
    useCreatePPMutation,
    useUpdatePPMutation,
    useDeletePPMutation
  } = PPApi;
  