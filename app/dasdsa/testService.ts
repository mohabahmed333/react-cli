// src/services/testService.ts
  import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
  import axios, { AxiosError } from 'axios';
  
  
  const API_URL = '/api/test';
  
  export interface Test {
    id: string;
    // Add your test properties here
  }
  
  export interface ApiError {
    message: string;
    status?: number;
  }
  
  
  function handleTestError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      };
      throw apiError;
    }
    throw new Error(`Unknown Test error: ${String(error)}`);
  }
  
  const fetchTests = async (): Promise<Test[]> => {
    
    try {
      const response = await axios.get<Test>(API_URL);
      return response.data;
    } catch (error) {
      handleTestError(error);
    }
  };
  
  export const useTests = (options?: Omit<UseQueryOptions<Test[], ApiError>, 'queryKey' | 'queryFn'>) => {
    return useQuery<Test[], ApiError>(
      ['tests'],
      fetchTests,
      {
        onError: (error: AxiosError<ApiError>) => {
          console.error(error);
        },
        ...options
      }
    );
  };
  
  export const useCreateTest = (options?: Omit<UseMutationOptions<Test, ApiError, Omit<Test, 'id'>>, 'mutationFn'>) => {
    const queryClient = useQueryClient();
    
    return useMutation<Test, ApiError, Omit<Test, 'id'>>(
      (data) => axios.post(API_URL, data).then(res => res.data),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['tests']);
        },
        onError: (error: AxiosError<ApiError>) => {
          console.error(error);
        },
        ...options
      }
    );
  };
  
  // Similar for update, delete, and getById...
  