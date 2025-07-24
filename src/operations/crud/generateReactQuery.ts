import { AxiosCrudTemplateParams } from "./generateAxios";
import { generateAxiosHandlerTS, generateErrorHandlerTS } from "./generateErrorHandling";

interface ReactQueryTemplateParams {
  Resource: string;
  importPath: string;
  errorHandler?: string;
}

export function generateReactQueryCrudTS({ Resource, importPath }: ReactQueryTemplateParams) {
  const keyConst = `${Resource.toUpperCase()}_QUERY_KEY`;
  return `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ${keyConst} } from '${importPath}';

export function useGet${Resource}s() {
  return useQuery([${keyConst}], async () => {
    // ...fetch logic
  });
}

export function useCreate${Resource}() {
  const queryClient = useQueryClient();
  return useMutation(
    async (data) => {
      // ...create logic
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([${keyConst}]);
      },
    }
  );
}

export function useUpdate${Resource}() {
  const queryClient = useQueryClient();
  return useMutation(
    async (data) => {
      // ...update logic
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([${keyConst}]);
      },
    }
  );
}

export function useDelete${Resource}() {
  const queryClient = useQueryClient();
  return useMutation(
    async (id) => {
      // ...delete logic
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([${keyConst}]);
      },
    }
  );
}
`;
}