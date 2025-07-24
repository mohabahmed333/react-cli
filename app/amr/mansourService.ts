import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { MANSOUR_QUERY_KEY } from './constants/queryKeys.ts';

export const api = createApi({
  reducerPath: 'mansourApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/mansour' }),
  tagTypes: [MANSOUR_QUERY_KEY],
  endpoints: (builder) => ({
    getMansours: builder.query<any, void>({
      query: () => '',
      providesTags: [MANSOUR_QUERY_KEY],
    }),
    createMansour: builder.mutation<any, any>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [MANSOUR_QUERY_KEY],
    }),
    updateMansour: builder.mutation<any, any>({
      query: (data) => ({
        url: '',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [MANSOUR_QUERY_KEY],
    }),
    deleteMansour: builder.mutation<any, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [MANSOUR_QUERY_KEY],
    }),
  })
});
