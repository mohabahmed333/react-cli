// src/services/youssefApi.ts
  import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
  
  export interface Youssef {
    id: string;
    // Add your youssef properties here
  }
  
  export interface ApiError {
    status: number;
    data: { message?: string };
  }
  
  export const youssefApi = createApi({
    reducerPath: 'youssefApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['Youssef'],
    endpoints: (builder) => ({
      getYoussefs: builder.query<Youssef[], void>({
        query: () => '/youssef',
        providesTags: ['Youssef']
      }),
      getYoussef: builder.query<Youssef, string>({
        query: (id) => `/youssef/${id}`,
        providesTags: (result, error, id) => [{ type: 'Youssef' as const, id }]
      }),
      createYoussef: builder.mutation<Youssef, Omit<Youssef, 'id'>>({
        query: (body) => ({
          url: '/youssef',
          method: 'POST',
          body
        }),
        invalidatesTags: ['Youssef']
      }),
      updateYoussef: builder.mutation<Youssef, Partial<Youssef & { id: string }>>({
        query: ({ id, ...body }) => ({
          url: `/youssef/${id}`,
          method: 'PUT',
          body
        }),
        invalidatesTags: (result, error, { id }) => [{ type: 'Youssef' as const, id }]
      }),
      deleteYoussef: builder.mutation<void, string>({
        query: (id) => ({
          url: `/youssef/${id}`,
          method: 'DELETE'
        }),
        invalidatesTags: (result, error, id) => [{ type: 'Youssef' as const, id }]
      })
    })
  });
  
  export const {
    useGetYoussefsQuery,
    useGetYoussefQuery,
    useCreateYoussefMutation,
    useUpdateYoussefMutation,
    useDeleteYoussefMutation
  } = youssefApi;
  