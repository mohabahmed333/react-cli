
export function generateRtkQueryCrudTS({ resource, Resource }: {
  resource: string;
  Resource: string;
}): string {
    return `// src/services/${resource}Api.ts
  import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
  
  export interface ${Resource} {
    id: string;
    // Add your ${resource} properties here
  }
  
  export interface ApiError {
    status: number;
    data: { message?: string };
  }
  
  export const ${resource}Api = createApi({
    reducerPath: '${resource}Api',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['${Resource}'],
    endpoints: (builder) => ({
      get${Resource}s: builder.query<${Resource}[], void>({
        query: () => '/${resource}',
        providesTags: ['${Resource}']
      }),
      get${Resource}: builder.query<${Resource}, string>({
        query: (id) => \`/${resource}/\${id}\`,
        providesTags: (result, error, id) => [{ type: '${Resource}' as const, id }]
      }),
      create${Resource}: builder.mutation<${Resource}, Omit<${Resource}, 'id'>>({
        query: (body) => ({
          url: '/${resource}',
          method: 'POST',
          body
        }),
        invalidatesTags: ['${Resource}']
      }),
      update${Resource}: builder.mutation<${Resource}, Partial<${Resource} & { id: string }>>({
        query: ({ id, ...body }) => ({
          url: \`/${resource}/\${id}\`,
          method: 'PUT',
          body
        }),
        invalidatesTags: (result, error, { id }) => [{ type: '${Resource}' as const, id }]
      }),
      delete${Resource}: builder.mutation<void, string>({
        query: (id) => ({
          url: \`/${resource}/\${id}\`,
          method: 'DELETE'
        }),
        invalidatesTags: (result, error, id) => [{ type: '${Resource}' as const, id }]
      })
    })
  });
  
  export const {
    useGet${Resource}sQuery,
    useGet${Resource}Query,
    useCreate${Resource}Mutation,
    useUpdate${Resource}Mutation,
    useDelete${Resource}Mutation
  } = ${resource}Api;
  `;
  }