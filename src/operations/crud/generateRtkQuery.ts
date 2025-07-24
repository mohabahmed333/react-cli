interface RtkQueryTemplateParams {
  Resource: string;
  importPath: string;
  errorHandler?: string;
}

export function generateRtkQueryCrudTS({ Resource, importPath }: RtkQueryTemplateParams) {
  const keyConst = `${Resource.toUpperCase()}_QUERY_KEY`;
  return `
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ${keyConst} } from '${importPath}';

export const api = createApi({
  reducerPath: '${Resource.toLowerCase()}Api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/${Resource.toLowerCase()}' }),
  tagTypes: [${keyConst}],
  endpoints: (builder) => ({
    // ...endpoints here, use ${keyConst} for providesTags/invalidatesTags
  })
});
`;
} 