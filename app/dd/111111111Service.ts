// src/services/111111111Api.ts
  import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
  
  export interface 111111111 {
    id: string;
    // Add your 111111111 properties here
  }
  
  export interface ApiError {
    status: number;
    data: { message?: string };
  }
  
  export const 111111111Api = createApi({
    reducerPath: '111111111Api',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['111111111'],
    endpoints: (builder) => ({
      get111111111s: builder.query<111111111[], void>({
        query: () => '/111111111',
        providesTags: ['111111111']
      }),
      get111111111: builder.query<111111111, string>({
        query: (id) => `/111111111/${id}`,
        providesTags: (result, error, id) => [{ type: '111111111' as const, id }]
      }),
      create111111111: builder.mutation<111111111, Omit<111111111, 'id'>>({
        query: (body) => ({
          url: '/111111111',
          method: 'POST',
          body
        }),
        invalidatesTags: ['111111111']
      }),
      update111111111: builder.mutation<111111111, Partial<111111111 & { id: string }>>({
        query: ({ id, ...body }) => ({
          url: `/111111111/${id}`,
          method: 'PUT',
          body
        }),
        invalidatesTags: (result, error, { id }) => [{ type: '111111111' as const, id }]
      }),
      delete111111111: builder.mutation<void, string>({
        query: (id) => ({
          url: `/111111111/${id}`,
          method: 'DELETE'
        }),
        invalidatesTags: (result, error, id) => [{ type: '111111111' as const, id }]
      })
    })
  });
  
  export const {
    useGet111111111sQuery,
    useGet111111111Query,
    useCreate111111111Mutation,
    useUpdate111111111Mutation,
    useDelete111111111Mutation
  } = 111111111Api;
  