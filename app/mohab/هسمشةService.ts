import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { هسمشة_QUERY_KEY } from './constants/queryKeys.ts';

export const api = createApi({
  reducerPath: 'هسمشةApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/هسمشة' }),
  tagTypes: [هسمشة_QUERY_KEY],
  endpoints: (builder) => ({
    getهسمشةs: builder.query<any, void>({
      query: () => '',
      providesTags: [هسمشة_QUERY_KEY],
    }),
    createهسمشة: builder.mutation<any, any>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [هسمشة_QUERY_KEY],
    }),
    updateهسمشة: builder.mutation<any, any>({
      query: (data) => ({
        url: '',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [هسمشة_QUERY_KEY],
    }),
    deleteهسمشة: builder.mutation<any, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [هسمشة_QUERY_KEY],
    }),
  })
});
