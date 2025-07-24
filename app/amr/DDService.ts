// src/services/DDApi.ts
  import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
  
  export interface DD {
    id: string;
    // Add your DD properties here
  }
  
  export interface ApiError {
    status: number;
    data: { message?: string };
  }
  
  export const DDApi = createApi({
    reducerPath: 'DDApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['DD'],
    endpoints: (builder) => ({
      getDDs: builder.query<DD[], void>({
        query: () => '/DD',
        providesTags: ['DD']
      }),
      getDD: builder.query<DD, string>({
        query: (id) => `/DD/${id}`,
        providesTags: (result, error, id) => [{ type: 'DD' as const, id }]
      }),
      createDD: builder.mutation<DD, Omit<DD, 'id'>>({
        query: (body) => ({
          url: '/DD',
          method: 'POST',
          body
        }),
        invalidatesTags: ['DD']
      }),
      updateDD: builder.mutation<DD, Partial<DD & { id: string }>>({
        query: ({ id, ...body }) => ({
          url: `/DD/${id}`,
          method: 'PUT',
          body
        }),
        invalidatesTags: (result, error, { id }) => [{ type: 'DD' as const, id }]
      }),
      deleteDD: builder.mutation<void, string>({
        query: (id) => ({
          url: `/DD/${id}`,
          method: 'DELETE'
        }),
        invalidatesTags: (result, error, id) => [{ type: 'DD' as const, id }]
      })
    })
  });
  
  export const {
    useGetDDsQuery,
    useGetDDQuery,
    useCreateDDMutation,
    useUpdateDDMutation,
    useDeleteDDMutation
  } = DDApi;
  