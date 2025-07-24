import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { II_QUERY_KEY } from './constants/queryKeys.ts';

export function useGetIIs() {
  return useQuery([II_QUERY_KEY], async () => {
    // ...fetch logic
  });
}

export function useCreateII() {
  const queryClient = useQueryClient();
  return useMutation(
    async (data) => {
      // ...create logic
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([II_QUERY_KEY]);
      },
    }
  );
}

export function useUpdateII() {
  const queryClient = useQueryClient();
  return useMutation(
    async (data) => {
      // ...update logic
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([II_QUERY_KEY]);
      },
    }
  );
}

export function useDeleteII() {
  const queryClient = useQueryClient();
  return useMutation(
    async (id) => {
      // ...delete logic
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([II_QUERY_KEY]);
      },
    }
  );
}
