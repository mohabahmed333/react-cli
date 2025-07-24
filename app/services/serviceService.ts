// src/services/serviceApi.ts
  import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
  
  export interface Service {
    id: string;
    // Add your service properties here
  }
  
  export interface ApiError {
    status: number;
    data: { message?: string };
  }
  
  export const serviceApi = createApi({
    reducerPath: 'serviceApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['Service'],
    endpoints: (builder) => ({
      getServices: builder.query<Service[], void>({
        query: () => '/service',
        providesTags: ['Service']
      }),
      getService: builder.query<Service, string>({
        query: (id) => `/service/${id}`,
        providesTags: (result, error, id) => [{ type: 'Service' as const, id }]
      }),
      createService: builder.mutation<Service, Omit<Service, 'id'>>({
        query: (body) => ({
          url: '/service',
          method: 'POST',
          body
        }),
        invalidatesTags: ['Service']
      }),
      updateService: builder.mutation<Service, Partial<Service & { id: string }>>({
        query: ({ id, ...body }) => ({
          url: `/service/${id}`,
          method: 'PUT',
          body
        }),
        invalidatesTags: (result, error, { id }) => [{ type: 'Service' as const, id }]
      }),
      deleteService: builder.mutation<void, string>({
        query: (id) => ({
          url: `/service/${id}`,
          method: 'DELETE'
        }),
        invalidatesTags: (result, error, id) => [{ type: 'Service' as const, id }]
      })
    })
  });
  
  export const {
    useGetServicesQuery,
    useGetServiceQuery,
    useCreateServiceMutation,
    useUpdateServiceMutation,
    useDeleteServiceMutation
  } = serviceApi;
  