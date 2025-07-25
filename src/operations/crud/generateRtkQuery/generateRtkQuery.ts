interface RtkQueryTemplateParams {
  Resource: string;
  importPath: string;
  errorHandler?: string;
}

export function generateRtkQueryCrudTS({ Resource, importPath }: RtkQueryTemplateParams) {
  const keyConst = `${Resource.toUpperCase()}_QUERY_KEY`;
  return `import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ${keyConst} } from '${importPath}';

export interface ${Resource} {
  id: string;
  [key: string]: string;
}

export interface Create${Resource}Dto extends Omit<${Resource}, 'id'> {}
export interface Update${Resource}Dto extends Partial<${Resource}> {
  id: string;
}

export const api = createApi({
  reducerPath: '${Resource.toLowerCase()}Api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/${Resource.toLowerCase()}' }),
  tagTypes: [${keyConst}],
  endpoints: (builder) => ({
    get${Resource}s: builder.query<${Resource}[], void>({
      query: () => '',
      providesTags: [${keyConst}],
    }),
    create${Resource}: builder.mutation<${Resource}, Create${Resource}Dto>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [${keyConst}],
    }),
    update${Resource}: builder.mutation<${Resource}, Update${Resource}Dto>({
      query: (data) => ({
        url: \`/$\{data.id\}\`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [${keyConst}],
    }),
    delete${Resource}: builder.mutation<void, string>({
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
 
 