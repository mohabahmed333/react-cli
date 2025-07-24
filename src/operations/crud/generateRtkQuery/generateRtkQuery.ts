interface RtkQueryTemplateParams {
  Resource: string;
  importPath: string;
  errorHandler?: string;
}

export function generateRtkQueryCrudTS({ Resource, importPath }: RtkQueryTemplateParams) {
  const keyConst = `${Resource.toUpperCase()}_QUERY_KEY`;
  return `import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ${keyConst} } from '${importPath}';

export const api = createApi({
  reducerPath: '${Resource.toLowerCase()}Api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/${Resource.toLowerCase()}' }),
  tagTypes: [${keyConst}],
  endpoints: (builder) => ({
    get${Resource}s: builder.query<any, void>({
      query: () => '',
      providesTags: [${keyConst}],
    }),
    create${Resource}: builder.mutation<any, any>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [${keyConst}],
    }),
    update${Resource}: builder.mutation<any, any>({
      query: (data) => ({
        url: '',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [${keyConst}],
    }),
    delete${Resource}: builder.mutation<any, string>({
      query: (id) => ({
        url: \`/$\{id\}\`,
        method: 'DELETE',
      }),
      invalidatesTags: [${keyConst}],
    }),
  })
});
`;
}
 
 